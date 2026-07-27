import { z } from 'zod';
import {
  RecommendationSchema,
  RiskSchema,
} from './shared.schema';

export const OptimizeIdeaSchema = z.object({
  productName: z.string().describe('A catchy, professional, and marketable name for the product based on the idea context.'),

  summary: z.string().describe('An elevator pitch summarizing exactly what the product does, who it is for, and why it exists in 2-3 sentences.'),

  problem: z.string().describe('A clear, critical articulation of the specific problem this product attempts to solve for its users.'),

  targetUsers: z.array(z.string()).describe('Distinct user personas or market segments that will use this product (e.g., "Freelance Graphic Designers", "Enterprise HR Managers").'),

  valueProposition: z.string().describe('The unique value proposition (UVP) explaining why users will choose this product over existing market alternatives.'),

  coreFeatures: z.array(z.string()).describe('The absolute minimum features required for the Minimum Viable Product (MVP) to be functional and solve the core problem.'),

  optionalFeatures: z.array(z.string()).describe('Nice-to-have features or "scope creep" items that should explicitly be deferred to post-MVP releases.'),

  risks: z.array(RiskSchema).describe('Market, technical, operational, or legal risks associated with building this product.'),

  recommendations: z.array(RecommendationSchema).describe('Strategic recommendations on how to pivot, narrow scope, or improve the core idea before entering the technical requirements phase.'),
}).strict().describe('A refined, expanded, and critically analyzed version of the raw user idea, acting as a professional product brief.');

export type OptimizeIdea = z.infer<typeof OptimizeIdeaSchema>;