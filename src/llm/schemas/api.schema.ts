import { z } from 'zod';

const EndpointSchema = z.object({
  method: z.enum([
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
  ]),

  path: z.string(),

  description: z.string(),

  authentication: z.string(),

  request: z.record(z.string(), z.any()),

  response: z.record(z.string(), z.any()),
});

export const APISchema = z.object({
  endpoints: z.array(EndpointSchema),
}).strict();

export type API = z.infer<typeof APISchema>;