import { z } from 'zod';

export const PrioritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]);

export const ComplexitySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
]);

export const RiskLevelSchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
]);

export const AssumptionSchema = z.object({
  description: z.string(),
});

export const RiskSchema = z.object({
  title: z.string(),
  description: z.string(),
  severity: RiskLevelSchema,
});

export const RecommendationSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const TagSchema = z.string();

export const UUIDSchema = z.string();