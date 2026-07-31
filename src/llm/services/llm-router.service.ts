import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { AIProvider } from '../enums/llm-provider.enum';
import { PromptTier } from '../enums/prompt-tier.enum';
import { ModelCandidate, MODEL_ROUTING_TABLE } from '../config/model-routing.config';
import { AllProvidersFailedError, ProviderFailureDetail } from '../errors/all-providers-failed.error';
import { PromptAnalyzerService } from './prompt-analyzer.service';
import { ProviderHealthService } from './provider-health.service';
import { GeminiProvider } from '../providers/gemini.provider';
import { GroqProvider } from '../providers/groq.provider';
import { OpenRouterProvider } from '../providers/openrouter.provider';
import { ILlmProvider } from '../interfaces/llm-provider.interface';

/** Result returned from a successful smart routing call. */
export interface SmartRouteResult<T> {
  /** The data returned by the LLM. */
  data: T;
  /** Which provider ultimately served the request. */
  provider: AIProvider;
  /** Which model was used. */
  model: string;
  /** Human-readable label, e.g. "Gemini 2.5 Flash". */
  label: string;
  /** The complexity tier that was detected for this prompt. */
  tier: PromptTier;
  /** Number of provider attempts before success. */
  attempts: number;
}

/**
 * Orchestrates intelligent LLM routing with automatic failover.
 *
 * Flow:
 *  1. Analyze prompt → PromptTier (SIMPLE / MODERATE / COMPLEX)
 *  2. Load ranked ModelCandidate list from MODEL_ROUTING_TABLE for that tier
 *  3. Skip candidates whose provider is currently unhealthy
 *  4. Try each candidate in order:
 *     - Success → markSuccess, return result
 *     - Failure → markFailure, log, try next
 *  5. If all candidates fail → throw AllProvidersFailedError
 */
@Injectable()
export class LlmRouterService {
  private readonly logger = new Logger(LlmRouterService.name);

  constructor(
    private readonly promptAnalyzer: PromptAnalyzerService,
    private readonly healthService: ProviderHealthService,
    private readonly gemini: GeminiProvider,
    private readonly groq: GroqProvider,
    private readonly openRouter: OpenRouterProvider,
  ) {}

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Generate a plain text response with automatic provider failover.
   */
  async routeText(prompt: string): Promise<SmartRouteResult<string>> {
    const tier = this.promptAnalyzer.analyze(prompt);
    const candidates = this.getCandidates(tier);

    return this.tryEachCandidate(candidates, tier, (provider, model) =>
      this.resolveProvider(provider).generateText(prompt, model),
    );
  }

  /**
   * Generate a structured (typed) response with automatic provider failover.
   *
   * @param prompt     The prompt string.
   * @param schema     Zod schema describing the expected output shape.
   * @param schemaName A valid JSON-Schema name (alphanumeric, no spaces).
   */
  async routeStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    schemaName: string,
  ): Promise<SmartRouteResult<T>> {
    const tier = this.promptAnalyzer.analyze(prompt, schema);
    const candidates = this.getCandidates(tier);

    return this.tryEachCandidate(candidates, tier, async (provider, model) => {
      const raw = await this.resolveProvider(provider).generateStructured(
        prompt,
        schema,
        schemaName,
        model,
      );
      // Enforce type-safety via Zod — throws if the output doesn't match
      return schema.parse(raw);
    });
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  /**
   * Returns the ordered candidate list for a given tier, filtering out
   * providers that are currently in their cooldown window.
   *
   * If every candidate is unhealthy we still return the full list so the
   * router can attempt them all (the health service will optimistically
   * recover expired cooldowns).
   */
  private getCandidates(tier: PromptTier): ModelCandidate[] {
    const all = MODEL_ROUTING_TABLE[tier];

    const healthy = all.filter((c) => this.healthService.isHealthy(c.provider));

    if (healthy.length === 0) {
      this.logger.warn(
        `All providers for tier ${tier} are unhealthy — attempting all anyway`,
      );
      return all;
    }

    const skipped = all.length - healthy.length;
    if (skipped > 0) {
      this.logger.debug(`Skipping ${skipped} unhealthy provider(s) for tier ${tier}`);
    }

    return healthy;
  }

  /**
   * Core retry loop — iterates through candidates and calls `action`.
   * Collects failure details for the error report if all candidates fail.
   */
  private async tryEachCandidate<T>(
    candidates: ModelCandidate[],
    tier: PromptTier,
    action: (provider: AIProvider, model: string) => Promise<T>,
  ): Promise<SmartRouteResult<T>> {
    const failures: ProviderFailureDetail[] = [];
    let attemptNumber = 0;

    for (const candidate of candidates) {
      attemptNumber++;
      const { provider, model, label } = candidate;

      this.logger.log(
        `[Attempt ${attemptNumber}] Routing to ${label} (tier: ${tier})`,
      );

      try {
        const data = await action(provider, model);
        this.healthService.markSuccess(provider);

        this.logger.log(
          `[Attempt ${attemptNumber}] ✓ Success via ${label}`,
        );

        return { data, provider, model, label, tier, attempts: attemptNumber };
      } catch (error: any) {
        const errorMessage = error?.message ?? String(error);
        this.logger.warn(
          `[Attempt ${attemptNumber}] ✗ ${label} failed: ${errorMessage}`,
        );
        this.healthService.markFailure(provider, errorMessage);
        failures.push({ provider, model, error: errorMessage });
      }
    }

    throw new AllProvidersFailedError(failures);
  }

  /** Maps a provider enum value to its injectable service instance. */
  private resolveProvider(provider: AIProvider): ILlmProvider {
    switch (provider) {
      case AIProvider.GEMINI:
        return this.gemini;
      case AIProvider.GROQ:
        return this.groq;
      case AIProvider.OPENROUTER:
        return this.openRouter;
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
}
