import { MiddlewareObj } from '@middy/core';
import createHttpError from 'http-errors';
import { ZodError, ZodSchema } from 'zod';

export function zodValidator<T>(
  schema?: ZodSchema<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Required<Pick<MiddlewareObj<any, any>, 'before'>> {
  return {
    before: async (request) => {
      if (!schema) return;

      try {
        await schema.parseAsync(request.event.body); // NOTE: requires that the body is parsed already.
      } catch (error) {
        if (error instanceof ZodError) throw new createHttpError.BadRequest(error.message);
        throw new createHttpError.InternalServerError(JSON.stringify(error));
      }
    },
  };
}
