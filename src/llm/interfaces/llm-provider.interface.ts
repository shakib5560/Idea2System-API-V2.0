import { z } from 'zod';

export interface ILlmProvider {
  /**
   * Generates a standard text response.
   */
  generateText(prompt: string, model?: string): Promise<string>;

  /**
   * Generates a structured JSON response matching the provided Zod schema.
   *
   * @param prompt The prompt including context for the LLM.
   * @param schema The Zod schema to enforce.
   * @param schemaName A valid JSON Schema name (no spaces, alphanumeric).
   * @param model The specific model to use (optional).
   */
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    schemaName: string,
    model?: string,
  ): Promise<T>;
}
