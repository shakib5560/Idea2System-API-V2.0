import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTextResourceDto {
  @ApiProperty({
    description: 'Title of the raw text resource',
    example: 'Meeting Notes - July 2026',
  })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The raw text content of the resource',
    example: 'Discussed project architecture and controller design patterns.',
  })
  @IsNotEmpty({ message: 'Content is required' })
  @IsString()
  content: string;
}
