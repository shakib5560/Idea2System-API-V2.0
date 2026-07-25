<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0F0F0F,100:2B2B2B&height=180&section=header&text=Idea2System&fontSize=46&fontColor=ffffff&fontAlignY=38&animation=fadeIn&desc=Idea%20%E2%86%92%20Requirements%20%E2%86%92%20Database%20%E2%86%92%20Architecture%20%E2%86%92%20API%20%E2%86%92%20Plan&descSize=16&descAlignY=58&descColor=cfcfcf"/>

<br>

<a href="#">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=400&size=16&duration=2800&pause=900&color=8A8A8A&center=true&vCenter=true&width=560&lines=Turn+a+raw+idea+into+a+buildable+technical+blueprint.;One+workflow%2C+not+five+disconnected+tools.;Requirements+%E2%80%A2+Schema+%E2%80%A2+Architecture+%E2%80%A2+API+%E2%80%A2+Roadmap." alt="Typing SVG" />
</a>

<br><br>

<img src="https://img.shields.io/badge/status-active--development-000000?style=flat-square&labelColor=000000" height="22"/>
<img src="https://img.shields.io/badge/license-private-000000?style=flat-square&labelColor=000000" height="22"/>
<img src="https://img.shields.io/badge/node-%E2%89%A520-000000?style=flat-square&labelColor=000000" height="22"/>
<img src="https://img.shields.io/badge/pnpm-%E2%89%A59-000000?style=flat-square&labelColor=000000" height="22"/>

</div>

<br>

<div align="center">
<sub>NESTJS &nbsp;·&nbsp; TYPESCRIPT &nbsp;·&nbsp; POSTGRESQL &nbsp;·&nbsp; PRISMA &nbsp;·&nbsp; REDIS &nbsp;·&nbsp; SWAGGER</sub>
</div>

<br><br>

## Overview

Building a product from scratch usually means bouncing between separate tools — one for discovery, one for schema design, another for architecture, another for planning. Handled in isolation, decisions drift out of sync.

**Idea2System** collapses that into a single pass:

```
Idea → Requirements → Database Design → System Architecture → API Design → Development Plan
```

Not a replacement for engineering judgment — a strong, editable starting point your team can validate together.

<br>

## What it generates

<table>
<tr><td width="180"><b>Requirements</b></td><td>Problem statement, target users, user stories, functional & non-functional requirements</td></tr>
<tr><td><b>Database Design</b></td><td>Entities, relationships, fields, constraints, schema structure</td></tr>
<tr><td><b>System Architecture</b></td><td>Components, services, integrations, data flow, technology choices</td></tr>
<tr><td><b>API Design</b></td><td>Endpoint groups, request/response contracts, auth, error handling</td></tr>
<tr><td><b>Development Plan</b></td><td>Prioritized milestones, tasks, dependencies, MVP-first delivery</td></tr>
</table>

<br>

## Current status

The repository currently ships the **Core API** — the authenticated foundation the AI planning modules build on.

<details>
<summary><b>Shipped</b></summary>
<br>

- NestJS API foundation with API versioning
- PostgreSQL persistence through Prisma
- Email/password registration and login
- JWT-based sessions with signed, HTTP-only cookies
- Google OAuth 2.0 / OIDC login with PKCE
- GitHub OAuth login with PKCE
- Encrypted storage of provider tokens
- Redis-backed caching layer for authenticated reads
- JWT blacklisting for logout and forced session revocation
- User resource management (file upload, URL import, raw text — with pagination, filtering, and per-user ownership)
- Request validation, CORS, Helmet, compression, rate limiting
- Swagger / OpenAPI documentation

</details>

<sub>AI-generated planning modules and the client application are next.</sub>

<br>

## Tech stack

| Layer                 | Choice                                       |
| --------------------- | -------------------------------------------- |
| API                   | NestJS · TypeScript                          |
| Database              | PostgreSQL                                   |
| ORM                   | Prisma                                       |
| Cache & session store | Redis (Upstash)                              |
| Auth                  | Passport · JWT · Google OAuth · GitHub OAuth |
| Docs                  | Swagger / OpenAPI                            |
| Package manager       | pnpm                                         |

<br>

## Structure

```
.
├── core-api/              NestJS backend application
│   ├── prisma/             Prisma schema and migrations
│   ├── src/auth/            Local and OAuth authentication, JWT strategy, token blacklist service
│   ├── src/user-resource/   User resource management (file, URL, text — CRUD + pagination)
│   ├── src/redis/           Redis client module (cache + blacklist)
│   ├── src/common/          Shared services, including token encryption
│   └── src/prisma/          Prisma module and service
└── README.md
```

<br>

## Getting started

**Prerequisites** — Node.js 20+, pnpm 9+, PostgreSQL, Redis (Upstash free tier recommended)

<br>

**1 · Install**

```bash
cd core-api
pnpm install
```

**2 · Configure** — create `core-api/.env` (never commit this file)

<details>
<summary>Show environment variables</summary>

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
# Public address of this API. Used in verification email links.
API_URL=http://localhost:5000

DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/idea2system?schema=public

JWT_SECRET=replace-with-a-long-random-secret
COOKIE_SECRET=replace-with-a-long-random-secret
# Exactly 64 hexadecimal characters (32 bytes)
TOKEN_ENCRYPTION_KEY=replace-with-a-64-character-hex-key

# Transactional email (Resend). Omitting RESEND_API_KEY in dev logs the
# verification link instead of sending it.
RESEND_API_KEY=re_your-resend-api-key
EMAIL_FROM=Idea2System <onboarding@your-verified-domain.com>

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/v1.0/auth/github/callback

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1.0/auth/google/callback

# Redis configuration (Upstash — TLS required, single database).
# Key prefixing (cache: / bl:) is used instead of database index splitting.
REDIS_HOST=your-upstash-redis-endpoint.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-redis-password
REDIS_TLS=true
```

</details>

Register these redirect URLs with each provider for local development:

| Provider | Redirect URL                                          |
| -------- | ----------------------------------------------------- |
| Google   | `http://localhost:5000/api/v1.0/auth/google/callback` |
| GitHub   | `http://localhost:5000/api/v1.0/auth/github/callback` |

**3 · Migrate**

```bash
pnpm prisma migrate dev
```

**4 · Run**

```bash
pnpm start:dev
```

API → `http://localhost:5000/api/v1.0`
Swagger (dev only) → `http://localhost:5000/api/v1.0/docs`

<br>

## Authentication endpoints

| Method | Endpoint                                | Purpose                                                |
| ------ | --------------------------------------- | ------------------------------------------------------ |
| `POST` | `/api/v1.0/auth/register`               | Create an account with email and password              |
| `GET`  | `/api/v1.0/auth/verify-email?token=...` | Verify a newly registered email address                |
| `POST` | `/api/v1.0/auth/resend-verification`    | Request a new verification link                        |
| `POST` | `/api/v1.0/auth/login`                  | Sign in with email and password                        |
| `GET`  | `/api/v1.0/auth/google`                 | Start Google sign-in                                   |
| `GET`  | `/api/v1.0/auth/github`                 | Start GitHub sign-in                                   |
| `GET`  | `/api/v1.0/auth/me`                     | Get the authenticated user profile (Redis-cached)      |
| `POST` | `/api/v1.0/auth/logout`                 | End the current session and blacklist the active token |
| `POST` | `/api/v1.0/auth/logout-everywhere`      | Revoke all active tokens for the authenticated user    |
| `POST` | `/api/v1.0/auth/change-password`        | Change user password and revoke all active sessions    |
| `GET`  | `/api/v1.0/health`                      | Report API and Redis connectivity status               |

## User Resource endpoints

| Method   | Endpoint                          | Auth     | Purpose                                                               |
| -------- | --------------------------------- | -------- | --------------------------------------------------------------------- |
| `POST`   | `/api/v1.0/user-resources/upload` | Required | Upload a file resource (PDF, DOCX, TXT, CSV, JSON, image — max 10 MB) |
| `POST`   | `/api/v1.0/user-resources/url`    | Required | Import external content from a URL                                    |
| `POST`   | `/api/v1.0/user-resources/text`   | Public   | Create a resource from raw text (guests supported)                    |
| `GET`    | `/api/v1.0/user-resources`        | Required | List resources owned by the current user (paginated, filterable)      |
| `GET`    | `/api/v1.0/user-resources/:id`    | Required | Retrieve a single resource by ID                                      |
| `DELETE` | `/api/v1.0/user-resources/:id`    | Required | Permanently delete a resource by ID                                   |

<sub>Full OAuth configuration and endpoint list in the <a href="core-api/README.md">Core API README</a>.</sub>

<br>

## Redis usage

Redis (Upstash) backs two responsibilities in the Core API:

- **Caching** — short-lived storage for authenticated reads (e.g. `auth/me`) under the `cache:` key prefix, reducing repeated database lookups.
- **JWT blacklisting** — every issued JWT carries a unique `jti` claim. On logout, that `jti` is stored under the `bl:` key prefix with a TTL matching the token's remaining lifetime, so the entry expires naturally and never outlives the token it revokes. A parallel `bl:user:<id>` key supports revoking every token belonging to a user at once, used for "log out everywhere" and password-change flows.

> [!IMPORTANT]
> **Fail-closed by design.** Token blacklist checks run on every authenticated request. If Redis is unreachable, requests are rejected (`401 Unauthorized`) rather than allowed through — a revoked token must never be treated as valid just because the blacklist couldn't be checked.

<br>

Redis is integrated to improve authentication performance and reduce unnecessary database queries.

### Current Usage

- Authentication module
- User Repository
- User session and token management
- User data caching

### Notes

- PostgreSQL remains the primary database and source of truth.
- Redis is used as a cache layer only.
- Cached data is automatically invalidated when relevant user data changes.
- The implementation is designed to support future Next.js frontend integration and horizontal scaling.

## Commands

<sub>Run from <code>core-api/</code></sub>

| Command              | Description                 |
| -------------------- | --------------------------- |
| `pnpm start:dev`     | Start the API in watch mode |
| `pnpm build`         | Build for production        |
| `pnpm test`          | Run unit tests              |
| `pnpm test:e2e`      | Run end-to-end tests        |
| `pnpm lint`          | Lint and apply fixes        |
| `pnpm prisma studio` | Open Prisma Studio          |

<br>

## Roadmap

- [x] Core API and user authentication
- [x] Google and GitHub OAuth
- [x] Redis caching and JWT blacklist logout
- [x] User resource management (file upload, URL import, raw text)
- [x] Multiple LLM systems
- [ ] Idea intake and project workspace
- [ ] AI-assisted requirements generation
- [ ] Database schema and ERD generation
- [ ] Architecture and technology recommendations
- [ ] API contract generation
- [ ] Milestone and task planning
- [ ] Exportable technical blueprints
- [ ] Collaborative review and version history

<br>

## Contributing

```bash
git switch main
git pull origin main
git switch -c feature/short-description
```

Make focused changes, run the relevant checks, then open a pull request into `main`.

<br>

## License

MIT License

Copyright (c) 2026 Sheikh Shamiul Shakib

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

<br><br>

<div align="center">
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:0F0F0F,100:2B2B2B&height=100&section=footer"/>
</div>
