import { z } from 'zod';
import { PrioritySchema } from './shared.schema';

const AcceptanceCriteriaSchema = z.object({
  description: z.string().description('A specific, testable condition that must be met for this story to be considered done. Use Given/When/Then (BDD) format if possible.'),
}).description('A single acceptance criterion for a user story.');

const StorySchema = z.object({
  title: z.string().description('A short, descriptive title for the user story (e.g., "User Registration", "Password Reset").'),

  description: z.string().description('The user story in standard Agile format: "As a [role], I want to [action] so that [benefit]". Clearly define who the user is and what they get out of it.'),

  acceptanceCriteria: z.array(
    AcceptanceCriteriaSchema,
  ).description('A list of testable conditions that QA can use to verify the story is complete and functioning correctly.'),

  priority: PrioritySchema.description('The importance of this story for the MVP release.'),
}).description('A single Agile user story representing a slice of user value.');

export const UserStorySchema = z.object({
  stories: z.array(StorySchema).description('A comprehensive backlog of user stories covering all functional requirements identified for the project.'),
}).strict().description('The complete product backlog consisting of Agile user stories, ready for developer estimation and sprint planning.');

export type UserStory = z.infer<typeof UserStorySchema>;