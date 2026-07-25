import { z } from 'zod';
import { PrioritySchema } from './shared.schema';

const AcceptanceCriteriaSchema = z.object({
  description: z.string(),
});

const StorySchema = z.object({
  title: z.string(),

  description: z.string(),

  acceptanceCriteria: z.array(
    AcceptanceCriteriaSchema,
  ),

  priority: PrioritySchema,
});

export const UserStorySchema = z.object({
  stories: z.array(StorySchema),
}).strict();

export type UserStory = z.infer<typeof UserStorySchema>;