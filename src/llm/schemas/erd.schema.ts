import { z } from 'zod';

export const ERDSchema = z.object({
  entities: z.array(z.string()).describe('An array of all entity (table) names present in the database design. Must match the exact table names from the database schema.'),

  relationships: z.array(z.object({
    from: z.string().describe('The source entity (table) name.'),
    to: z.string().describe('The target entity (table) name.'),
    cardinality: z.string().describe('The exact cardinality notation for the relationship (e.g., "1..n", "1..1", "n..m").'),
  })).describe('A list of all relationships mapping the entities together based on foreign keys.'),

  mermaid: z.string().describe('A complete, syntactically valid Mermaid.js string for generating the Entity Relationship Diagram. Start with "erDiagram" and include all entities, their primary/foreign keys, and properly formatted relationship lines. Do not wrap in markdown code blocks.'),
}).strict().describe('The visual Entity Relationship Diagram representation of the database schema.');

export type ERD = z.infer<typeof ERDSchema>;