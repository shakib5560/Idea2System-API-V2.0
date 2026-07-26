import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
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
    model = 'gemini-2.5-flash',
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
    model = 'gemini-2.5-flash',
  ): Promise<T> {
    const jsonSchema = zodToJsonSchema(schema, schemaName);
    
    // Extract the main definition that zod-to-json-schema creates
    const schemaDef = jsonSchema.definitions?.[schemaName] || jsonSchema;

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