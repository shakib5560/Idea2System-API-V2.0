import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';
import { OpenRouterProvider } from './providers/openrouter.provider';

@Module({
  controllers: [LlmController],
  providers: [LlmService, GeminiProvider, GroqProvider, OpenRouterProvider],
  exports: [LlmService, GeminiProvider, GroqProvider, OpenRouterProvider],
})
export class LlmModule {}
