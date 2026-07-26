import { Module } from '@nestjs/common';
import { AUserService } from './a_user.service';

/**
 * AUserModule provides user lookup and management services.
 *
 * Dependencies resolved via global providers:
 *  - PrismaService  → registered globally by @Global() PrismaModule
 *  - CACHE_MANAGER  → registered globally by CacheModule (isGlobal: true)
 *
 * Do NOT re-register PrismaService here — doing so would create a second
 * isolated instance rather than using the application-wide singleton.
 */
@Module({
  providers: [AUserService],
  exports: [AUserService],
})
export class AUserModule {}
