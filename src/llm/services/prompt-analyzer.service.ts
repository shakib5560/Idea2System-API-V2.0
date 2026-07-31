import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { PromptTier } from '../enums/prompt-tier.enum';

/**
 * Heuristic thresholds for word-count based tier assignment.
 * These can be tuned without touching routing logic.
 */
const WORD_COUNT_MODERATE_THRESHOLD = 80;
const WORD_COUNT_COMPLEX_THRESHOLD = 300;

/**
 * Keywords in the prompt that signal higher complexity requirements.
 * A single keyword match can escalate SIMPLE → MODERATE.
 * Two or more keywords escalate to COMPLEX.
 */
const COMPLEXITY_KEYWORDS: string[] = [
  'architecture',
  'comprehensive',
  'detailed',
  'system design',
  'enterprise',
  'scalable',
  'microservice',
  'distributed',
  'deep dive',
  'explain in depth',
  'elaborate',
  'step by step',
  'complete',
  'full',
  'all scenarios',
  'edge cases',
];

/**
 * Analyzes a prompt and classifies it into a {@link PromptTier}.
 *
 * Classification is purely heuristic — no API calls are made — so latency
 * and cost are zero.
 *
 * Rules (evaluated in order, highest wins):
 *  1. Word count ≥ 300  → COMPLEX
 *  2. Word count ≥ 80   → MODERATE
 *  3. ≥ 2 complexity keywords detected → COMPLEX
 *  4. ≥ 1 complexity keyword detected  → MODERATE
 *  5. Zod schema depth ≥ 3             → COMPLEX
 *  6. Zod schema depth ≥ 2             → MODERATE
 *  7. Otherwise                         → SIMPLE
 */
@Injectable()
export class PromptAnalyzerService {
  private readonly logger = new Logger(PromptAnalyzerService.name);

  /**
   * Classify a prompt (and optional Zod schema) into a PromptTier.
   *
   * @param prompt   The raw prompt string sent to the LLM.
   * @param schema   Optional Zod schema — used to gauge output complexity.
   */
  analyze(prompt: string, schema?: z.ZodType<any>): PromptTier {
    const wordCount = this.estimateWordCount(prompt);
    const keywordMatches = this.countKeywordMatches(prompt);
    const schemaDepth = schema ? this.estimateSchemaDepth(schema) : 0;

    // --- Word count rules (strongest signal) ---
    if (wordCount >= WORD_COUNT_COMPLEX_THRESHOLD) {
      this.logger.debug(
        `Tier=COMPLEX (word count: ${wordCount} ≥ ${WORD_COUNT_COMPLEX_THRESHOLD})`,
      );
      return PromptTier.COMPLEX;
    }

    if (wordCount >= WORD_COUNT_MODERATE_THRESHOLD) {
      this.logger.debug(
        `Tier=MODERATE (word count: ${wordCount} ≥ ${WORD_COUNT_MODERATE_THRESHOLD})`,
      );
      return PromptTier.MODERATE;
    }

    // --- Keyword signal ---
    if (keywordMatches >= 2) {
      this.logger.debug(
        `Tier=COMPLEX (keyword matches: ${keywordMatches})`,
      );
      return PromptTier.COMPLEX;
    }

    if (keywordMatches === 1) {
      this.logger.debug(`Tier=MODERATE (keyword match found)`);
      return PromptTier.MODERATE;
    }

    // --- Schema depth signal ---
    if (schemaDepth >= 3) {
      this.logger.debug(
        `Tier=COMPLEX (schema depth: ${schemaDepth})`,
      );
      return PromptTier.COMPLEX;
    }

    if (schemaDepth >= 2) {
      this.logger.debug(
        `Tier=MODERATE (schema depth: ${schemaDepth})`,
      );
      return PromptTier.MODERATE;
    }

    this.logger.debug(`Tier=SIMPLE (no escalation triggers)`);
    return PromptTier.SIMPLE;
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private estimateWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  private countKeywordMatches(text: string): number {
    const lower = text.toLowerCase();
    return COMPLEXITY_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  }

  /**
   * Naively estimates the nesting depth of a Zod schema by inspecting
   * its internal `_def` tree. Works for ZodObject, ZodArray, ZodUnion.
   * Returns 0 for primitives.
   */
  private estimateSchemaDepth(schema: z.ZodType<any>, depth = 0): number {
    const def = (schema as any)._def;
    if (!def) return depth;

    // ZodObject — recurse into each shape value
    if (def.typeName === 'ZodObject' && def.shape) {
      const shape = typeof def.shape === 'function' ? def.shape() : def.shape;
      const childDepths = Object.values(shape).map((v) =>
        this.estimateSchemaDepth(v as z.ZodType<any>, depth + 1),
      );
      return Math.max(depth, ...childDepths);
    }

    // ZodArray — recurse into element type
    if (def.typeName === 'ZodArray' && def.type) {
      return this.estimateSchemaDepth(def.type, depth + 1);
    }

    // ZodOptional / ZodNullable — unwrap
    if (
      (def.typeName === 'ZodOptional' || def.typeName === 'ZodNullable') &&
      def.innerType
    ) {
      return this.estimateSchemaDepth(def.innerType, depth);
    }

    return depth;
  }
}
