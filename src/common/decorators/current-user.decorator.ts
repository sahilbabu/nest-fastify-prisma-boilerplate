import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest, RouteGenericInterface } from 'fastify';
import { User } from 'src/generated/client';

export type CurrentUserType = User

export const CurrentUser = createParamDecorator<keyof CurrentUserType | undefined>((data: keyof CurrentUserType | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<FastifyRequest<RouteGenericInterface> & { user: CurrentUserType }>();
  const user = request?.["user"];

  if (data) {
    return user?.[data];
  }
  return user;
});
