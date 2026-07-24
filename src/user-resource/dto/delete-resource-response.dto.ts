import { ApiProperty } from '@nestjs/swagger';

export class DeleteResourceResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Resource with ID "res_123" successfully deleted' })
  message: string;
}
