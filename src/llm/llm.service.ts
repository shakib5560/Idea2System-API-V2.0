import { Injectable } from '@nestjs/common';
import { CreateLlmDto } from './dto/create-llm.dto';
import { UpdateLlmDto } from './dto/update-llm.dto';
import { GeminiProvider } from './providers/gemini.provider';
import { GroqProvider } from './providers/groq.provider';

@Injectable()
export class LlmService {
  constructor(private readonly geminiProvider: GeminiProvider, private readonly groqProvider: GroqProvider) {}
  create(createLlmDto: CreateLlmDto) {
    return 'This action adds a new llm';
  }

  async findAll() {
    const response = await this.geminiProvider.generateText("Hello Gemini How are you ? You are working or not")
    console.log('Response from Gemini:', response);
    return response;
  }

  async findGroq() {
    const response = await this.groqProvider.generateText("Hello Groq How are you ? You are working or not")
    console.log('Response from Groq:', response);
    return response;
  }

  findOne(id: number) {
    return `This action returns a #${id} llm`;
  }

  update(id: number, updateLlmDto: UpdateLlmDto) {
    return `This action updates a #${id} llm`;
  }

  remove(id: number) {
    return `This action removes a #${id} llm`;
  }
}
