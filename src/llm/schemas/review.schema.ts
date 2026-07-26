import { z } from 'zod';
import {
  RecommendationSchema,
  RiskSchema,
} from './shared.schema';

export const ReviewSchema = z.object({
  strengths: z.array(z.string()).description('List of strong architectural decisions and well-designed components in the system blueprint. Be specific.'),

  weaknesses: z.array(z.string()).description('List of structural flaws, tight coupling, performance bottlenecks, missing indexes, or poor tech stack choices. Be highly critical.'),

  missingRequirements: z.array(z.string()).description('List of critical business rules, edge cases, implicit constraints, or unhandled errors that were missed in the previous agent outputs.'),

  risks: z.array(RiskSchema).description('Identified risks (security vulnerabilities, scalability limits, operational overhead) with strict severity ratings.'),

  recommendations: z.array(
    RecommendationSchema,
  ).description('Actionable, precise engineering steps to fix the identified weaknesses, missing requirements, and risks.'),

  overallAssessment: z.string().description('A final, harsh, Senior Staff Engineer level summary evaluating if this complete blueprint is truly ready for production implementation or if it requires a re-run.'),
}).strict().description('A comprehensive QA and consistency check of all generated system blueprints, ensuring all upstream outputs are perfectly aligned.');

export type Review = z.infer<typeof ReviewSchema>;