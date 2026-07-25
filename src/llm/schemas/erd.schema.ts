import { z } from 'zod';

export const ERDSchema = z.object({
  entities: z.array(z.string()),

  relationships: z.array(z.object({
    from: z.string(),
    to: z.string(),
    cardinality: z.string(),
  })),

  mermaid: z.string(),
}).strict();

export type ERD = z.infer<typeof ERDSchema>;