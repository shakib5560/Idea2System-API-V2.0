import { z } from 'zod';

export const ArchitectureSchema = z.object({
  overview: z.string(),

  components: z.array(
    z.object({
      name: z.string(),
      responsibility: z.string(),
    }),
  ),

  dataFlow: z.array(z.string()),

  technologies: z.array(z.string()),

  security: z.array(z.string()),

  scalability: z.array(z.string()),

  deployment: z.array(z.string()),
}).strict();

export type Architecture = z.infer<
  typeof ArchitectureSchema
>;