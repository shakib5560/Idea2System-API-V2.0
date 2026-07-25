import { z } from 'zod';
import {
  RecommendationSchema,
  RiskSchema,
} from './shared.schema';

export const OptimizeIdeaSchema = z.object({
  productName: z.string(),

  summary: z.string(),

  problem: z.string(),

  targetUsers: z.array(z.string()),

  valueProposition: z.string(),

  coreFeatures: z.array(z.string()),

  optionalFeatures: z.array(z.string()),

  risks: z.array(RiskSchema),

  recommendations: z.array(RecommendationSchema),
}).strict();

export type OptimizeIdea = z.infer<typeof OptimizeIdeaSchema>;