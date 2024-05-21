// import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
// import { Quest } from '@db';
import { generateApiResponse, isAPIGatewayProxyResultV2 } from '@libs/generateApiResponse';
import { HTTPStatusCode } from '@libs/httpStatusCodes';
// import { log } from '@libs/log';
import { Quest } from '@db/db';
import { middyfy } from '@libs/middyfy';
import { ValidatedEventAPIGatewayProxyHandler as ValidEvent } from '@libs/validatedHandler';
import createHttpError from 'http-errors';
import { ClaimQuestZod } from './types';
import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';

const { TABLE_NAME } = process.env;

const happyWords: string[] = ['joyful', 'happy', 'vibrant', 'thrilled', 'euphoric', 'cheerful', 'delighted'];
const lightHeartedProfanity = [
  'silly',
  'goose',
  'darn',
  'fudge',
  'shoot',
  'heck',
  'dang',
  'gosh',
  'nuggets',
  'crikey',
  'whoops',
  'jeepers',
  'shucks',
  'bananas',
  'nuts',
  'blimey',
  'crumbs',
  'golly',
  'gee',
  'rats',
  'drat',
];
const punctuationRegex = /[,.?!]/;
const repetitiveSequenceRegex = /^(\w+)\1$/;

export const claimQuestHandler: ValidEvent<typeof ClaimQuestZod> = async (event) => {
  if (!TABLE_NAME) throw new createHttpError.InternalServerError('Table name is not defined');

  try {
    // Check if user meets the access conditions
    event.body.access_condition.forEach((condition) => {
      switch (condition.type) {
        case 'discordRole':
          if (!checkDiscordRole(event.body.user_data.discordRoles, condition.value, condition.operator))
            throw generateApiResponse(
              { status: 'fail', message: 'User does not have the required roles' },
              HTTPStatusCode.BAD_REQUEST
            );
          break;
        case 'date':
          if (!checkDate(new Date(event.body.claimed_at), new Date(condition.value), condition.operator))
            throw generateApiResponse(
              { status: 'fail', message: 'User does not meet the date requirement' },
              HTTPStatusCode.BAD_REQUEST
            );
          break;
        case 'level':
          if (!checkLevel(event.body.user_data.level, parseInt(condition.value), condition.operator))
            throw generateApiResponse(
              { status: 'fail', message: 'User does not meet the level requirement' },
              HTTPStatusCode.BAD_REQUEST
            );
          break;
        default:
          throw generateApiResponse(
            { status: 'fail', message: 'Invalid access condition type' },
            HTTPStatusCode.BAD_REQUEST
          );
      }
    });
  } catch (error) {
    if (isAPIGatewayProxyResultV2(error)) return error;
    return generateApiResponse(error as Error, HTTPStatusCode.INTERNAL_SERVER_ERROR);
  }

  let score: number = 0;
  happyWords.forEach((word) => {
    if (event.body.submission_text.toLowerCase().includes(word)) score++;
  });
  if (score > 3) score = 3; // Cap score at 3 for Happy Words
  if (punctuationRegex.test(event.body.submission_text)) score++;
  for (const word of event.body.submission_text.split(' ')) {
    if (repetitiveSequenceRegex.test(word)) {
      score += 2;
      break;
    }
  }
  lightHeartedProfanity.forEach((word) => {
    if (event.body.submission_text.toLowerCase().includes(word)) score = 0;
  });

  return Quest.put(
    {
      quest: event.body.questId,
      user: event.body.userId,
      score,
    },
    {
      conditions: {
        attr: 'quest',
        exists: false,
      },
    }
  )
    .then(() => generateApiResponse({ status: score >= 5 ? 'success' : 'fail', score }, HTTPStatusCode.OK))
    .catch((error) => {
      if (error instanceof ConditionalCheckFailedException)
        return generateApiResponse({ status: 'fail', message: 'Quest already claimed' }, HTTPStatusCode.BAD_REQUEST);
    });
};

export const claimQuest = middyfy(claimQuestHandler, ClaimQuestZod);

function checkDiscordRole(discordRoles: string[], accessConditionRole: string, operator: string): boolean {
  return operator === 'contains'
    ? discordRoles.includes(accessConditionRole)
    : !discordRoles.includes(accessConditionRole);
}

function checkDate(claimedDate: Date, accessConditionDate: Date, operator: string): boolean {
  return operator === '>' ? claimedDate > accessConditionDate : claimedDate < accessConditionDate;
}

function checkLevel(level: number, accessConditionLevel: number, operator: string): boolean {
  return operator === '>' ? level > accessConditionLevel : level < accessConditionLevel;
}
