import { z } from 'zod';

const ColumnSchema = z.object({
  name: z.string(),

  type: z.string(),

  nullable: z.boolean(),

  unique: z.boolean(),

  primaryKey: z.boolean(),

  defaultValue: z.string().optional(),
});

const TableSchema = z.object({
  name: z.string(),

  columns: z.array(ColumnSchema),
});

const RelationshipSchema = z.object({
  fromTable: z.string(),

  toTable: z.string(),

  type: z.enum([
    'ONE_TO_ONE',
    'ONE_TO_MANY',
    'MANY_TO_ONE',
    'MANY_TO_MANY',
  ]),
});

export const DatabaseSchema = z.object({
  tables: z.array(TableSchema),

  relationships: z.array(RelationshipSchema),

  indexes: z.array(z.string()),
}).strict();

export type Database = z.infer<typeof DatabaseSchema>;