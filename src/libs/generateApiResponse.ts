import { APIGatewayProxyResultV2 } from 'aws-lambda';
import { HTTPStatusCode } from './httpStatusCodes';

interface Headers {
  [header: string]: boolean | number | string;
}

/**
 * @description Generates a valid Amazon-API-Gateway response object (for use with Lambda-PROXY integration)
 *
 * @export
 * @param body A js object or buffer or string to send in the response.body.
 * An `Object` will be JSON stringified and sent with `'Content-Type':'application/json'`
 * The `Buffer` will be Base64 Encoded for you, no default `Content-Type` header will be set
 * A `string` will be sent with `'Content-Type':'text/plain'` unless overwritten
 * @param statusCode The HTTP Status code to respond with (default 200 | OK)
 * @param headers Custom headers to send back in your response Be sure to include Content-Type if sending a `Buffer` or `string`
 * @returns A valid Amazon-API-Gateway response object
 */
export function generateApiResponse(
  body: object | Buffer | string | null,
  statusCode: HTTPStatusCode = 200,
  headers?: Headers
): APIGatewayProxyResultV2 {
  if (body instanceof Buffer)
    return {
      body: body.toString('base64'),
      headers,
      isBase64Encoded: true,
      statusCode,
    };
  if (body === null)
    return {
      body: '',
      headers,
      statusCode,
    };
  if (typeof body === 'object')
    return {
      body: JSON.stringify({ error: statusCode >= 400, ...body }),
      headers: { 'Content-Type': 'application/json', ...headers },
      statusCode,
    };
  return {
    // typeof body === 'string'
    body,
    headers: { 'Content-Type': 'text/plain', ...headers },
    statusCode,
  };
}

/**
 * @description Factory function for adding static headers to all generated responses
 *
 * Returns a custom version of `generateAPIResponse` which adds `staticHeaders` to every request
 * @export
 * @param staticHeaders Add Static headers to all responses generated
 * @returns Custom version of `generateAPIResponse` which adds `staticHeaders` to every request
 */
export function generateApiResponseFactory(staticHeaders: Headers): typeof generateApiResponse {
  return (
    body: object | Buffer | string | null,
    statusCode: HTTPStatusCode = 200,
    headers?: Headers
  ): APIGatewayProxyResultV2 => generateApiResponse(body, statusCode, { ...staticHeaders, ...headers });
}

// HACK: It's okay to put any here since this is typeguard function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isAPIGatewayProxyResultV2(input: any): input is APIGatewayProxyResultV2 {
  return typeof input === 'object' && input !== null && typeof input.statusCode === 'number';
}
