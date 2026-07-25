import { z } from 'zod';
import {
  ComplexitySchema,
} from './shared.schema';

const MilestoneSchema = z.object({
  title: z.string(),

  description: z.string(),

  complexity: ComplexitySchema,
});

const PhaseSchema = z.object({
  name: z.string(),

  milestones: z.array(MilestoneSchema),
});

export const RoadmapSchema = z.object({
  phases: z.array(PhaseSchema),
}).strict();

export type Roadmap = z.infer<typeof RoadmapSchema>;