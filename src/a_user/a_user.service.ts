import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

type UserUpdateData = Partial<{
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  username: string | null;
  passwordHash: string | null;
  emailVerifiedAt: Date | null;
}>;

@Injectable()
export class AUserService {
  private readonly logger = new Logger(AUserService.name);
  private readonly TTL_MS = 300000; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private sanitizeUser(user: User): User {
    const { passwordHash, ...rest } = user;
    return { ...rest, passwordHash: null } as User;
  }

  /**
   * Cached lookup for user by email (~5 min TTL).
   * Strips passwordHash before caching.
   */
  async findByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();
    const cacheKey = `user:email:${normalizedEmail}`;

    try {
      const cachedUser = await this.cacheManager.get<User>(cacheKey);
      if (cachedUser) {
        return cachedUser;
      }
    } catch (error: any) {
      this.logger.warn(`Cache get failed for ${cacheKey}: ${error?.message}`);
    }

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) {
      const sanitized = this.sanitizeUser(user);
      try {
        await this.cacheManager.set(cacheKey, sanitized, this.TTL_MS);
      } catch (error: any) {
        this.logger.warn(`Cache set failed for ${cacheKey}: ${error?.message}`);
      }
      return sanitized;
    }

    return null;
  }

  /**
   * Cached lookup for user by username (~5 min TTL).
   * Strips passwordHash before caching.
   */
  async findByUsername(username: string): Promise<User | null> {
    if (!username) return null;
    const normalizedUsername = username.trim().toLowerCase();
    const cacheKey = `user:username:${normalizedUsername}`;

    try {
      const cachedUser = await this.cacheManager.get<User>(cacheKey);
      if (cachedUser) {
        return cachedUser;
      }
    } catch (error: any) {
      this.logger.warn(`Cache get failed for ${cacheKey}: ${error?.message}`);
    }

    const user = await this.prisma.user.findUnique({ where: { username } });
    if (user) {
      const sanitized = this.sanitizeUser(user);
      try {
        await this.cacheManager.set(cacheKey, sanitized, this.TTL_MS);
      } catch (error: any) {
        this.logger.warn(`Cache set failed for ${cacheKey}: ${error?.message}`);
      }
      return sanitized;
    }

    return null;
  }

  /**
   * Direct PostgreSQL query for login authentication.
   * Returns user with passwordHash intact for credential verification.
   */
  findByIdentifier(identifier: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });
  }

  /**
   * Cached lookup for user by ID (~5 min TTL).
   * Strips passwordHash before caching.
   */
  async findById(id: string): Promise<User | null> {
    if (!id) return null;
    const cacheKey = `user:${id}`;

    try {
      const cachedUser = await this.cacheManager.get<User>(cacheKey);
      if (cachedUser) {
        return cachedUser;
      }
    } catch (error: any) {
      this.logger.warn(`Cache get failed for ${cacheKey}: ${error?.message}`);
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user) {
      const sanitized = this.sanitizeUser(user);
      try {
        await this.cacheManager.set(cacheKey, sanitized, this.TTL_MS);
      } catch (error: any) {
        this.logger.warn(`Cache set failed for ${cacheKey}: ${error?.message}`);
      }
      return sanitized;
    }

    return null;
  }

  async create(data: {
    email?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
    username?: string | null;
    passwordHash?: string | null;
    emailVerifiedAt?: Date | null;
  }): Promise<User> {
    const createdUser = await this.prisma.user.create({ data });
    await this.invalidateUserCache(createdUser);
    return createdUser;
  }

  async update(id: string, data: UserUpdateData): Promise<User> {
    const existingUser = await this.findById(id);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    if (existingUser) {
      await this.invalidateUserCache(existingUser);
    }
    await this.invalidateUserCache(updatedUser);

    return updatedUser;
  }

  private async invalidateUserCache(user: User): Promise<void> {
    const keysToDelete = [`user:${user.id}`];
    if (user.email) {
      keysToDelete.push(`user:email:${user.email.trim().toLowerCase()}`);
    }
    if (user.username) {
      keysToDelete.push(`user:username:${user.username.trim().toLowerCase()}`);
    }

    for (const key of keysToDelete) {
      try {
        await this.cacheManager.del(key);
      } catch (error: any) {
        this.logger.warn(`Cache del failed for ${key}: ${error?.message}`);
      }
    }
  }
}