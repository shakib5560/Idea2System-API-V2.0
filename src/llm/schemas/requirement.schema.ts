import { z } from 'zod';

export const RequirementSchema = z.object({
  functional: z.array(z.string()),

  nonFunctional: z.array(z.string()),

  businessRules: z.array(z.string()),

  assumptions: z.array(z.string()),

  constraints: z.array(z.string()),
}).strict();

export type Requirement = z.infer<typeof RequirementSchema>;