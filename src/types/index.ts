// Generic types to be shared across functions
import type { AWS } from '@serverless/typescript';

/**
 * Type for the handler of a serverless function
 */
export type ServerlessAWSFunctionHandler = NonNullable<AWS['functions']>[keyof AWS['functions']];
