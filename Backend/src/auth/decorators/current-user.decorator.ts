import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Usuario } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Usuario | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
