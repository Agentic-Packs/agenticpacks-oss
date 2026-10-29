# AgenticPacks OSS

> ⭐ If this self-hosted Docker + Auth.js configuration saved you a weekend of debugging, please star the repository (it helps other devs discover it!)

> **The 100% Free, Open-Source Next.js 15 AI SaaS boilerplate.** MIT. Built for speed, developer delight, and zero architectural bloat.

<p align="center">
  <a href="https://demo.agenticpacks.com">🖥️ Live Interactive Demo</a>
  &nbsp;•&nbsp;
  <a href="https://agenticpacks.com/agenticpacks-pro">Get AgenticPacks Pro ($149)</a>
  &nbsp;•&nbsp;
  <a href="https://github.com/Agentic-Packs/agenticpacks-oss/stargazers">⭐️ Star on GitHub</a>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15.2-black?logo=next.js" alt="Next.js 15" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.0-61dafb?logo=react" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Strict-3178c6?logo=typescript" alt="TypeScript" /></a>
  <a href="https://authjs.dev/"><img src="https://img.shields.io/badge/Auth.js-v5_Beta-purple" alt="Auth.js v5" /></a>
  <a href="https://www.prisma.io/"><img src="https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma" alt="Prisma" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-Ready-2496ed?logo=docker" alt="Docker" /></a>
</p>

A modern, production-grade foundation for building AI web applications, indie hackathon projects, and AI wrapper MVPs without wading through enterprise SaaS bloat. Includes **Vercel AI SDK 4** streaming (OpenAI GPT-4o-mini), **Auth.js v5** (Credentials + Google OAuth), **PostgreSQL + Prisma**, **Stripe Checkout + Customer Portal** (Free + Pro $19), and **live credit and token counters**.

---

## AgenticPacks OSS vs AgenticPacks Pro

**AgenticPacks OSS is 100% free under the MIT License**, for prototypes, weekend hacks, and MVP testing.  
**[AgenticPacks Pro ($149)](https://agenticpacks.com/agenticpacks-pro)** is for commercial founders who need multi-tenant teams, 3-tier Stripe billing, pgvector RAG, multi-agent workflows, and automated self-hosted production deployment.

| Feature / Architecture | AgenticPacks OSS (MIT) | AgenticPacks Pro ($149) |
| :--- | :--- | :--- |
| **Ideal For** | Personal MVPs, Prototypes, Hackathons | **Commercial AI Startups, Micro-SaaS Founders** |
| **Framework & UI** | Next.js 15 (App Router) + React 19 + shadcn/ui | Next.js 15 (App Router) + React 19 + shadcn/ui |
| **Styling & Themes** | Tailwind CSS + Dark / Light Mode | Tailwind CSS + Dark / Light Mode |
| **Authentication** | Auth.js v5 (Credentials + Google OAuth) | Auth.js v5 + Magic Links + **RBAC** |
| **Database** | PostgreSQL 16 + Prisma ORM | PostgreSQL 16 + Prisma ORM + **`pgvector` Vector DB** |
| **AI Streaming Chat** | ✅ Vercel AI SDK 4 (OpenAI GPT-4o-mini) | ✅ **Multi-Model Router (OpenAI, Claude 3.7 Sonnet, Gemini 2.0 Flash)** |
| **Token Tracking & Margins** | ✅ Live Credit Balance & Total Tokens Counter | ✅ **Token-to-Cost Ledger (map token usage directly to dollar costs)** |
| **Stripe Billing** | ✅ Free + Pro $19/mo Checkout, webhooks & credit counter | ✅ **3-Tier Subscriptions, Portal Upgrades, Proration & Team Credit Pools** |
| **Observability** | ✅ Local Pino Structured JSON Logs | ✅ **Admin Dashboard + User Metrics & Telemetry** |
| **Infrastructure & Hosting** | ✅ Local Docker Compose (manual VPS setup) | ✅ **Automated Terraform IaC + Caddy SSL Deployment** |
| **Autonomous Multi-Agent** | ❌ None | ✅ **LangGraph Workflows + Tavily Web Search** |
| **Vector DB & RAG** | ❌ None | ✅ **PostgreSQL pgvector Semantic Document Search** |
| **Rate Limiting & Redis** | ❌ None | ✅ **Redis Cache, Rate Limiting & Session Throttling** |
| **Multi-Tenancy** | ❌ Single User Only | ✅ **Team Workspaces, JWT Member Invites & RBAC** |
| **Super Admin Portal** | ❌ None | ✅ **Admin Metrics, User Telemetry & Manual Grants** |

---

> ### 🚀 Building a commercial AI SaaS?
> Skip weeks of infrastructure boilerplate. **AgenticPacks Pro ($149)** adds 3-tier Stripe billing, team workspaces, vector search (RAG), autonomous multi-agent pipelines, and automated self-hosted production deployment.  
> **[Get AgenticPacks Pro for $149](https://agenticpacks.com/agenticpacks-pro)** • *[Test the Live Production Demo](https://demo.agenticpacks.com)*

---

## ⚡ 2-Minute Quick Start

### Option 1: Complete Docker Dev Stack (Recommended)
Runs PostgreSQL and Next.js with **live hot-reloading (HMR)** inside Docker:

```bash
# 1. Clone repository
git clone https://github.com/Agentic-Packs/agenticpacks-oss.git
cd agenticpacks-oss

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
       ├──► [Services: Stripe Checkout, Customer Portal & webhooks]
       └──► [Services: Auth.js v5 (Google OAuth & Credentials)]
       │
       ▼
[Database Layer (Prisma ORM 6.4 + PostgreSQL 16 Alpine + Docker)]
```

### Folder Structure
```
agenticpacks-oss/
├── prisma/
│   ├── schema.prisma            # PostgreSQL schema (User + stripeCustomerId, Session, Conversation, Message, UsageLog)
│   └── seed.ts                  # Demo account seeder (user@demo.com)
├── public/                      # Static assets & brand icons
├── src/
│   ├── app/
│   │   ├── (auth)/              # Sign-in, registration, and verification pages
│   │   ├── (dashboard)/         # Authenticated dashboard (Chat, Billing, Account Settings)
│   │   ├── (marketing)/         # Landing, pricing, terms, and privacy pages
│   │   └── api/
│   │       ├── auth/            # NextAuth session handlers & user registration
│   │       ├── chat/            # Vercel AI SDK streaming endpoint
│   │       ├── conversations/   # Conversation thread persistence & message history
│   │       ├── stripe/          # Checkout, Customer Portal, webhook alias
│   │       ├── webhooks/        # Stripe signed webhook
│   │       └── user/            # User profile and token usage endpoints
│   ├── components/
│   │   ├── chat/                # Streaming chat interface, message rendering & sidebar
│   │   ├── dashboard/           # Sidebar navigation, stats cards, and reactive credit counter
│   │   ├── shared/              # Navbar, footer, markdown renderer & theme toggles
│   │   └── ui/                  # Accessible shadcn/ui primitives
│   ├── generated/prisma/        # Prisma Client (generated; engines gitignored)
│   ├── lib/
│   │   ├── auth.config.ts       # Edge-compatible NextAuth route configuration
│   │   ├── auth.ts              # NextAuth v5 configuration & JWT session callbacks
│   │   ├── db.ts                # Prisma ORM singleton (`@/generated/prisma`)
│   │   ├── env.ts               # Type-safe environment validation
│   │   ├── errors.ts            # Standard AppError classes & error codes
│   │   ├── logger.ts            # Pino structured JSON logger
│   │   ├── plans.ts             # In-app Free + Pro ($19) plan catalog
│   │   ├── stripe.ts            # Stripe SDK (server-only)
│   │   ├── utils.ts             # Shared className helper
│   │   └── validation/          # Zod request validation schemas
│   ├── middleware.ts            # Auth.js JWT session validation & route protection
│   └── services/
│       ├── ai/                  # OpenAI streaming, token counters & credit deduction
│       └── stripe/              # Checkout, portal, webhook credit grants
├── docker-compose.dev.yml       # Development Docker stack (App with HMR + Postgres)
├── docker-compose.yml           # Production Docker stack (Multi-stage build)
├── Dockerfile.dev               # Development container specification
└── Dockerfile.prod              # Optimized production container
```

---

## 🤖 OpenAI Streaming Model

AgenticPacks OSS is powered by OpenAI's fast, cost-efficient **GPT-4o-mini**:

1. **Setup**: Provide your OpenAI key in `.env`:
   ```env
   OPENAI_API_KEY="sk-..."
   ```
2. **Without a key**: The app still boots, but `POST /api/chat` returns `400` until `OPENAI_API_KEY` is set. There is no mock stream in AgenticPacks OSS.

---

## 💳 In-app Stripe (Free + Pro $19)

Dashboard **Billing** (`/dashboard/billing`) is where users upgrade, open the Customer Portal, or cancel. Cancel opens Stripe’s Customer Portal (immediate cancel). There is no Stripe.js / publishable key; Checkout and Portal run on the server with `STRIPE_SECRET_KEY`.

Checkout creates the $19/month Pro Price via `price_data` — you do not need a Dashboard Price ID.

```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_APP_ID="agenticpacks-oss"
```

`STRIPE_APP_ID` is a stable instance name (not a hostname). Checkout copies it onto session and subscription metadata. If this app receives an event with a different `appId`, the webhook returns **200** with `"Meant for another domain."` and does not change the database.

The handler lives at **`POST /api/webhooks/stripe`**. **`POST /api/stripe/webhook`** is the same handler (Pro-compatible alias). Point Stripe (CLI or ngrok) at either path. If you set `PORT` (this stack often uses `3005`), forward to that host port:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# or: ngrok http 3000  →  https://<subdomain>.ngrok-free.app/api/webhooks/stripe
#     (or .../api/stripe/webhook)
```

Listen for these events:

| Event | Effect |
| :--- | :--- |
| `checkout.session.completed` | Set `plan` to `pro`, grant 500 credits |
| `invoice.payment_succeeded` | Grant 500 credits on renewals (`subscription_cycle` only) |
| `customer.subscription.deleted` | Set `plan` to `free` |
| `customer.subscription.updated` | Set `plan` to `free` if canceled or `cancel_at_period_end` |

The app boots without Stripe keys; `/api/stripe/checkout` and `/api/stripe/portal` return 400 until `STRIPE_SECRET_KEY` is set.

The **$149** AgenticPacks Pro price is the commercial **template** license, not an in-app plan.

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
| `STRIPE_SECRET_KEY` | *Optional* | `sk_test_...` | Stripe secret. App boots without it; Checkout returns 400 until set. |
| `STRIPE_WEBHOOK_SECRET` | *Optional* | `whsec_...` | Stripe webhook signing secret (`/api/webhooks/stripe` or `/api/stripe/webhook`) |
| `STRIPE_APP_ID` | *Optional* | `agenticpacks-oss` | Instance id in Checkout/subscription metadata. Foreign events are ignored with HTTP 200. |
| `LOG_LEVEL` | *Optional* | `info` | Pino log level |
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

---

## 🚀 Ready to Ship to Production?

* **Star this repository** if this starter saved you engineering hours!
* **Building a commercial AI startup?** Check out **[AgenticPacks Pro](https://agenticpacks.com/agenticpacks-pro)** to get team workspaces, 3-tier Stripe billing, pgvector RAG, and automated production deployment out of the box.
* **[Test the Live Production Demo](https://demo.agenticpacks.com)**
