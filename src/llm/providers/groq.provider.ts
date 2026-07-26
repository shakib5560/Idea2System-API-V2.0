import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ILlmProvider } from '../interfaces/llm-provider.interface';

@Injectable()
export class GroqProvider implements ILlmProvider {
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('GROQ_API_KEY'),
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async generateText(
    prompt: string,
    model = 'llama-3.3-70b-versatile',
  ): Promise<string> {
    const response = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response.choices[0]?.message?.content ?? '';
  }

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    schemaName: string,
    model = 'llama-3.3-70b-versatile',
  ): Promise<T> {
    const jsonSchema = zodToJsonSchema(schema, schemaName);

    // Groq requires json_object mode + schema injection for structured outputs
    const systemPrompt = `You are a precise data extraction AI. You must respond ONLY with raw, valid JSON that strictly satisfies the following JSON Schema:
${JSON.stringify(jsonSchema, null, 2)}
Ensure your output exactly matches this schema. Do not wrap the JSON in markdown code blocks or add any conversational text.`;

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
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Groq returned empty response');
    }

    return JSON.parse(content) as T;
  }
}