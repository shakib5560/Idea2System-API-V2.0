import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiProvider {
  private readonly ai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.getOrThrow<string>('GEMINI_API_KEY'),
    });
  }

  async generateText(
    prompt: string,
    model = 'gemini-3.6-flash',
  ): Promise<string> {
    const response = await this.ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text ?? '';
  }
}