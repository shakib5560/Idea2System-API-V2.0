import { Test, TestingModule } from '@nestjs/testing';
import { UserResourceController } from './user-resource.controller';
import { UserResourceService } from './user-resource.service';
import { ResourceType } from './dto/user-resource-response.dto';

describe('UserResourceController', () => {
  let controller: UserResourceController;
  let service: UserResourceService;

  const mockUserId = 'usr_123456';

  const mockService = {
    createFromFile: jest.fn(),
    createFromUrl: jest.fn(),
    createFromText: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserResourceController],
      providers: [
        {
          provide: UserResourceService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UserResourceController>(UserResourceController);
    service = module.get<UserResourceService>(UserResourceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createFromFile', () => {
    it('should call service.createFromFile with userId, file, and dto', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        size: 1024,
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const dto = { title: 'Test PDF' };
      const expectedResult = {
        id: 'res_1',
        userId: mockUserId,
        type: ResourceType.FILE,
        title: 'Test PDF',
        fileName: 'test.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.createFromFile.mockResolvedValue(expectedResult);

      const result = await controller.createFromFile(mockUserId, mockFile, dto);

      expect(mockService.createFromFile).toHaveBeenCalledWith(mockUserId, mockFile, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createFromUrl', () => {
    it('should call service.createFromUrl with userId and dto', async () => {
      const dto = { url: 'https://example.com/article', title: 'Example' };
      const expectedResult = {
        id: 'res_2',
        userId: mockUserId,
        type: ResourceType.URL,
        title: 'Example',
        url: dto.url,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.createFromUrl.mockResolvedValue(expectedResult);

      const result = await controller.createFromUrl(mockUserId, dto);

      expect(mockService.createFromUrl).toHaveBeenCalledWith(mockUserId, dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createFromText (Public / Guest)', () => {
    it('should call service.createFromText with userId when user is authenticated', async () => {
      const dto = { title: 'Note', content: 'Sample text' };
      const expectedResult = {
        id: 'res_3',
        userId: mockUserId,
        type: ResourceType.TEXT,
        title: dto.title,
        content: dto.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.createFromText.mockResolvedValue(expectedResult);

      const result = await controller.createFromText(mockUserId, dto);

      expect(mockService.createFromText).toHaveBeenCalledWith(mockUserId, dto);
      expect(result).toEqual(expectedResult);
    });

    it('should call service.createFromText with "guest" when unauthenticated (public access)', async () => {
      const dto = { title: 'Guest Note', content: 'Public text content' };
      const expectedResult = {
        id: 'res_guest_1',
        userId: 'guest',
        type: ResourceType.TEXT,
        title: dto.title,
        content: dto.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.createFromText.mockResolvedValue(expectedResult);

      const result = await controller.createFromText(null, dto);

      expect(mockService.createFromText).toHaveBeenCalledWith('guest', dto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with userId and query', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResult = { data: [], total: 0, page: 1, limit: 10 };

      mockService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(mockUserId, query);

      expect(mockService.findAll).toHaveBeenCalledWith(mockUserId, query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findById', () => {
    it('should call service.findById with userId and resource id', async () => {
      const resourceId = 'res_1';
      const expectedResult = {
        id: resourceId,
        userId: mockUserId,
        type: ResourceType.TEXT,
        title: 'Note',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.findById.mockResolvedValue(expectedResult);

      const result = await controller.findById(mockUserId, resourceId);

      expect(mockService.findById).toHaveBeenCalledWith(mockUserId, resourceId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should call service.remove with userId and resource id', async () => {
      const resourceId = 'res_1';
      const expectedResult = { success: true, message: 'Deleted' };

      mockService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(mockUserId, resourceId);

      expect(mockService.remove).toHaveBeenCalledWith(mockUserId, resourceId);
      expect(result).toEqual(expectedResult);
    });
  });
});
