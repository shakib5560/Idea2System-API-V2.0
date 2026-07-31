import { AIProvider } from '../enums/llm-provider.enum';
import { PromptTier } from '../enums/prompt-tier.enum';

/**
 * A single candidate routing option: a provider + its preferred model for a given tier.
 */
export interface ModelCandidate {
  provider: AIProvider;
  model: string;
  /** Human-readable label for logging */
  label: string;
}

/**
 * The master routing table.
 *
 * Each tier defines an ordered list of (provider, model) candidates.
 * The router tries them in order — the first healthy, successful one wins.
 *
 * Ordering rationale:
 *  - SIMPLE:   Prefer fastest/cheapest (Gemini Flash → Groq 8B → OpenRouter Haiku)
 *  - MODERATE: Balance speed + quality (Gemini Pro → Groq 70B → OpenRouter Sonnet)
 *  - COMPLEX:  Prioritise capability (Gemini Ultra → OpenRouter Opus → Groq 70B)
 */
export const MODEL_ROUTING_TABLE: Record<PromptTier, ModelCandidate[]> = {
  [PromptTier.SIMPLE]: [
    {
      provider: AIProvider.GEMINI,
      model: 'gemini-2.0-flash',
      label: 'Gemini 2.0 Flash',
    },
    {
      provider: AIProvider.GROQ,
      model: 'llama-3.1-8b-instant',
      label: 'Groq Llama 3.1 8B',
    },
    {
      provider: AIProvider.OPENROUTER,
      model: 'anthropic/claude-3-haiku',
      label: 'OpenRouter Claude-3 Haiku',
    },
  ],

  [PromptTier.MODERATE]: [
    {
      provider: AIProvider.GEMINI,
      model: 'gemini-2.5-flash',
      label: 'Gemini 2.5 Flash',
    },
    {
      provider: AIProvider.GROQ,
      model: 'llama-3.3-70b-versatile',
      label: 'Groq Llama 3.3 70B',
    },
    {
      provider: AIProvider.OPENROUTER,
      model: 'anthropic/claude-3-5-sonnet',
      label: 'OpenRouter Claude-3.5 Sonnet',
    },
  ],

  [PromptTier.COMPLEX]: [
    {
      provider: AIProvider.GEMINI,
      model: 'gemini-2.5-pro',
      label: 'Gemini 2.5 Pro',
    },
    {
      provider: AIProvider.OPENROUTER,
      model: 'anthropic/claude-opus-4',
      label: 'OpenRouter Claude Opus 4',
    },
    {
      provider: AIProvider.GROQ,
      model: 'llama-3.3-70b-versatile',
      label: 'Groq Llama 3.3 70B (fallback)',
    },
  ],
};
