# 🚀 AI-Starter Community Edition

> **The 100% Free, Open-Source Next.js 15 AI Starter Kit** — Built for speed, developer delight, and zero architectural bloat.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Auth.js v5](https://img.shields.io/badge/Auth.js-v5_Beta-purple)](https://authjs.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed?logo=docker)](https://www.docker.com/)

A modern, production-grade foundation for building AI web applications, indie hackathon projects, and AI wrapper MVPs without wading through enterprise SaaS bloat. Includes **Vercel AI SDK 4** streaming (OpenAI GPT-4o-mini), **Auth.js v5** (Credentials + Google OAuth), **PostgreSQL + Prisma**, and **live credit and token counters**.

---

## 💎 Community Edition vs. AI-Starter-Pro

Building a personal project or prototype? **Community Edition is 100% free under the MIT License.**  
Need commercial SaaS billing, multi-agent workflows, vector search, or team workspaces? Check out **[AI-Starter-Pro](https://agenticpacks.com/templates/ai-starter-pro)**.

| Feature / Architecture | 🆓 Community Edition (MIT) | 💎 AI-Starter-Pro ($149) |
| :--- | :---: | :---: |
| **Framework & UI** | Next.js 15 (App Router) + React 19 + shadcn/ui | Next.js 15 (App Router) + React 19 + shadcn/ui |
| **Styling & Themes** | Tailwind CSS + Smooth Dark / Light Mode | Tailwind CSS + Smooth Dark / Light Mode |
| **Authentication** | Auth.js v5 (Credentials + Google OAuth) | Auth.js v5 + Magic Links + Role-Based Access Control (RBAC) |
| **Database** | PostgreSQL 16 + Prisma ORM (Standard SQL) | PostgreSQL 16 + Prisma ORM + **`pgvector` Vector DB** |
| **AI Streaming Chat** | Vercel AI SDK 4 (OpenAI GPT-4o-mini) | Multi-Model Router (OpenAI, Claude 3.7, Gemini 2.0) |
| **Autonomous Multi-Agent** | ❌ None | ✅ **LangGraph StateGraph + Tavily Web Search** |
| **Contextual RAG** | ❌ None | ✅ **Document Chunking & Cosine Vector Search** |
| **Token Usage & Credits** | ✅ Live Credit Balance & Total Tokens Counter | ✅ Team-shared Credit Pools, Burn Ledger & Limit Enforcement |
| **Rate Limiting & Redis** | ❌ None | ✅ **Redis cache, rate limiting & session throttling** |
| **Subscription Billing** | ❌ None (No paywalls or subscription tiers) | ✅ **Stripe Checkout, Webhooks, Portal & Tier Gating** |
| **Multi-Tenant Teams** | ❌ None (Single-user workspace) | ✅ **Team Workspaces, JWT Member Invites & RBAC** |
| **Super Admin Portal** | ❌ None | ✅ **Admin Metrics, User Telemetry & Manual Grants** |
| **Observability** | Pino Structured JSON Logging | Prometheus Metric Exporter + Grafana Dashboard |
| **Production DevOps** | Single-Container Docker (Dev & Prod) | **Hetzner Terraform IaC + Caddy SSL Automation** |

---

> ### 🚀 Ready to launch an enterprise AI business?
> Skip 200+ hours of boilerplate engineering. **[Get AI-Starter-Pro for $149 &rarr;](https://agenticpacks.com/templates/ai-starter-pro)**  
> *Includes Stripe Subscriptions, LangGraph Autonomous Workflows, pgvector RAG, Multi-Tenant Teams, and Terraform IaC.*

---

## ⚡ 2-Minute Quick Start

### Option 1: Complete Docker Dev Stack (Recommended)
Runs PostgreSQL and Next.js with **live hot-reloading (HMR)** inside Docker:

```bash
# 1. Clone repository
git clone https://github.com/Agentic-Packs/ai-starter-community.git
cd ai-starter-community

# 2. Copy environment configuration
cp .env.example .env

# 3. Add your OpenAI API key in .env:
# OPENAI_API_KEY="sk-..."

# 4. Start local development environment
docker compose -f docker-compose.dev.yml up -d

# 5. Seed the demo account (schema push is automatic; seed is not)
docker compose -f docker-compose.dev.yml exec app npm run prisma:seed
```

- App: **[http://localhost:3000](http://localhost:3000)**
- Seed Account: `user@demo.com` | Password: `password123` (comes with 100 starter credits)

---

### Option 2: Local Host Development (Native Node.js)
If you prefer running Next.js directly on your machine with a Dockerized database:

```bash
# 1. Start PostgreSQL database container
docker compose -f docker-compose.dev.yml up -d postgres

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env

# 4. Push database schema & seed demo account
npm run prisma:push
npm run prisma:seed

# 5. Start Next.js development server
npm run dev
```

- App: **[http://localhost:3000](http://localhost:3000)**

---

### Option 3: Production Docker Deployment
To run the optimized standalone production build:

```bash
docker compose up -d --build
```

---

## 🏗️ Architecture & Clean Stack

```
[Client / Browser (Next.js 15, React 19, Tailwind CSS, shadcn/ui)]
       │
       ▼
[Middleware (Auth.js v5 JWT Session Validation & Route Protection)]
       │
       ▼
[API Routes (withValidation Zod Schemas)]
       │
       ├──► [Services: AI Streaming (Vercel AI SDK 4 / OpenAI GPT-4o-mini)]
       ├──► [Services: Token Usage Counter & Real-Time Balance Sync]
       └──► [Services: Auth.js v5 (Google OAuth & Credentials)]
       │
       ▼
[Database Layer (Prisma ORM 6.4 + PostgreSQL 16 Alpine + Docker)]
```

### Folder Structure
```
ai-starter-community/
├── prisma/
│   ├── schema.prisma            # Standard PostgreSQL schema (User, Session, Conversation, Message, UsageLog)
│   └── seed.ts                  # Demo account seeder (user@demo.com)
├── public/                      # Static assets & brand icons
├── src/
│   ├── app/
│   │   ├── (auth)/              # Sign-in, registration, and verification pages
│   │   ├── (dashboard)/         # Authenticated dashboard (Chat, Account Settings, Plan & License)
│   │   ├── (marketing)/         # Landing, pricing, terms, and privacy pages
│   │   └── api/
│   │       ├── auth/            # NextAuth session handlers & user registration
│   │       ├── chat/            # Vercel AI SDK streaming endpoint
│   │       ├── conversations/   # Conversation thread persistence & message history
│   │       └── user/            # User profile and token usage endpoints
│   ├── components/
│   │   ├── chat/                # Streaming chat interface, message rendering & sidebar
│   │   ├── dashboard/           # Sidebar navigation, stats cards, and reactive credit counter
│   │   ├── shared/              # Navbar, footer, markdown renderer & theme toggles
│   │   └── ui/                  # Accessible shadcn/ui primitives
│   ├── lib/
│   │   ├── auth.config.ts       # Edge-compatible NextAuth route configuration
│   │   ├── auth.ts              # NextAuth v5 configuration & JWT session callbacks
│   │   ├── db.ts                # Prisma ORM singleton client
│   │   ├── env.ts               # Type-safe environment validation
│   │   ├── errors.ts            # Standard AppError classes & error codes
│   │   ├── logger.ts            # Pino structured JSON logger
│   │   ├── utils.ts             # Shared className helper
│   │   └── validation/          # Zod request validation schemas
│   ├── middleware.ts            # Auth.js JWT session validation & route protection
│   └── services/
│       └── ai/                  # OpenAI streaming, token counters & credit deduction
├── docker-compose.dev.yml       # Development Docker stack (App with HMR + Postgres)
├── docker-compose.yml           # Production Docker stack (Multi-stage build)
├── Dockerfile.dev               # Development container specification
└── Dockerfile.prod              # Optimized production container
```

---

## 🤖 OpenAI Streaming Model

AI-Starter Community is powered by OpenAI's fast, cost-efficient **GPT-4o-mini**:

1. **Setup**: Provide your OpenAI key in `.env`:
   ```env
   OPENAI_API_KEY="sk-..."
   ```
2. **Without a key**: The app still boots, but `POST /api/chat` returns `400` until `OPENAI_API_KEY` is set. There is no mock stream in Community Edition.

---

## 🔑 Environment Variables Reference

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://postgres:postgrespassword@localhost:5432/ai_starter_community` | PostgreSQL connection string |
| `AUTH_URL` | **Yes** | `http://localhost:3000` | Public origin URL for Auth.js callbacks (`NEXTAUTH_URL` also supported) |
| `AUTH_SECRET` | **Yes** | `random-32-char-string` | JWT session encryption secret (`openssl rand -hex 32`) |
| `OPENAI_API_KEY` | **Yes (for chat)** | `sk-...` | API key for OpenAI GPT-4o-mini streaming. App boots without it; chat requests fail until it is set. |
| `AUTH_GOOGLE_ID` | *Optional* | `your-google-client-id` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | *Optional* | `your-google-client-secret` | Google OAuth client secret |
| `PORT` | *Optional* | `3000` | Application HTTP port |

---

## 🛠️ Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Start local development server with Fast Refresh |
| `npm run build` | Generate Prisma client and compile Next.js production build |
| `npm run start` | Start compiled production Next.js server |
| `npm run typecheck` | Run TypeScript compiler type checking in strict mode |
| `npm run lint` | Run ESLint static code analysis |
| `npm run prisma:push` | Push schema changes directly to the PostgreSQL database |
| `npm run prisma:seed` | Seed the database with demo user and initial conversation |
| `npm run prisma:studio` | Open Prisma Studio visual database browser at `http://localhost:5555` |

---

## 📄 License

This project is open-source software licensed under the **[MIT License](LICENSE)**. Free to use for personal, educational, and commercial projects.
