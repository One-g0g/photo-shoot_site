import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { PublicUser } from './auth.types';

export const OptionalCurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PublicUser | null => {
    const request = ctx.switchToHttp().getRequest<{ user?: PublicUser | null }>();
    return request.user ?? null;
  },
);
