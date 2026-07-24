import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export interface CurrentUserIdOptions {
  optional?: boolean;
}

export const CurrentUserId = createParamDecorator(
  (data: CurrentUserIdOptions | undefined, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();
    const user = request?.user;
    if (!user || !user.id) {
      if (data?.optional) {
        return null;
      }
      throw new UnauthorizedException('Authenticated user ID not found');
    }
    return user.id;
  },
);
