import { z } from 'zod';

/**
 * Zod types for quest input
 */
const accessConditionSchema = z.object({
  type: z.enum(['discordRole', 'date', 'level']),
  operator: z.union([
    z.enum(['contains', 'notContains']).describe('discordRole operator'),
    z.enum(['>', '<']).describe('date or level operator'),
  ]),
  value: z.string().describe('Value to be checked against'),
});

const userDataSchema = z.object({
  completed_quests: z.array(z.string().uuid()),
  discordRoles: z.array(z.string()),
  level: z.number().positive(),
});

/**
 * @description Main schema for the provided JSON structure.
 */
export const ClaimQuestZod = z.object({
  questId: z.string().uuid(),
  userId: z.string().uuid(),
  claimed_at: z.string().datetime({ offset: true }),
  access_condition: z.array(accessConditionSchema),
  user_data: userDataSchema,
  submission_text: z.string(),
});
export type ClaimQuest = z.infer<typeof ClaimQuestZod>;
