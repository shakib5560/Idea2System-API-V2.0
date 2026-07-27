import { z } from 'zod';

const ColumnSchema = z.object({
  name: z.string().describe('The exact column name in snake_case (e.g., "user_id", "created_at").'),

  type: z.string().describe('The specific PostgreSQL data type (e.g., "VARCHAR(255)", "UUID", "INTEGER", "TIMESTAMP WITH TIME ZONE", "JSONB").'),

  nullable: z.boolean().describe('True if the column can contain NULL values, false otherwise. Avoid nullable columns where possible.'),

  unique: z.boolean().describe('True if a UNIQUE constraint should be applied to this column.'),

  primaryKey: z.boolean().describe('True if this column is the primary key (or part of a composite primary key) for the table.'),

  defaultValue: z.string().nullish().describe('The default SQL expression for this column (e.g., "NOW()", "gen_random_uuid()", "0"). Omit if no default.'),
}).describe('Definition of a single database column.');

const TableSchema = z.object({
  name: z.string().describe('The exact table name in snake_case, typically plural (e.g., "users", "order_items").'),

  columns: z.array(ColumnSchema).describe('The list of columns contained within this table. Every table must include a primary key and ideally audit columns (created_at, updated_at).'),
}).describe('Definition of a single relational database table.');

const RelationshipSchema = z.object({
  fromTable: z.string().describe('The source table name (parent table) in snake_case.'),

  toTable: z.string().describe('The target table name (child table) in snake_case.'),

  type: z.enum([
    'ONE_TO_ONE',
    'ONE_TO_MANY',
    'MANY_TO_ONE',
    'MANY_TO_MANY',
  ]).describe('The cardinality of the relationship. Choose carefully based on business rules.'),
  
  foreignKey: z.string().describe('The exact name of the foreign key column in the child table (e.g., "user_id").'),
  
  onDelete: z.enum(['CASCADE', 'RESTRICT', 'SET NULL', 'NO ACTION']).describe('The referential integrity strategy when a parent record is deleted. Use CASCADE for strong ownership, RESTRICT to prevent accidental deletion.'),
  
  throughTable: z.string().nullish().describe('If this is a MANY_TO_MANY relationship, provide the name of the join/junction table (e.g., "user_roles"). Otherwise, omit.'),
}).describe('Definition of a strict foreign key relationship between two tables.');

const IndexSchema = z.object({
  name: z.string().describe('The explicit name of the index in snake_case (e.g., "idx_users_email").'),
  table: z.string().describe('The table this index belongs to.'),
  columns: z.array(z.string()).describe('An array of column names included in this index. Supports composite indexes (multiple columns).'),
  unique: z.boolean().describe('True if this is a unique index, false for a standard performance index.'),
  type: z.enum(['BTREE', 'HASH', 'GIN', 'GiST']).describe('The underlying index type. Default to BTREE for standard queries. Use GIN for JSONB or full-text search.'),
}).describe('Definition of a database index to optimize expected query patterns.');

export const DatabaseSchema = z.object({
  tables: z.array(TableSchema).describe('An array of all tables in the schema. The design must be heavily normalized (3NF) to prevent data anomalies.'),

  relationships: z.array(RelationshipSchema).describe('An array of all foreign key relationships connecting the tables. Every foreign key must reference a valid primary key.'),

  indexes: z.array(IndexSchema).describe('An array of recommended indexes to optimize queries on foreign keys, lookup fields, and unique constraints.'),
}).strict().describe('The complete relational database schema design, optimized for a modern PostgreSQL environment.');

export type Database = z.infer<typeof DatabaseSchema>;