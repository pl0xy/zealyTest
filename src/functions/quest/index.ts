import { ServerlessAWSFunctionHandler } from 'src/types';
import { handlerPath } from '../../libs/handlerPath';

export const claimQuest: ServerlessAWSFunctionHandler = {
  handler: `${handlerPath(__dirname)}/claimQuest.claimQuest`,
  events: [
    {
      httpApi: {
        method: 'post',
        path: '/quest/claim',
      },
    },
  ],
};
