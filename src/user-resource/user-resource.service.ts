import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UploadFileResourceDto } from './dto/upload-file-resource.dto';
import { ImportUrlResourceDto } from './dto/import-url-resource.dto';
import { CreateTextResourceDto } from './dto/create-text-resource.dto';
import { QueryUserResourceDto, SortOrder } from './dto/query-user-resource.dto';
import { ResourceType, UserResourceResponseDto } from './dto/user-resource-response.dto';
import { PaginatedUserResourcesResponseDto } from './dto/paginated-user-resources-response.dto';
import { DeleteResourceResponseDto } from './dto/delete-resource-response.dto';

@Injectable()
export class UserResourceService {
  private readonly resources: Map<string, UserResourceResponseDto> = new Map();

  async createFromFile(
    userId: string,
    file: Express.Multer.File,
    dto?: UploadFileResourceDto,
  ): Promise<UserResourceResponseDto> {
    if (!file) {
      throw new BadRequestException('File is required for upload');
    }

    const id = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const resource: UserResourceResponseDto = {
      id,
      userId,
      type: ResourceType.FILE,
      title: dto?.title || file.originalname,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.resources.set(id, resource);
    return resource;
  }

  async createFromUrl(
    userId: string,
    dto: ImportUrlResourceDto,
  ): Promise<UserResourceResponseDto> {
    const id = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const resource: UserResourceResponseDto = {
      id,
      userId,
      type: ResourceType.URL,
      title: dto.title || dto.url,
      url: dto.url,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.resources.set(id, resource);
    return resource;
  }

  async createFromText(
    userId: string,
    dto: CreateTextResourceDto,
  ): Promise<UserResourceResponseDto> {
    const id = `res_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const resource: UserResourceResponseDto = {
      id,
      userId,
      type: ResourceType.TEXT,
      title: dto.title,
      content: dto.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.resources.set(id, resource);
    return resource;
  }

  async findAll(
    userId: string,
    query?: QueryUserResourceDto,
  ): Promise<PaginatedUserResourcesResponseDto> {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const search = query?.search?.toLowerCase();
    const sortBy = query?.sortBy || 'createdAt';
    const sortOrder = query?.sortOrder || SortOrder.DESC;

    let userResources = Array.from(this.resources.values()).filter(
      (res) => res.userId === userId,
    );

    if (search) {
      userResources = userResources.filter(
        (res) =>
          res.title.toLowerCase().includes(search) ||
          (res.content && res.content.toLowerCase().includes(search)) ||
          (res.url && res.url.toLowerCase().includes(search)),
      );
    }

    userResources.sort((a: any, b: any) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';
      if (valA < valB) return sortOrder === SortOrder.ASC ? -1 : 1;
      if (valA > valB) return sortOrder === SortOrder.ASC ? 1 : -1;
      return 0;
    });

    const total = userResources.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = userResources.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      total,
      page,
      limit,
    };
  }

  async findById(userId: string, id: string): Promise<UserResourceResponseDto> {
    const resource = this.resources.get(id);

    if (!resource || resource.userId !== userId) {
      throw new NotFoundException(`Resource with ID "${id}" not found`);
    }

    return resource;
  }

  async remove(userId: string, id: string): Promise<DeleteResourceResponseDto> {
    const resource = await this.findById(userId, id);
    this.resources.delete(resource.id);
    return { success: true, message: `Resource with ID "${id}" successfully deleted` };
  }
}
