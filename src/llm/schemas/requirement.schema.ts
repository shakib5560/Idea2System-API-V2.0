import { z } from 'zod';

export const RequirementSchema = z.object({
  functional: z.array(z.string()).describe('Specific behaviors or functions the system must support (e.g., "The system must allow users to reset their password via email link"). Be extremely precise and exhaustive.'),

  nonFunctional: z.array(z.string()).describe('System attributes such as performance, security, usability, and reliability (e.g., "API response time must be under 200ms", "All passwords must be hashed using Argon2").'),

  businessRules: z.array(z.string()).describe('Core business logic and constraints that dictate how the system operates (e.g., "Users must be at least 18 years old to register", "A user can only have one active subscription").'),

  assumptions: z.array(z.string()).describe('Key assumptions made about the environment, user behavior, or third-party dependencies during requirements generation. These highlight potential risks if proven false.'),

  constraints: z.array(z.string()).describe('Technical, legal, or timeline limitations imposed on the system design (e.g., "Must be hosted on AWS", "Must comply with GDPR data deletion policies").'),
}).strict().describe('A comprehensive breakdown of system requirements derived from the raw project idea, separating functional needs from business rules and constraints.');

export type Requirement = z.infer<typeof RequirementSchema>;