import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from '../enums/llm-provider.enum';

/** Detail of a provider's health state — exported for use in controller response types. */
export interface ProviderHealthRecord {
  isHealthy: boolean;
  /** Timestamp (ms) when the provider last failed */
  lastFailedAt: number | null;
  /** Total consecutive failures since last success */
  consecutiveFailures: number;
}

/**
 * Tracks the health state of every registered LLM provider in-memory.
 *
 * A provider is considered **unhealthy** when it has failed within the last
 * `cooldownMs` milliseconds. After the cooldown expires the provider is
 * optimistically treated as healthy again and retried.
 *
 * Configuration:
 *  - `LLM_PROVIDER_COOLDOWN_MS` (env, default 60000 ms)
 */
@Injectable()
export class ProviderHealthService implements OnModuleInit {
  private readonly logger = new Logger(ProviderHealthService.name);
  private readonly cooldownMs: number;
  private readonly registry = new Map<AIProvider, ProviderHealthRecord>();

  constructor(private readonly configService: ConfigService) {
    this.cooldownMs = parseInt(
      this.configService.get<string>(
        'LLM_PROVIDER_COOLDOWN_MS',
        '60000',
      ),
      10,
    );
  }

  onModuleInit() {
    // Pre-populate all known providers as healthy at startup
    for (const provider of Object.values(AIProvider)) {
      this.registry.set(provider, {
        isHealthy: true,
        lastFailedAt: null,
        consecutiveFailures: 0,
      });
    }
    this.logger.log(
      `Provider health tracker initialised. Cooldown: ${this.cooldownMs}ms`,
    );
  }

  /**
   * Returns `true` if the provider is currently considered healthy.
   * A provider that failed within the cooldown window returns `false`.
   */
  isHealthy(provider: AIProvider): boolean {
    const record = this.getRecord(provider);

    if (record.isHealthy) return true;

    // Check if the cooldown has expired — if so, optimistically recover
    const elapsed = Date.now() - (record.lastFailedAt ?? 0);
    if (elapsed >= this.cooldownMs) {
      this.logger.log(
        `Provider ${provider} cooldown expired after ${elapsed}ms — marking healthy`,
      );
      record.isHealthy = true;
      record.consecutiveFailures = 0;
      return true;
    }

    const remaining = Math.round((this.cooldownMs - elapsed) / 1000);
    this.logger.debug(
      `Provider ${provider} still in cooldown (${remaining}s remaining)`,
    );
    return false;
  }

  /**
   * Records a failure for a provider, starting (or extending) its cooldown.
   */
  markFailure(provider: AIProvider, error?: string): void {
    const record = this.getRecord(provider);
    record.isHealthy = false;
    record.lastFailedAt = Date.now();
    record.consecutiveFailures++;

    this.logger.warn(
      `Provider ${provider} marked UNHEALTHY ` +
        `(consecutive failures: ${record.consecutiveFailures}` +
        `${error ? `, reason: ${error}` : ''})`,
    );
  }

  /**
   * Records a success for a provider, clearing any active cooldown.
   */
  markSuccess(provider: AIProvider): void {
    const record = this.getRecord(provider);
    if (!record.isHealthy || record.consecutiveFailures > 0) {
      this.logger.log(
        `Provider ${provider} recovered — marking HEALTHY`,
      );
    }
    record.isHealthy = true;
    record.lastFailedAt = null;
    record.consecutiveFailures = 0;
  }

  /**
   * Returns a snapshot of all provider health states (useful for diagnostics).
   */
  getHealthSnapshot(): Record<string, ProviderHealthRecord & { cooldownRemainingMs: number }> {
    const snapshot: Record<string, any> = {};
    for (const [provider, record] of this.registry.entries()) {
      const elapsed = record.lastFailedAt ? Date.now() - record.lastFailedAt : 0;
      snapshot[provider] = {
        ...record,
        cooldownRemainingMs: record.isHealthy
          ? 0
          : Math.max(0, this.cooldownMs - elapsed),
      };
    }
    return snapshot;
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private getRecord(provider: AIProvider): ProviderHealthRecord {
    if (!this.registry.has(provider)) {
      // Auto-register unknown providers as healthy
      this.registry.set(provider, {
        isHealthy: true,
        lastFailedAt: null,
        consecutiveFailures: 0,
      });
    }
    return this.registry.get(provider)!;
  }
}
