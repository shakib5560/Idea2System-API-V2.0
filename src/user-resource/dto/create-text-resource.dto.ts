import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTextResourceDto {
  @ApiPropertyOptional({
    description: 'Optional title of the text prompt',
    example: 'Meeting Notes - July 2026',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'The raw text prompt',
    example: 'Discussed project architecture and controller design patterns.',
  })
  @IsNotEmpty({ message: 'Prompt is required' })
  @IsString()
  prompt: string;
}
