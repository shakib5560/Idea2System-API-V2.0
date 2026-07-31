import { Controller, Post, Get, Body } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { LlmGateway } from './llm-gateway.service';
import { OptimizeIdeaSchema } from './schemas/optimize-idea.schema';
import { DatabaseSchema } from './schemas/database.schema';
import { AIProvider } from './enums/llm-provider.enum';
import { ProviderHealthService } from './services/provider-health.service';

@Controller('llm')
export class LlmController {
  constructor(
    private readonly gateway: LlmGateway,
    private readonly healthService: ProviderHealthService,
  ) {}

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

      // Uses smart auto-routing: the deep DatabaseSchema triggers COMPLEX tier,
      // so the router picks the strongest available model and auto-falls over
      // to the next provider if Gemini is rate-limited or unavailable.
      const result = await this.gateway.smartGenerateStructured(
        fullPrompt,
        DatabaseSchema,
        'Database',
      );

      return {
        success: true,
        routing: {
          tier: result.tier,
          provider: result.provider,
          model: result.model,
          label: result.label,
          attempts: result.attempts,
        },
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        // If AllProvidersFailedError, expose per-provider failure details
        failures: (error as any).failures ?? [],
      };
    }
  }

  // ─── Smart auto-routing endpoints ───────────────────────────────────────

  /**
   * POST /llm/smart-generate-text
   *
   * Generates plain text using intelligent auto-routing.
   * The system automatically selects the best provider + model based on
   * prompt complexity and falls over on failures.
   *
   * Body: { prompt: string }
   */
  @Post('smart-generate-text')
  async smartGenerateText(@Body('prompt') prompt: string) {
    if (!prompt) {
      return { error: 'Please provide a prompt in the request body.' };
    }

    try {
      const result = await this.gateway.smartGenerateText(prompt);
      return {
        success: true,
        routing: {
          tier: result.tier,
          provider: result.provider,
          model: result.model,
          label: result.label,
          attempts: result.attempts,
        },
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        failures: error.failures ?? [],
      };
    }
  }

  /**
   * POST /llm/smart-generate
   *
   * Generates structured output using intelligent auto-routing.
   * Uses the OptimizeIdeaSchema as the default structured output target.
   * The system selects the best provider + model for the prompt's complexity
   * and automatically falls over on failures.
   *
   * Body: { prompt: string }
   */
  @Post('smart-generate')
  async smartGenerateStructured(@Body('prompt') prompt: string) {
    if (!prompt) {
      return { error: 'Please provide a prompt in the request body.' };
    }

    const fullPrompt = `Optimize the following app idea into a product brief:\n\n${prompt}`;

    try {
      const result = await this.gateway.smartGenerateStructured(
        fullPrompt,
        OptimizeIdeaSchema,
        'OptimizeIdea',
      );

      return {
        success: true,
        routing: {
          tier: result.tier,
          provider: result.provider,
          model: result.model,
          label: result.label,
          attempts: result.attempts,
        },
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        failures: error.failures ?? [],
      };
    }
  }

  /**
   * GET /llm/provider-health
   *
   * Returns a real-time snapshot of every provider's health state.
   * Useful for monitoring and debugging failover behaviour.
   */
  @Get('provider-health')
  getProviderHealth() {
    return {
      success: true,
      snapshot: this.healthService.getHealthSnapshot(),
    };
  }
}
