import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserResourceService } from './user-resource.service';
import { ResourceType } from './dto/user-resource-response.dto';

describe('UserResourceService', () => {
  let service: UserResourceService;
  const userId = 'user_abc';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserResourceService],
    }).compile();

    service = module.get<UserResourceService>(UserResourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromFile', () => {
    it('should throw BadRequestException if file is null', async () => {
      await expect(service.createFromFile(userId, null as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should store and return a file resource', async () => {
      const mockFile = {
        originalname: 'doc.pdf',
        size: 2048,
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const res = await service.createFromFile(userId, mockFile, { title: 'My Doc' });
      expect(res.id).toBeDefined();
      expect(res.userId).toBe(userId);
      expect(res.type).toBe(ResourceType.FILE);
      expect(res.title).toBe('My Doc');
      expect(res.fileName).toBe('doc.pdf');
    });
  });

  describe('createFromUrl', () => {
    it('should store and return a url resource', async () => {
      const dto = { url: 'https://nest.js/docs', title: 'Nest Docs' };
      const res = await service.createFromUrl(userId, dto);
      expect(res.id).toBeDefined();
      expect(res.userId).toBe(userId);
      expect(res.type).toBe(ResourceType.URL);
      expect(res.title).toBe('Nest Docs');
      expect(res.url).toBe(dto.url);
    });
  });

  describe('createFromText', () => {
    it('should store and return a text resource', async () => {
      const dto = { title: 'Notes', content: 'Some raw text content' };
      const res = await service.createFromText(userId, dto);
      expect(res.id).toBeDefined();
      expect(res.userId).toBe(userId);
      expect(res.type).toBe(ResourceType.TEXT);
      expect(res.content).toBe(dto.content);
    });
  });

  describe('findAll', () => {
    it('should return empty list when user has no resources', async () => {
      const result = await service.findAll('non_existent_user');
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should filter resources by user and handle search & pagination', async () => {
      await service.createFromText(userId, { title: 'First Note', content: 'Alpha' });
      await service.createFromText(userId, { title: 'Second Note', content: 'Beta' });
      await service.createFromText('other_user', { title: 'Other Note', content: 'Gamma' });

      const allResult = await service.findAll(userId);
      expect(allResult.total).toBe(2);

      const searchResult = await service.findAll(userId, { search: 'alpha' });
      expect(searchResult.total).toBe(1);
      expect(searchResult.data[0].title).toBe('First Note');
    });
  });

  describe('findById', () => {
    it('should throw NotFoundException for invalid ID', async () => {
      await expect(service.findById(userId, 'invalid_id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return resource if owned by user', async () => {
      const created = await service.createFromText(userId, { title: 'T', content: 'C' });
      const found = await service.findById(userId, created.id);
      expect(found).toEqual(created);
    });
  });

  describe('remove', () => {
    it('should delete resource and confirm removal', async () => {
      const created = await service.createFromText(userId, { title: 'Del', content: 'Content' });
      const deleteRes = await service.remove(userId, created.id);
      expect(deleteRes.success).toBe(true);

      await expect(service.findById(userId, created.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
