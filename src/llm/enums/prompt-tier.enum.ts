/**
 * Represents the complexity tier of a given prompt.
 * Used by the PromptAnalyzerService to route to the most appropriate model.
 */
export enum PromptTier {
  /** Short, simple tasks: summaries, single-field extractions, yes/no answers. */
  SIMPLE = 'SIMPLE',

  /** Mid-complexity tasks: multi-field structured output, moderate reasoning. */
  MODERATE = 'MODERATE',

  /**
   * High-complexity tasks: architecture design, comprehensive analysis,
   * deeply nested schemas, long-context reasoning.
   */
  COMPLEX = 'COMPLEX',
}
