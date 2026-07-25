import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LlmController } from './llm.controller';
import { GeminiProvider } from './providers/gemini.provider';

@Module({
  controllers: [LlmController],
  providers: [LlmService, GeminiProvider],
  exports: [LlmService, GeminiProvider],
})
export class LlmModule {}
