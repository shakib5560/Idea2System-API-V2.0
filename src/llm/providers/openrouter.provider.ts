import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { ILlmProvider } from '../interfaces/llm-provider.interface';

@Injectable()
export class OpenRouterProvider implements ILlmProvider {
  private readonly client: OpenAI;
  private readonly logger = new Logger(OpenRouterProvider.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENROUTER_API_KEY'),
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://idea2system.com',
        'X-Title': 'Idea2System',
      },
    });
  }

  async generateText(
    prompt: string,
    model = 'anthropic/claude-3-haiku',
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.choices[0]?.message?.content ?? '';
    } catch (error) {
      this.logger.error(`OpenRouter Error: ${error}`);
      throw error;
    }
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    schemaName: string,
    model = 'anthropic/claude-3-haiku',
  ): Promise<T> {
    const format = zodResponseFormat(schema as any, schemaName);
    const jsonSchema = format.json_schema.schema;

    const systemPrompt = `You are a precise data extraction AI. You must respond ONLY with raw, valid JSON that strictly satisfies the following JSON Schema:
${JSON.stringify(jsonSchema, null, 2)}
Ensure your output exactly matches this schema. Do not wrap the JSON in markdown code blocks or add any conversational text.`;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        // Note: Not all OpenRouter models support response_format strict json_object, 
        // but passing the schema in the system prompt covers the fallback automatically.
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('OpenRouter returned empty response');
      }

      return JSON.parse(content) as T;
    } catch (error) {
      this.logger.error(`OpenRouter Structured Error: ${error}`);
      throw error;
    }
  }
}