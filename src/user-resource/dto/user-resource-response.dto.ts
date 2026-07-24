import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ResourceType {
  FILE = 'FILE',
  URL = 'URL',
  TEXT = 'TEXT',
}

export class UserResourceResponseDto {
  @ApiProperty({ example: 'res_123456789' })
  id: string;

  @ApiProperty({ example: 'usr_987654321' })
  userId: string;

  @ApiProperty({ enum: ResourceType, example: ResourceType.FILE })
  type: ResourceType;

  @ApiProperty({ example: 'Q3 Financial Report.pdf' })
  title: string;

  @ApiPropertyOptional({ example: 'https://example.com/article' })
  url?: string;

  @ApiPropertyOptional({ example: 'Sample text content' })
  content?: string;

  @ApiPropertyOptional({ example: 'report.pdf' })
  fileName?: string;

  @ApiPropertyOptional({ example: 1048576 })
  fileSize?: number;

  @ApiPropertyOptional({ example: 'application/pdf' })
  mimeType?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
