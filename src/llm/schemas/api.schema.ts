import { z } from 'zod';

const EndpointSchema = z.object({
  method: z.enum([
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
  ]).description('The HTTP method for this endpoint. Follow strict RESTful API conventions.'),

  path: z.string().description('The URL path for the endpoint. Must start with a forward slash (/). Use Express-style route parameters (e.g., /users/:userId).'),

  description: z.string().description('A clear explanation of what this endpoint does, its primary purpose, and its business value.'),

  authentication: z.string().description('The authentication and authorization strategy required (e.g., "Public", "JWT Bearer Token (User)", "JWT Bearer Token (Admin)").'),

  request: z.object({
    body: z.record(z.string(), z.string()).optional().description('The expected JSON payload for the request body. Keys are field names, values are their explicit data types (e.g., "string", "number", "boolean", "UUID[]").'),
    params: z.record(z.string(), z.string()).optional().description('URL path parameters extracted from the route. Keys are param names, values are their data types.'),
    query: z.record(z.string(), z.string()).optional().description('URL query string parameters. Keys are param names, values are their data types.'),
  }).optional().description('The incoming request payload structure. Omit entirely if the endpoint takes no input.'),

  response: z.object({
    success: z.object({
      statusCode: z.number().description('The HTTP status code for a successful request (e.g., 200 OK, 201 Created).'),
      body: z.record(z.string(), z.string()).optional().description('The JSON payload returned on success. Keys are field names, values are data types.'),
    }).description('The expected response when the endpoint executes successfully.'),
    errors: z.array(z.object({
      statusCode: z.number().description('The HTTP status code for this specific error (e.g., 400 Bad Request, 401 Unauthorized, 404 Not Found).'),
      message: z.string().description('A developer-friendly error message explaining what went wrong and how the client should resolve it.'),
    })).description('A comprehensive list of possible error scenarios this endpoint might encounter.'),
  }).description('The contract for what this endpoint returns to the client, covering both success and failure cases.'),
}).description('A complete specification for a single REST API endpoint, designed for automatic OpenAPI generation.');

export const APISchema = z.object({
  endpoints: z.array(EndpointSchema).description('A comprehensive array of all RESTful API endpoints required to satisfy the system requirements.'),
}).strict().description('The complete API architecture blueprint, detailing the communication layer between the frontend and backend.');

export type API = z.infer<typeof APISchema>;