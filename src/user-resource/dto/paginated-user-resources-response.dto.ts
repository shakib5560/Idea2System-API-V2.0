import { ApiProperty } from '@nestjs/swagger';
import { UserResourceResponseDto } from './user-resource-response.dto';

export class PaginatedUserResourcesResponseDto {
  @ApiProperty({ type: [UserResourceResponseDto] })
  data: UserResourceResponseDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;
}
