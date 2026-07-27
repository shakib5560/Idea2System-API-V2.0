<div align="center">

<br/>

# Idea2System

**From idea to production blueprint in seconds.**

A deterministic backend engine that ingests natural language product descriptions and outputs strongly-typed system artifacts — database schemas, API contracts, user stories, architecture designs, and roadmaps — using multi-provider LLM routing with guaranteed structural correctness.

<br/>

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?style=flat-square&logo=redis&logoColor=white)](https://upstash.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-UNLICENSED-black?style=flat-square)]()

<br/>

[Architecture](#architecture-overview) · [Quick Start](#getting-started) · [API Reference](#api-reference) · [AI Pipeline](#ai-pipeline) · [Roadmap](#roadmap)

<br/>

</div>

---

## Overview

Translating a product idea into a technical specification is the most expensive part of early-stage software development. Requirements gathering, database design, API contracts, and user story writing typically occupy an entire sprint before a single line of production code is written.

Idea2System automates that process entirely.

Submit a plain-language description of your product. The system produces a complete, validated system specification: normalized database tables with typed columns and foreign key relationships, RESTful API endpoint definitions with request/response contracts, prioritized user stories mapped to epics, architecture decision records, and a phased project roadmap — all returned as strongly-typed, schema-validated JSON that downstream tools can consume directly.

The core technical guarantee is structural determinism. Every LLM response is validated against Zod 4 schemas using the OpenAI structured outputs compiler before being persisted. Malformed responses trigger automatic retries with an alternative provider. Your application never receives partial or hallucinated data.

---

## Key Features

| Feature | Description |
|---|---|
| **Multi-LLM Routing** | Unified gateway over Google Gemini, Groq (Llama 3.3), and OpenRouter. Switch providers per-request or per-schema type. |
| **Deterministic Outputs** | `openai/helpers/zod` compiles Zod 4 schemas to strict JSON Schema. LLMs are constrained to exact object shapes — no hallucinated fields. |
| **Async Job Processing** | BullMQ workers backed by Upstash Redis isolate long-running AI generation from the HTTP request lifecycle. |
| **Complete Auth System** | JWT with AES-256-GCM token encryption, Argon2 password hashing, OAuth2 via GitHub and Google, plus a Redis-backed JWT blacklist. |
| **Distributed Caching** | Redis cache manager with namespace-prefix isolation between response cache and token blacklist. |
| **Project Lifecycle** | Full state machine from `DRAFT → ANALYZING → IN_PROGRESS → COMPLETED` with QA reports and AI-generated clarification questions. |
| **Structured Prompt Templates** | Markdown-based prompt templates with typed variable injection, stored alongside their matching Zod output schemas. |

---

## Architecture Overview

```mermaid
graph TD
    Client(["Client / Frontend"]) -->|HTTPS REST| Gateway

    subgraph NestJS Application
        Gateway["API Gateway\n/api/v1.0"] --> AuthMod["Auth Module\n(JWT · OAuth2 · Guards)"]
        Gateway --> LLMMod["LLM Module\n(Controller · Gateway Service)"]
        Gateway --> ResourceMod["User Resource Module\n(Prompt Ingestion)"]
        Gateway --> HealthMod["Health Module"]

        LLMMod --> BullMQ["BullMQ Queue\n(Async Jobs)"]
        LLMMod --> LLMGateway["LlmGateway Service\n(Provider Router)"]

        LLMGateway --> Gemini["Google Gemini\ngemini-3.6-flash"]
        LLMGateway --> Groq["Groq\nllama-3.3-70b-versatile"]
        LLMGateway --> OpenRouter["OpenRouter\nclaude-3-haiku"]

        Gemini & Groq & OpenRouter --> ZodValidator["Zod 4 Validator\n(zodResponseFormat)"]
    end

    ZodValidator -->|Validated JSON| PG[("PostgreSQL\nPrisma ORM")]
    AuthMod & BullMQ --> Redis[("Redis\nCache · Blacklist · Queue")]
```

---

## AI Pipeline

The structured generation pipeline enforces output correctness at every stage, independent of the LLM provider.

```mermaid
sequenceDiagram
    participant API as REST API
    participant GW as LlmGateway
    participant SC as Schema Compiler
    participant LLM as LLM Provider
    participant ZOD as Zod Validator
    participant DB as PostgreSQL

    API->>GW: generateStructured(prompt, ZodSchema, provider)
    GW->>SC: zodResponseFormat(schema, schemaName)
    SC-->>GW: Strict JSON Schema object
    GW->>LLM: generate(prompt + JSON Schema constraint)
    LLM-->>GW: Raw JSON string
    GW->>ZOD: schema.parse(rawJson)
    alt Validation passes
        ZOD-->>GW: Typed TypeScript object
        GW->>DB: Persist structured data
        DB-->>API: 200 OK + validated payload
    else Validation fails (retry ≤ 2)
        ZOD-->>GW: ZodError
        GW->>LLM: Retry with same constraints
    end
```

### Prompt Templates

All prompts are maintained as Markdown files in `src/llm/prompts/`, with `{{VARIABLE}}` placeholders for runtime injection. Each prompt file has a co-located Zod schema in `src/llm/schemas/` that defines the exact JSON shape the LLM must produce.

| Prompt Template | Output Schema | Description |
|---|---|---|
| `database.md` | `DatabaseSchema` | Normalized tables, typed columns, FK relationships |
| `api.md` | `ApiSchema` | RESTful endpoints with request/response contracts |
| `user-stories.md` | `UserStorySchema` | Epics, stories, and acceptance criteria |
| `architecture.md` | `ArchitectureSchema` | System design decisions and component descriptions |
| `roadmap.md` | `RoadmapSchema` | Phased delivery milestones |
| `erd.md` | `ErdSchema` | Entity-relationship definitions |
| `review.md` | `ReviewSchema` | QA and consistency review reports |
| `optimize-idea.md` | `OptimizeIdeaSchema` | Product brief refinement |

---

## Technology Stack

<details>
<summary><strong>Runtime & Framework</strong></summary>

| Package | Version | Purpose |
|---|---|---|
| `@nestjs/core` | 11.x | Application framework, DI container, module system |
| `@nestjs/platform-express` | 11.x | HTTP adapter |
| `typescript` | 5.7 | Type system |
| `reflect-metadata` | 0.2 | Decorator metadata (required by NestJS) |
</details>

<details>
<summary><strong>Database & ORM</strong></summary>

| Package | Version | Purpose |
|---|---|---|
| `prisma` | 7.x | Schema management, migrations |
| `@prisma/client` | 7.x | Type-safe database client |
| `@prisma/adapter-pg` | 7.x | Native PostgreSQL driver adapter |
| `pg` | 8.x | PostgreSQL driver |
</details>

<details>
<summary><strong>AI & Schema Validation</strong></summary>

| Package | Version | Purpose |
|---|---|---|
| `@google/genai` | 2.x | Google Gemini SDK |
| `openai` | 6.x | OpenAI SDK — used for `zodResponseFormat` schema compiler |
| `zod` | 4.x | Runtime schema validation and type inference |
</details>

<details>
<summary><strong>Queue, Cache & Auth</strong></summary>

| Package | Version | Purpose |
|---|---|---|
| `bullmq` | 5.x | Redis-backed job queue |
| `@nestjs/bullmq` | 11.x | BullMQ NestJS integration |
| `ioredis` | 5.x | Redis client (TLS-capable for Upstash) |
| `@nestjs/cache-manager` | 3.x | Distributed response cache |
| `@nestjs/passport` | 11.x | Authentication middleware |
| `@nestjs/jwt` | 11.x | JWT sign/verify |
| `passport-jwt` | 4.x | JWT strategy |
| `passport-google-oauth20` | 2.x | Google OAuth2 strategy |
| `passport-github2` | 0.1.x | GitHub OAuth2 strategy |
| `argon2` | 0.45 | Password hashing |
</details>

---

## Database Design

```mermaid
erDiagram
    User {
        string id PK
        string email UK
        string username UK
        string passwordHash
        datetime emailVerifiedAt
        datetime createdAt
    }

    OAuthAccount {
        string id PK
        string userId FK
        string provider
        string providerAccountId
        string accessToken
        datetime accessTokenExpiresAt
    }

    UserProvidePrompt {
        string id PK
        string userId FK
        string promptType
        string title
        string normalizedText
        datetime createdAt
    }

    Project {
        string id PK
        string userId FK
        string promptId FK
        string title
        string status
        datetime createdAt
    }

    QAReport {
        string id PK
        string projectId FK
        json issues
        json suggestions
    }

    ClarificationQuestion {
        string id PK
        string projectId FK
        string question
        string answer
        boolean resolved
    }

    User ||--o{ OAuthAccount : "has"
    User ||--o{ UserProvidePrompt : "submits"
    User ||--o{ Project : "owns"
    UserProvidePrompt ||--o{ Project : "seeds"
    Project ||--o{ QAReport : "has"
    Project ||--o{ ClarificationQuestion : "has"
```

---

## Project Structure

```
idea2system-api/
├── src/
│   ├── auth/
│   │   ├── decorators/          # @CurrentUser, @Public
│   │   ├── dto/                 # LoginDto, RegisterDto
│   │   ├── entities/            # Auth entity types
│   │   ├── guards/              # JwtAuthGuard, LocalAuthGuard
│   │   ├── interfaces/          # JWT payload interface
│   │   ├── oauth/               # Google & GitHub passport strategies
│   │   ├── strategies/          # JWT, Local strategies
│   │   ├── utils/               # Token encryption (AES-256-GCM)
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── token-blacklist.service.ts
│   │
│   ├── llm/
│   │   ├── enums/               # AIProvider enum
│   │   ├── interfaces/          # ILlmProvider interface
│   │   ├── prompts/             # Markdown prompt templates (database.md, api.md ...)
│   │   ├── providers/           # GeminiProvider, GroqProvider, OpenRouterProvider
│   │   ├── schemas/             # Zod output schemas (database, api, roadmap ...)
│   │   ├── llm-gateway.service.ts   # Provider router + retry logic
│   │   ├── llm.controller.ts
│   │   └── llm.module.ts
│   │
│   ├── user-resource/
│   │   ├── dto/                 # CreateTextResourceDto, CreateFileResourceDto
│   │   ├── entities/
│   │   ├── user-resource.controller.ts
│   │   ├── user-resource.service.ts
│   │   └── user-resource.module.ts
│   │
│   ├── common/
│   │   ├── crypto/              # AES-256-GCM encryption utilities
│   │   └── mail/                # Nodemailer / SMTP integration
│   │
│   ├── health/                  # /health endpoint
│   ├── prisma/                  # PrismaService (singleton client)
│   ├── redis/                   # Redis provider module
│   ├── app.module.ts
│   └── main.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── .env.example
├── docker-compose.yml
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 6+ (or [Upstash](https://upstash.com) for managed TLS Redis)

### 1. Clone

```bash
git clone https://github.com/shakib5560/Idea2System-API-V2.0.git
cd Idea2System-API-V2.0
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Open `.env` and fill in the required values. See the [Environment Variables](#environment-variables) section for the full reference.

### 4. Database Setup

```bash
npx prisma db push
```

### 5. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:5000/api/v1.0`.

---

## Docker Setup

Run the full stack — API, PostgreSQL, and Redis — in isolated containers.

```bash
docker-compose up -d
```

> [!NOTE]
> The `docker-compose.yml` seeds the `DATABASE_URL` and `REDIS_*` environment variables automatically for local development. You still need to provide LLM API keys and OAuth credentials.

---

## Environment Variables

Create a `.env` file from the provided example. All variables are required unless marked optional.

```bash
# ── Server ────────────────────────────────────────────────
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# ── Database ──────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/idea2system?schema=public

# ── Authentication ────────────────────────────────────────
JWT_SECRET=your-jwt-secret-min-32-chars
COOKIE_SECRET=your-cookie-signing-secret
TOKEN_ENCRYPTION_KEY=64-character-hex-key-for-aes-256-gcm

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:5000/api/v1.0/auth/github/callback

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1.0/auth/google/callback

# ── Mail ──────────────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="Idea2System <your-email@gmail.com>"

# ── Redis ─────────────────────────────────────────────────
REDIS_HOST=your-upstash-instance.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password
REDIS_TLS=true

# ── LLM Providers ─────────────────────────────────────────
GEMINI_API_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Full PostgreSQL connection string |
| `JWT_SECRET` | Yes | Minimum 32 characters |
| `TOKEN_ENCRYPTION_KEY` | Yes | 64-character hex string for AES-256-GCM |
| `REDIS_HOST` | Yes | Redis hostname (Upstash supported) |
| `REDIS_TLS` | Yes | Set `true` for Upstash or any TLS-enabled Redis |
| `GEMINI_API_KEY` | Yes | Google AI Studio key (default provider) |
| `GROQ_API_KEY` | No | Fallback provider |
| `OPENROUTER_API_KEY` | No | Fallback provider |

---

## API Reference

### Base URL

```
http://localhost:5000/api/v1.0
```

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Create a new account |
| `POST` | `/auth/login` | Email/password login |
| `GET` | `/auth/google` | Initiate Google OAuth2 flow |
| `GET` | `/auth/github` | Initiate GitHub OAuth2 flow |
| `POST` | `/auth/logout` | Invalidate session (blacklists JWT) |
| `POST` | `/auth/refresh` | Rotate access token |

### Resources

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/user-resource/text` | Submit a plain-text project idea |
| `POST` | `/user-resource/file` | Submit a PDF or document |
| `POST` | `/user-resource/url` | Submit a URL for content extraction |
| `GET` | `/user-resource` | List all submitted resources |

### AI Generation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/llm/test-structured` | Test structured generation (any provider) |
| `POST` | `/llm/dberd` | Generate a database schema and ERD |

### System

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health check |

---

## Example Usage

### Generate a Database Schema

```bash
curl -X POST http://localhost:5000/api/v1.0/llm/dberd \
  -H "Authorization: Bearer <token>"
```

<details>
<summary><strong>Response</strong></summary>

```json
{
  "success": true,
  "data": {
    "tables": [
      {
        "tableName": "users",
        "description": "Core user accounts with authentication state.",
        "columns": [
          { "name": "id", "type": "UUID", "isPrimary": true, "isNullable": false, "isUnique": false },
          { "name": "email", "type": "VARCHAR(255)", "isPrimary": false, "isNullable": false, "isUnique": true },
          { "name": "created_at", "type": "TIMESTAMPTZ", "isPrimary": false, "isNullable": false, "isUnique": false, "defaultValue": "NOW()" }
        ]
      },
      {
        "tableName": "courses",
        "description": "Courses published by instructors.",
        "columns": [
          { "name": "id", "type": "UUID", "isPrimary": true, "isNullable": false, "isUnique": false },
          { "name": "instructor_id", "type": "UUID", "isPrimary": false, "isNullable": false, "isUnique": false },
          { "name": "title", "type": "VARCHAR(255)", "isPrimary": false, "isNullable": false, "isUnique": false }
        ]
      }
    ],
    "relationships": [
      {
        "fromTable": "users",
        "toTable": "courses",
        "type": "ONE_TO_MANY",
        "foreignKey": "instructor_id"
      }
    ]
  }
}
```
</details>

### Test Structured Generation with Custom Provider

```bash
curl -X POST http://localhost:5000/api/v1.0/llm/test-structured \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A SaaS platform for managing freelance contracts and invoices.",
    "provider": "groq"
  }'
```

---

## Project Workflow

```mermaid
stateDiagram-v2
    [*] --> DRAFT: User submits prompt
    DRAFT --> ANALYZING: AI extracts requirements
    ANALYZING --> IN_PROGRESS: Generation tasks queued
    IN_PROGRESS --> COMPLETED: All artifacts validated
    IN_PROGRESS --> FAILED: Max retries exceeded
    FAILED --> IN_PROGRESS: Manual retry
    COMPLETED --> [*]
```

Each `Project` transitions through this lifecycle. At the `ANALYZING` stage, AI generates `ClarificationQuestion` records for ambiguous requirements. At `IN_PROGRESS`, BullMQ workers concurrently generate the database schema, API design, user stories, and roadmap. Each artifact is Zod-validated before being written to PostgreSQL.

---

## Security

| Control | Implementation |
|---|---|
| Password hashing | Argon2id |
| Token signing | JWT (HS256), minimum 32-byte secret |
| OAuth token storage | AES-256-GCM encrypted at rest |
| Token revocation | Redis-backed JWT blacklist with TTL |
| Transport security | Helmet middleware, HTTPS enforced in production |
| Rate limiting | `express-rate-limit` on all public endpoints |
| Input validation | `class-validator` + Zod on all request bodies |

> [!WARNING]
> Never commit `.env` files. The `TOKEN_ENCRYPTION_KEY` must be a cryptographically random 64-character hex string. Generate one with `openssl rand -hex 32`.

---

## Performance Goals

| Metric | Target |
|---|---|
| Non-AI endpoint latency | `< 50ms` p95 |
| AI generation latency | `< 10s` p95 (Gemini Flash) |
| Cache hit rate | `> 80%` for repeated prompts |
| Concurrent AI jobs | 100+ via BullMQ workers |
| Database connections | Pooled via Prisma + `@prisma/adapter-pg` |

---

## Roadmap

- [x] Multi-provider LLM gateway (Gemini, Groq, OpenRouter)
- [x] Zod 4 strict schema validation pipeline
- [x] JWT authentication with Redis blacklist
- [x] OAuth2 (GitHub, Google)
- [x] Database schema generation endpoint
- [ ] BullMQ worker implementation for full async project generation
- [ ] WebSocket events for real-time generation progress
- [ ] Vector search with pgvector for RAG context injection
- [ ] Swagger / OpenAPI documentation at `/api/docs`
- [ ] E2E test suite with Supertest
- [ ] CLI tool to scaffold projects from Idea2System output

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit using Conventional Commits: `git commit -m 'feat(llm): add anthropic provider'`
4. Push and open a Pull Request against `main`

Please ensure `npm run lint` passes and all existing tests remain green before submitting.

---

## License

Private — All rights reserved. Not licensed for redistribution or commercial use.

---

<div align="center">

Built by **Sheikh Shamiul Shakib**

[dev.shakib24@gmail.com](mailto:dev.shakib24@gmail.com) · [github.com/shakib5560](https://github.com/shakib5560)

<br/>

</div>
