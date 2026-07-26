import { Module } from '@nestjs/common';
import { LlmGateway } from './llm-gateway.service';
import { LlmController } from './llm.controller';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Module({
  controllers: [LlmController],
  providers: [LlmGateway, GeminiProvider, GroqProvider, OpenRouterProvider],
  exports: [LlmGateway],
})
export class LlmModule {}
