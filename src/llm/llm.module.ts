import { Module } from '@nestjs/common';
import { LlmGateway } from './llm-gateway.service';
import { LlmController } from './llm.controller';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';
import { PromptAnalyzerService } from './services/prompt-analyzer.service';
import { ProviderHealthService } from './services/provider-health.service';
import { LlmRouterService } from './services/llm-router.service';

@Module({
  controllers: [LlmController],
  providers: [
    // Core providers
    GeminiProvider,
    GroqProvider,
    OpenRouterProvider,
    // Smart routing layer
    PromptAnalyzerService,
    ProviderHealthService,
    LlmRouterService,
    // Gateway (depends on all of the above)
    LlmGateway,
  ],
  exports: [LlmGateway],
})
export class LlmModule {}

