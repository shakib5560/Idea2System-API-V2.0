import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UserResourceService } from './user-resource.service';
import { UserResourceController } from './user-resource.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserResourceController],
  providers: [UserResourceService],
  exports: [UserResourceService],
})
export class UserResourceModule {}
