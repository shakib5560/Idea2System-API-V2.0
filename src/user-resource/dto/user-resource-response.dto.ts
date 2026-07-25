import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromptType } from '@prisma/client';

export { PromptType };

export class UserResourceResponseDto {
  @ApiProperty({ example: 'res_123456789' })
  id: string;

  @ApiProperty({ example: 'usr_987654321' })
  userId: string;

  @ApiPropertyOptional({ example: 'Meeting Notes' })
  title?: string;

  @ApiPropertyOptional({ example: 'Discussed architecture options' })
  prompt?: string;

  @ApiProperty({ enum: PromptType, example: PromptType.TEXT })
  inputType: PromptType;

  @ApiPropertyOptional({ example: 'report.pdf' })
  originalFileName?: string;

  @ApiPropertyOptional({ example: 'application/pdf' })
  mimeType?: string;

  @ApiPropertyOptional({ example: 1048576 })
  fileSize?: number;

  @ApiPropertyOptional({ example: 'https://example.com/article' })
  sourceUrl?: string;

  @ApiPropertyOptional({ example: 'Extracted text content from source' })
  extractedText?: string;

  @ApiPropertyOptional({ example: 'Normalized text content for AI processing' })
  normalizedText?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
