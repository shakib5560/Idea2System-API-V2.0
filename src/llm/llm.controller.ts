import { Controller, Post, Body } from '@nestjs/common';
import { LlmGateway } from './llm-gateway.service';
import { OptimizeIdeaSchema } from './schemas/optimize-idea.schema';
import { AIProvider } from './enums/llm-provider.enum';

@Controller('llm')
export class LlmController {
  constructor(private readonly gateway: LlmGateway) {}

  /**
   * Temporary test endpoint to verify structured output generation.
   * In production, controllers should only enqueue jobs.
   */
  @Post('test-structured')
  async testStructuredGeneration(@Body('prompt') prompt: string, @Body('provider') providerName?: string) {
    if (!prompt) {
      return { error: 'Please provide a prompt in the request body.' };
    }

    const provider = Object.values(AIProvider).includes(providerName as AIProvider) 
      ? (providerName as AIProvider) 
      : AIProvider.GEMINI;

    const fullPrompt = `Optimize the following app idea into a product brief:\n\n${prompt}`;

    try {
      const result = await this.gateway.generateStructured(
        fullPrompt,
        OptimizeIdeaSchema,
        'OptimizeIdea',
        provider
      );
      
      return {
        success: true,
        provider,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
