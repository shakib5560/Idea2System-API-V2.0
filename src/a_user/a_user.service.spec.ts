import { Test, TestingModule } from '@nestjs/testing';
import { AUserService } from './a_user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { User } from '@prisma/client';

describe('AUserService', () => {
  let service: AUserService;
  let mockPrismaService: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let mockCacheManager: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: null,
    username: 'testuser',
    passwordHash: 'secret-hash',
    emailVerifiedAt: null,
    emailVerificationTokenHash: null,
    emailVerificationExpiresAt: null,
    emailVerificationSentAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AUserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<AUserService>(AUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return cached user on cache hit', async () => {
      const cached = { ...mockUser, passwordHash: null };
      mockCacheManager.get.mockResolvedValue(cached);

      const result = await service.findById('user-123');

      expect(result).toEqual(cached);
      expect(mockCacheManager.get).toHaveBeenCalledWith('user:user-123');
      expect(mockPrismaService.user.findUnique).not.toHaveBeenCalled();
    });

    it('should query Prisma, sanitize passwordHash, and cache user on cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(result).toEqual({ ...mockUser, passwordHash: null });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'user:user-123',
        { ...mockUser, passwordHash: null },
        300000,
      );
    });

    it('should fallback to Prisma when Cache get throws error (fail-open)', async () => {
      mockCacheManager.get.mockRejectedValue(new Error('Redis connection down'));
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(result).toEqual({ ...mockUser, passwordHash: null });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    it('should query Prisma, sanitize user, and cache on cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('Test@Example.com');

      expect(result).toEqual({ ...mockUser, passwordHash: null });
      expect(mockCacheManager.get).toHaveBeenCalledWith('user:email:test@example.com');
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'user:email:test@example.com',
        { ...mockUser, passwordHash: null },
        300000,
      );
    });
  });

  describe('findByUsername', () => {
    it('should query Prisma, sanitize user, and cache on cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByUsername('TestUser');

      expect(result).toEqual({ ...mockUser, passwordHash: null });
      expect(mockCacheManager.get).toHaveBeenCalledWith('user:username:testuser');
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'user:username:testuser',
        { ...mockUser, passwordHash: null },
        300000,
      );
    });
  });

  describe('create', () => {
    it('should create user in Prisma and invalidate cache keys', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'test@example.com',
        username: 'testuser',
      });

      expect(result).toEqual(mockUser);
      expect(mockCacheManager.del).toHaveBeenCalledWith('user:user-123');
      expect(mockCacheManager.del).toHaveBeenCalledWith('user:email:test@example.com');
      expect(mockCacheManager.del).toHaveBeenCalledWith('user:username:testuser');
    });
  });

  describe('update', () => {
    it('should update user in Prisma and invalidate all associated cache keys', async () => {
      mockCacheManager.get.mockResolvedValue({ ...mockUser, passwordHash: null });
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-123', { name: 'Updated Name' });

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { name: 'Updated Name' },
      });
      expect(mockCacheManager.del).toHaveBeenCalledWith('user:user-123');
      expect(mockCacheManager.del).toHaveBeenCalledWith('user:email:test@example.com');
      expect(mockCacheManager.del).toHaveBeenCalledWith('user:username:testuser');
    });
  });
});

