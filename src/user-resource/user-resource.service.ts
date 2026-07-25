import { Injectable, NotImplementedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadFileResourceDto } from './dto/upload-file-resource.dto';
import { ImportUrlResourceDto } from './dto/import-url-resource.dto';
import { CreateTextResourceDto } from './dto/create-text-resource.dto';
import { QueryUserResourceDto } from './dto/query-user-resource.dto';
import { UserResourceResponseDto } from './dto/user-resource-response.dto';
import { PaginatedUserResourcesResponseDto } from './dto/paginated-user-resources-response.dto';
import { DeleteResourceResponseDto } from './dto/delete-resource-response.dto';

@Injectable()
export class UserResourceService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromFile(
    userId: string,
    file: Express.Multer.File,
    dto?: UploadFileResourceDto,
  ): Promise<UserResourceResponseDto> {
    throw new NotImplementedException('Method createFromFile not implemented.');
  }

  async createFromUrl(
    userId: string,
    dto: ImportUrlResourceDto,
  ): Promise<UserResourceResponseDto> {
    throw new NotImplementedException('Method createFromUrl not implemented.');
  }

  async createFromText(
    userId: string,
    dto: CreateTextResourceDto,
  ): Promise<UserResourceResponseDto> {
    throw new NotImplementedException('Method createFromText not implemented.');
  }

  async findAll(
    userId: string,
    query?: QueryUserResourceDto,
  ): Promise<PaginatedUserResourcesResponseDto> {
    throw new NotImplementedException('Method findAll not implemented.');
  }

  async findById(userId: string, id: string): Promise<UserResourceResponseDto> {
    throw new NotImplementedException('Method findById not implemented.');
  }

  async remove(userId: string, id: string): Promise<DeleteResourceResponseDto> {
    throw new NotImplementedException('Method remove not implemented.');
  }
}
