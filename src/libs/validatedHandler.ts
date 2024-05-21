import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyEventV2WithJWTAuthorizer,
  APIGatewayProxyResultV2,
  Handler,
} from 'aws-lambda';
import { ZodTypeAny, ZodVoid, z } from 'zod';

interface UserInfo {
  username: string;
  userId: string;
}

export interface APIGatewayProxyEventV2WithJWTAuthorizedUser extends APIGatewayProxyEventV2WithJWTAuthorizer {
  requestContext: APIGatewayProxyEventV2WithJWTAuthorizer['requestContext'] & {
    authorizer: {
      jwt: APIGatewayProxyEventV2WithJWTAuthorizer['requestContext']['authorizer']['jwt'] & UserInfo;
    };
  };
}

// NOTE: This type has JWT Authorizer
// TODO: Add more types for public handlers
export type ValidatedAPIGatewayProxyEvent<
  TEvent extends APIGatewayProxyEventV2,
  TBody extends ZodTypeAny = ZodVoid,
> = Omit<TEvent, 'body'> & {
  body: z.infer<TBody>;
};

export type ValidatedEventAPIGatewayProxyHandlerWithJWT<TBody extends ZodTypeAny = ZodVoid> = Handler<
  ValidatedAPIGatewayProxyEvent<APIGatewayProxyEventV2WithJWTAuthorizedUser, TBody>,
  APIGatewayProxyResultV2
>;

export type ValidatedEventAPIGatewayProxyHandler<TBody extends ZodTypeAny = ZodVoid> = Handler<
  ValidatedAPIGatewayProxyEvent<APIGatewayProxyEventV2, TBody>,
  APIGatewayProxyResultV2
>;
