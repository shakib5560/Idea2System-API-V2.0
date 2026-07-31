import { AIProvider } from '../enums/llm-provider.enum';

/** Detail of a single provider failure captured during a routing attempt. */
export interface ProviderFailureDetail {
  provider: AIProvider;
  model: string;
  error: string;
}

/**
 * Thrown by LlmRouterService when every candidate in the routing table
 * has been tried and all have failed.
 */
export class AllProvidersFailedError extends Error {
  public readonly failures: ProviderFailureDetail[];

  constructor(failures: ProviderFailureDetail[]) {
    const summary = failures
      .map((f) => `[${f.provider}/${f.model}]: ${f.error}`)
      .join(' | ');

    super(`All LLM providers failed. Attempts: ${summary}`);

    this.name = 'AllProvidersFailedError';
    this.failures = failures;

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AllProvidersFailedError.prototype);
  }
}
