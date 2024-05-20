import { MiddlewareObj } from '@middy/core';
import createHttpError from 'http-errors';
import { APIGatewayProxyEventV2WithJWTAuthorizedUser, ValidatedAPIGatewayProxyEvent } from './validatedHandler';

export function handleUserContext(): MiddlewareObj<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValidatedAPIGatewayProxyEvent<APIGatewayProxyEventV2WithJWTAuthorizedUser, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
> {
  return {
    before: async (handler) => {
      const username = handler.event.requestContext.authorizer.jwt.claims['username'];
      const userId = handler.event.requestContext.authorizer.jwt.claims['sub'];

      if (!username || !userId || typeof username !== 'string' || typeof userId !== 'string') {
        throw new createHttpError.Unauthorized('Missing necessary claims');
      }

      handler.event.requestContext.authorizer.jwt.username = username;
      handler.event.requestContext.authorizer.jwt.userId = userId;
    },
  };
}
