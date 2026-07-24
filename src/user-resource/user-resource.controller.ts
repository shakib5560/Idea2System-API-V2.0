import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../auth/decorators/current-user-id.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserResourceService } from './user-resource.service';
import { UploadFileResourceDto } from './dto/upload-file-resource.dto';
import { ImportUrlResourceDto } from './dto/import-url-resource.dto';
import { CreateTextResourceDto } from './dto/create-text-resource.dto';
import { QueryUserResourceDto } from './dto/query-user-resource.dto';
import { UserResourceResponseDto } from './dto/user-resource-response.dto';
import { PaginatedUserResourcesResponseDto } from './dto/paginated-user-resources-response.dto';
import { DeleteResourceResponseDto } from './dto/delete-resource-response.dto';


@ApiTags('User Resources')
@ApiBearerAuth()

// All endpoints require authentication by default.
// Public routes are explicitly marked with @Public().
@UseGuards(JwtAuthGuard)
@Controller('user-resources')
export class UserResourceController {
  constructor(private readonly userResourceService: UserResourceService) {}

  // Upload and register a file as a user resource.
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file resource (Requires Authentication)' })
  @ApiBody({
    description: 'File upload with optional display title',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'File to upload' },
        title: { type: 'string', description: 'Optional display title' },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({ description: 'File resource created successfully.', type: UserResourceResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid file payload or file type/size validation failed.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Login required for file upload.' })
  async createFromFile(
    @CurrentUserId() userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // Basic upload validation.
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(pdf|docx?|txt|csv|json|png|jpg|jpeg)$/i }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Body() dto: UploadFileResourceDto,
  ): Promise<UserResourceResponseDto> {
    return this.userResourceService.createFromFile(userId, file, dto);
  }

  // Import external content from a URL.
  @Post('url')
  @ApiOperation({ summary: 'Import a resource from a URL (Requires Authentication)' })
  @ApiCreatedResponse({ description: 'URL resource imported successfully.', type: UserResourceResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid URL payload.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized - Login required for URL import.' })
  async createFromUrl(
    @CurrentUserId() userId: string,
    @Body() dto: ImportUrlResourceDto,
  ): Promise<UserResourceResponseDto> {
    return this.userResourceService.createFromUrl(userId, dto);
  }

  // Allow anonymous users to submit raw text.
  @Public()
  @Post('text')
  @ApiOperation({ summary: 'Create a resource from raw text (Public - No login required)' })
  @ApiCreatedResponse({ description: 'Text resource created successfully.', type: UserResourceResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid text payload.' })
  async createFromText(
    @CurrentUserId({ optional: true }) userId: string | null,
    @Body() dto: CreateTextResourceDto,
  ): Promise<UserResourceResponseDto> {
    return this.userResourceService.createFromText(userId || 'guest', dto);
  }

  // List resources owned by the current user.
  @Get()
  @ApiOperation({ summary: "List authenticated user's resources" })
  @ApiOkResponse({ description: 'Resources retrieved successfully.', type: PaginatedUserResourcesResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  async findAll(
    @CurrentUserId() userId: string,
    @Query() query: QueryUserResourceDto,
  ): Promise<PaginatedUserResourcesResponseDto> {
    return this.userResourceService.findAll(userId, query);
  }

  // Retrieve a single resource.
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single resource by ID' })
  @ApiOkResponse({ description: 'Resource retrieved successfully.', type: UserResourceResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Resource not found.' })
  async findById(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ): Promise<UserResourceResponseDto> {
    return this.userResourceService.findById(userId, id);
  }

  // Permanently remove a resource.
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a resource by ID' })
  @ApiOkResponse({ description: 'Resource deleted successfully.', type: DeleteResourceResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized access.' })
  @ApiNotFoundResponse({ description: 'Resource not found.' })
  async remove(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
  ): Promise<DeleteResourceResponseDto> {
    return this.userResourceService.remove(userId, id);
  }
}