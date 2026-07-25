import { z } from 'zod';
import {
  RecommendationSchema,
  RiskSchema,
} from './shared.schema';

export const ReviewSchema = z.object({
  strengths: z.array(z.string()),

  weaknesses: z.array(z.string()),

  missingRequirements: z.array(z.string()),

  risks: z.array(RiskSchema),

  recommendations: z.array(
    RecommendationSchema,
  ),

  overallAssessment: z.string(),
}).strict();

export type Review = z.infer<typeof ReviewSchema>;