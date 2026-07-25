import {
  Injectable,
  Logger,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

/**
 * Provider for interacting with OpenRouter LLM API.
 */
@Injectable()
export class OpenRouterProvider {
  private readonly logger = new Logger(OpenRouterProvider.name);
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENROUTER_API_KEY'),
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': this.configService.get<string>(
          'OPENROUTER_SITE_URL',
          'http://localhost:5000',
        ),
        'X-Title': this.configService.get<string>(
          'OPENROUTER_APP_NAME',
          'Idea2System',
        ),
      },
    });
  }

  /**
   * Generates text completion using OpenRouter API.
   *
   * @param prompt The text prompt to send to the model.
   * @param model The model identifier (defaults to 'google/gemini-2.5-flash').
   * @param maxCompletionTokens Optional limit for completion tokens (defaults to 2048).
   * @returns Generated text output.
   * @throws {HttpException | InternalServerErrorException} NestJS exception on API failure.
   */
  async generateText(
    prompt: string,
    model = 'google/gemini-2.5-flash',
    maxCompletionTokens = 2048,
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_completion_tokens: maxCompletionTokens,
      });

      return response.choices[0]?.message?.content ?? '';
    } catch (error: any) {
      this.logger.error(
        `OpenRouter API call failed for model "${model}": ${error?.message || error}`,
        error?.stack,
      );

      if (error instanceof OpenAI.APIError) {
        throw new HttpException(
          `OpenRouter API Error: ${error.message}`,
          error.status || 500,
        );
      }

      throw new InternalServerErrorException(
        `Failed to generate text using OpenRouter: ${error?.message || 'Unknown error'}`,
      );
    }
  }
}