import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ILlmProvider } from '../interfaces/llm-provider.interface';

@Injectable()
export class GeminiProvider implements ILlmProvider {
  private readonly ai: GoogleGenAI;
  private readonly logger = new Logger(GeminiProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.getOrThrow<string>('GEMINI_API_KEY'),
    });
  }

  async generateText(
    prompt: string,
    // Corrected from gemini-3.6-flash which does not exist
    model = 'gemini-3.6-flash',
  ): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text ?? '';
    } catch (error) {
      this.logger.error(`Gemini Error: ${error}`);
      throw error;
    }
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    schemaName: string,
    model = 'gemini-3.6-flash',
  ): Promise<T> {
    const format = zodResponseFormat(schema as any, schemaName);
    const schemaDef = format.json_schema.schema;

    try {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          // @google/genai natively accepts JSON Schema definitions
          responseSchema: schemaDef as any, 
        },
      });

      const content = response.text;
      if (!content) {
        throw new Error('Gemini returned empty response');
      }

      return JSON.parse(content) as T;
    } catch (error) {
      this.logger.error(`Gemini Structured Error: ${error}`);
      throw error;
    }
  }
}