import pino, { LoggerOptions } from 'pino';

const { AWS_LAMBDA_FUNCTION_NAME, AWS_LAMBDA_LOG_STREAM_NAME, PINO_LOG_LEVEL, IS_OFFLINE } = process.env;

const options: LoggerOptions = IS_OFFLINE
  ? {
      level: 'trace',
    }
  : {
      base: {
        lambdaName: AWS_LAMBDA_FUNCTION_NAME,
        logStream: AWS_LAMBDA_LOG_STREAM_NAME,
      },
      level: PINO_LOG_LEVEL || 'info',
    };

export const log = pino(options);
