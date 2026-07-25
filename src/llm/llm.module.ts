import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';

@Module({
  controllers: [LlmController],
  providers: [LlmService, GeminiProvider, GroqProvider],
  exports: [LlmService, GeminiProvider, GroqProvider],
})
export class LlmModule {}
