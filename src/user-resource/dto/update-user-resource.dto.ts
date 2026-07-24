import { PartialType } from '@nestjs/swagger';
import { CreateUserResourceDto } from './create-user-resource.dto';

export class UpdateUserResourceDto extends PartialType(CreateUserResourceDto) {}
