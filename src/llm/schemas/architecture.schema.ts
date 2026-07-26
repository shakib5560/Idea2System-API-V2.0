import { z } from 'zod';

export const ArchitectureSchema = z.object({
  overview: z.string().description('A high-level executive summary of the system architecture, explaining the core architectural pattern (e.g., Microservices, Modular Monolith, Event-Driven) and why it was chosen based on the requirements.'),

  components: z.array(
    z.object({
      name: z.string().description('The logical name of the component (e.g., "User Service", "Redis Cache", "Stripe API").'),
      type: z.enum(['SERVICE', 'DATABASE', 'CACHE', 'FRONTEND', 'EXTERNAL_API', 'MESSAGE_QUEUE', 'STORAGE']).description('The architectural role this component plays in the system.'),
      technology: z.string().description('The recommended specific technology for this component (e.g., "NestJS", "PostgreSQL 16", "React", "AWS S3").'),
      responsibility: z.string().description('A clear, concise description of exactly what this component is responsible for doing.'),
      dependencies: z.array(z.string()).description('An array of component names that this component directly depends on or communicates with.'),
    }),
  ).description('A comprehensive list of all major components that make up the system architecture.'),

  dataFlow: z.array(z.string()).description('Step-by-step descriptions of how data moves through the system for key user journeys. Use "Component A -> Component B: Action" format if possible.'),

  technologies: z.array(z.string()).description('A consolidated list of the entire technology stack (languages, frameworks, databases, infrastructure) required to build the system.'),

  security: z.array(z.string()).description('Specific security measures, patterns, and compliance requirements the architecture must implement (e.g., "JWT with short expiration and refresh token rotation", "Rate limiting on API gateway").'),

  scalability: z.array(z.string()).description('Specific strategies for handling increased load (e.g., "Horizontal scaling of stateless API nodes", "Database read replicas for heavy read queries", "Redis caching").'),

  deployment: z.array(z.string()).description('Recommended deployment topology, infrastructure providers, and CI/CD strategies (e.g., "Dockerized containers on AWS ECS", "GitHub Actions CI/CD").'),
}).strict().description('The complete system architecture blueprint, defining how all pieces of the software will fit together, scale, and remain secure.');

export type Architecture = z.infer<
  typeof ArchitectureSchema
>;