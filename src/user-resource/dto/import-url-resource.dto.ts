import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class ImportUrlResourceDto {
  @ApiProperty({
    description: 'The web URL to import content from',
    example: 'https://example.com/article/123',
  })
  @IsNotEmpty({ message: 'URL is required' })
  @IsUrl({}, { message: 'Must be a valid HTTP/HTTPS URL' })
  url: string;

  @ApiPropertyOptional({
    description: 'Optional title for the imported resource',
    example: 'Awesome Article Title',
  })
  @IsOptional()
  @IsString()
  title?: string;
}
