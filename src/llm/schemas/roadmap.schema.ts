import { z } from 'zod';
import {
  ComplexitySchema,
} from './shared.schema';

const MilestoneSchema = z.object({
  title: z.string().description('A concise, action-oriented title for the milestone (e.g., "Implement JWT User Authentication").'),

  description: z.string().description('A clear explanation of what specific features, APIs, and business value are delivered in this milestone.'),

  complexity: ComplexitySchema.description('The estimated technical effort required to complete this milestone, considering backend, frontend, and infrastructure tasks.'),
}).description('A single, measurable deliverable unit of work within a phase.');

const PhaseSchema = z.object({
  name: z.string().description('The name of the phase (e.g., "Phase 1: MVP Core Pipeline", "Phase 2: Scale and Optimize").'),

  milestones: z.array(MilestoneSchema).description('The logically ordered list of milestones that make up this phase. Earlier milestones should establish dependencies for later ones.'),
}).description('A distinct major stage in the project lifecycle, usually culminating in a releasable increment.');

export const RoadmapSchema = z.object({
  phases: z.array(PhaseSchema).description('An ordered array of project phases, mapping out the entire execution strategy from day zero to production release. Must include an MVP phase.'),
}).strict().description('A strategic engineering roadmap breaking down the architecture and requirements into actionable, sequenced development phases.');

export type Roadmap = z.infer<typeof RoadmapSchema>;