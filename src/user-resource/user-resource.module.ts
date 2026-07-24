import { Module } from '@nestjs/common';
import { UserResourceService } from './user-resource.service';
import { UserResourceController } from './user-resource.controller';

@Module({
  controllers: [UserResourceController],
  providers: [UserResourceService],
  exports: [UserResourceService],
})
export class UserResourceModule {}
