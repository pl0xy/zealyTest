import middy, { type MiddyfiedHandler } from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import inputOutputLogger from '@middy/input-output-logger';
import { ZodSchema } from 'zod';
import { log } from './log';
import { zodValidator } from './zodValidator';

// HACK: Handler is set to any type. this is okay because we know the handler
//       is a lambda function, we don't need the extra safety here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function middyfy(handler: any, schema?: ZodSchema): MiddyfiedHandler {
  const middyStack: MiddyfiedHandler = middy(handler)
    .use(inputOutputLogger({ logger: (message): void => log.trace(message) }))
    .use(httpErrorHandler({ logger: (error): void => log.error(error) }))
    .use(httpHeaderNormalizer({ defaultHeaders: { 'Content-Type': 'application/json' } }))

  if (schema) {
    middyStack.use(middyJsonBodyParser({ disableContentTypeError: false })).use(zodValidator(schema));
  }

  return middyStack;
}
