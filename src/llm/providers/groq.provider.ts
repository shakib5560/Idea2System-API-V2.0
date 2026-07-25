import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class GroqProvider {
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
}