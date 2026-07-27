import { z } from 'zod';

export const PrioritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]).describe('The priority level of the item, indicating its business importance and urgency for development.');

export const ComplexitySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
]).describe('The estimated technical complexity, reflecting effort, external dependencies, and technical difficulty.');

export const RiskLevelSchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
]).describe('The severity level of a risk, indicating its potential impact on the project timeline, security, or stability.');

export const AssumptionSchema = z.object({
  description: z.string().describe('A clear statement of a condition or capability that is assumed to be true for this system to function.'),
}).describe('An assumption made during the system design or requirements gathering phase.');

export const RiskSchema = z.object({
  title: z.string().describe('A concise, descriptive title for the identified risk.'),
  description: z.string().describe('Detailed explanation of the risk, its cause, and the potential consequences.'),
  severity: RiskLevelSchema.describe('The potential impact and likelihood of this risk occurring.'),
}).describe('A potential risk identified in the system architecture, requirements, or planning phase.');

export const RecommendationSchema = z.object({
  title: z.string().describe('A concise, actionable title for the recommendation.'),
  description: z.string().describe('Detailed explanation of the recommendation, including why it should be implemented and the expected benefits.'),
}).describe('An actionable recommendation provided by an AI agent to improve the system design or mitigate risks.');

export const TagSchema = z.string().describe('A short, descriptive tag used for categorization or filtering (e.g., "frontend", "auth", "critical").');

export const UUIDSchema = z.string().uuid().describe('A universally unique identifier (UUID) v4 string.');