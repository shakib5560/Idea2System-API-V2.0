import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadFileResourceDto {
  @ApiPropertyOptional({
    description: 'Optional display title for the uploaded file',
    example: 'Q3 Financial Report.pdf',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Optional description of the resource',
    example: 'PDF document containing Q3 financial data and metrics',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
