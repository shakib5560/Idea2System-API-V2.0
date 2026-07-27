import { Controller, Post, Body } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { LlmGateway } from './llm-gateway.service';
import { OptimizeIdeaSchema } from './schemas/optimize-idea.schema';
import { DatabaseSchema } from './schemas/database.schema';
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

  @Post('dberd')
  async testDatabaseGeneration() {
    try {
      const promptPath = path.join(process.cwd(), 'src', 'llm', 'prompts', 'database.md');
      const promptTemplate = fs.readFileSync(promptPath, 'utf8');
      const fullPrompt = promptTemplate.replace('{{USER_PROMPT}}', 'Database for LMS for NSU');

      const result = await this.gateway.generateStructured(
        fullPrompt,
        DatabaseSchema,
        'Database',
        AIProvider.GEMINI
      );

      return {
        success: true,
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
