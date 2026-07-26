import { Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';
import { AIProvider } from './enums/llm-provider.enum';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Injectable()
export class LlmGateway {
  private readonly logger = new Logger(LlmGateway.name);

  constructor(
    private readonly gemini: GeminiProvider,
    private readonly groq: GroqProvider,
    private readonly openRouter: OpenRouterProvider,
  ) {}

  private getProvider(providerName: AIProvider) {
    switch (providerName) {
      case AIProvider.GEMINI:
        return this.gemini;
      case AIProvider.GROQ:
        return this.groq;
      case AIProvider.OPENROUTER:
        return this.openRouter;
      default:
        return this.gemini;
    }
  }

  async generateText(
    prompt: string,
    provider: AIProvider = AIProvider.GEMINI,
    model?: string,
  ): Promise<string> {
    this.logger.debug(`generateText via ${provider}`);
    const selectedProvider = this.getProvider(provider);
    return selectedProvider.generateText(prompt, model);
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    schemaName: string,
    provider: AIProvider = AIProvider.GEMINI,
    model?: string,
  ): Promise<T> {
    this.logger.debug(`generateStructured via ${provider} for schema ${schemaName}`);
    
    let attempts = 0;
    const maxRetries = 2; // Basic retry policy for structured output
    
    while (attempts <= maxRetries) {
      try {
        const selectedProvider = this.getProvider(provider);
        const rawJson = await selectedProvider.generateStructured(
          prompt,
          schema,
          schemaName,
          model,
        );

        // Enforce absolute type safety via Zod parsing
        return schema.parse(rawJson);
      } catch (error) {
        attempts++;
        this.logger.warn(`Structured generation failed on attempt ${attempts}: ${error}`);
        
        // Fallback logic could be added here (e.g. switch to OpenRouter if Gemini fails twice)
        if (attempts > maxRetries) {
          throw new Error(`Failed to generate valid structured output after ${maxRetries} retries: ${error}`);
        }
      }
    }
    
    throw new Error('Unreachable state in LlmGateway');
  }
}
