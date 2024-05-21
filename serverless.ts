import type { AWS } from '@serverless/typescript';
import { claimQuest } from './src/functions/quest';

export const serverlessConfiguration: AWS = {
  service: 'lfg-serverless-test',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-dynamodb', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    logRetentionInDays: 3,
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      TABLE_NAME: '${self:resources.Resources.LFGTable.Properties.TableName}',
      PINO_LOG_LEVEL: 'trace',
    },
  },
  // NOTE: the configuration for each handler is stored in the handler's parent index.ts file
  functions: {
    claimQuest,
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node20',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    'serverless-dynamodb': {
      start: {
        port: 8000,
        docker: false,
        migrate: true, // create tables if not exist
        inMemory: false,
        dbPath: './.dynamodb',
      },
    },
    'serverless-offline': {
      ignoreJWTSignature: true,
    },
  },
  resources: {
    Resources: {
      LFGTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'ZealyTable',
          BillingMode: 'PROVISIONED',
          ProvisionedThroughput: {
            // Free tier capacity for DynamoDB is 25
            ReadCapacityUnits: 20,
            WriteCapacityUnits: 20,
          },
          AttributeDefinitions: [
            { AttributeName: 'pk', AttributeType: 'S' },
            { AttributeName: 'sk', AttributeType: 'S' },
          ],
          KeySchema: [
            { AttributeName: 'pk', KeyType: 'HASH' },
            { AttributeName: 'sk', KeyType: 'RANGE' },
          ],
          SSESpecification: { SSEEnabled: true },
        },
      },
    },
  },
};
