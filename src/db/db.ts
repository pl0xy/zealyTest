import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { log } from '@libs/log';
import { Entity, Table } from 'dynamodb-toolbox';
import createHttpError from 'http-errors';

const { TABLE_NAME, IS_OFFLINE } = process.env;

if (!TABLE_NAME) throw new createHttpError.InternalServerError('Table name is not defined');

const dynamoDBClient: DynamoDBClient = IS_OFFLINE
  ? new DynamoDBClient({
      endpoint: 'http://localhost:8000',
      region: 'localhost',
      logger: log,
      credentials: {
        accessKeyId: 'MockAccessKeyId',
        secretAccessKey: 'MockSecretAccessKey',
      },
    })
  : new DynamoDBClient();

export const DocumentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: false,
    convertClassInstanceToMap: false,
  },
});

const zealyTable = new Table({
  name: TABLE_NAME,
  partitionKey: 'pk',
  sortKey: 'sk', // All entities will have to have a sort key, even if it's just META
  DocumentClient,
  alias: 'zealyTable',
});

export const Quest = new Entity({
  name: 'Quest',
  attributes: {
    pk: {
      partitionKey: true,
      hidden: true,
      prefix: 'QUEST#',
      default: (data: { quest: string }): string => data.quest,
    },
    sk: {
      hidden: true,
      sortKey: true,
      prefix: 'USER#',
      default: (data: { user: string }): string => data.user,
    },
    quest: { type: 'string', required: true },
    user: { type: 'string', required: true },
    score: { type: 'number', required: true },
  },
  table: zealyTable,
  timestamps: true,
} as const);
