# Bloom Coffee Co. — AI-Native Mini CRM

> Built for the **Xeno Engineering Take-Home Assignment 2026**
> A production-grade Mini CRM that helps a D2C brand intelligently reach its shoppers.

---

## What This Is

**Bloom Coffee Co.** is an AI-native CRM for a fictional Bangalore-based specialty coffee brand. It demonstrates the full Xeno loop:

1. **Ingest** — customer and order data seeded realistically (500+ customers, 2,000+ orders)
2. **Segment** — carve audiences manually or via natural-language query ("lapsed high-value customers who haven't returned in 60 days")
3. **Campaign** — compose AI-personalised messages, preview variants, select channels (WhatsApp / SMS / Email)
4. **Dispatch** — CRM hands off to a separate channel service via the two-service callback architecture
5. **Track** — live delivery funnel (sent → delivered → opened → clicked → converted → revenue), AI insights

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER (React)                      │
│  Dashboard · Customers · Audience Builder · Campaigns ·     │
│  Performance Center · Customer 360                          │
└────────────────────┬────────────────────────────────────────┘
                     │ tRPC (type-safe)
┌────────────────────▼────────────────────────────────────────┐
│                    CRM Backend (Hono + tRPC)                │
│                                                             │
│  Routers:                                                   │
│  ├── analytics.*   — Dashboard stats, campaign performance  │
│  ├── customer.*    — List, search, detail, segment members  │
│  ├── segment.*     — Create, list, NL query discovery       │
│  ├── campaign.*    — Create, launch, insights               │
│  └── channel.*     — [CHANNEL SERVICE — separate concern]   │
│                                                             │
│  Database: PostgreSQL (Supabase, Drizzle ORM)               │
│  Tables: customers, orders, segments, segment_customers,    │
│          campaigns, messages, events, campaign_insights     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              CHANNEL SERVICE (channel.ts router)            │
│                                                             │
│  POST channel.send(campaignId, channel, messageIds)         │
│    ↓ Accepts messages, marks them queued                    │
│    ↓ Fires async processing (fire-and-forget)               │
│    ↓ Simulates realistic delivery lifecycle per channel:    │
│       queued → sent → delivered → opened → clicked →        │
│       converted (with channel-specific rates & timing)      │
│    ↓ Each step CALLS BACK to CRM receipt endpoint           │
│       updating message status + campaign aggregates         │
└─────────────────────────────────────────────────────────────┘
```

### The Two-Service Callback Loop

The assignment requires this specific pattern — and it's how real messaging platforms work:

```
CRM (launch campaign)
  │
  ├─► channel.send({ campaignId, channel, messageIds })
  │     ↓ returns immediately: "accepted N messages"
  │
  │   [Channel Service runs async, no await]
  │     ├── Delay 300–600ms → mark messages "sent"   → UPDATE campaigns.actual_sent
  │     ├── Delay 800ms     → mark messages "delivered" → UPDATE campaigns.actual_delivered
  │     ├── Delay 1.5s      → (if random < openRate)  → UPDATE campaigns.actual_opened
  │     ├── Delay 2.5s      → (if random < clickRate) → UPDATE campaigns.actual_clicked
  │     └── Delay 4s        → (if random < convRate)  → UPDATE campaigns.actual_converted + revenue
  │
  │   [Frontend polls campaign.getById every 800ms while running]
  │     ↓ Shows live delivery funnel as callbacks update DB
  │
  └─► Campaign status → "completed" (set after all messages processed)
```

Channel delivery rates are modelled per channel:

| Channel   | Delivery | Open | Click | Convert |
|-----------|----------|------|-------|---------|
| WhatsApp  | 95%      | 82%  | 32%   | 12%     |
| SMS       | 98%      | 88%  | 18%   | 7%      |
| Email     | 87%      | 24%  | 7%    | 2.5%    |

---

## AI Features

| Feature | Approach |
|---------|----------|
| **NL Segment Discovery** | Rule-based NLP parsing of intent ("lapsed", "high-value", "new", "weekend") → SQL filter generation |
| **AI Segment Suggestions** | Pre-seeded AI-suggested segments surfaced on the dashboard |
| **Message Personalisation** | Template engine that uses customer persona, favourite product, name, and channel to craft 3 variants per campaign goal type (re-engagement / retention / upsell / welcome) |
| **Campaign Insights** | Post-campaign analysis comparing actual vs predicted metrics, generating plain-language insight + recommendation |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS v3 |
| Backend | Hono, tRPC v11, Node.js 20 |
| Database | PostgreSQL (Supabase) via Drizzle ORM |
| UI Library | shadcn/ui (40+ components) |
| State | TanStack Query v5 |
| Fonts | Playfair Display (display) + Inter (body) |
| Icons | Lucide React |

---

## Local Setup

### Prerequisites
- Node.js 20+
- PostgreSQL (or Supabase)

### 1. Clone and install
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your Supabase PostgreSQL connection string
```

### 3. Create database & run migrations
```bash
npm run db:push
```

### 4. Seed data
```bash
npx tsx db/seed.ts
```

### 5. Run development server
```bash
npm run dev
```

App runs at `http://localhost:5173`, API at `http://localhost:5173/api/trpc/*`

---

## Docker Setup

```bash
# Copy and configure env
cp .env.example .env

# Start everything
docker-compose up -d

# Seed the database
docker-compose exec app npx tsx db/seed.ts
```

App runs at `http://localhost:3000`

---

## Deployment (Railway / Render)

### Railway
1. Connect your GitHub repo
2. Set environment variables (DATABASE_URL, APP_SECRET, NODE_ENV=production)
3. Set build command: `npm install && npm run build`
4. Set start command: `npm run start`
5. Connect to your Supabase PostgreSQL instance

### Environment Variables for Production
```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
APP_ID=your-app-id
APP_SECRET=your-strong-secret-here
```

---

## Project Structure

```
app/
├── api/                    # Backend (tRPC + Hono)
│   ├── boot.ts            # Server entry point
│   ├── router.ts          # Root tRPC router
│   ├── middleware.ts       # tRPC middleware, context
│   ├── queries/           # DB connection
│   └── routers/
│       ├── analytics.ts   # Dashboard stats
│       ├── campaign.ts    # Campaign CRUD + AI messages
│       ├── channel.ts     # ← CHANNEL SERVICE (two-service architecture)
│       ├── customer.ts    # Customer list + detail
│       └── segment.ts     # Segments + NL discovery
├── db/
│   ├── schema.ts          # Drizzle schema (10 tables)
│   ├── relations.ts       # Table relationships
│   └── seed.ts            # Realistic Bloom Coffee seed data
├── src/                    # Frontend (React + TypeScript)
│   ├── components/
│   │   └── Layout.tsx     # Sidebar + top nav
│   ├── pages/
│   │   ├── Home.tsx       # Intelligence Hub dashboard
│   │   ├── Customers.tsx  # Customer browser
│   │   ├── Audience.tsx   # Segment builder (manual + NL)
│   │   ├── Campaigns.tsx  # Campaign wizard
│   │   ├── Performance.tsx # Live campaign tracking
│   │   └── Customer.tsx   # Customer 360 view
│   └── providers/
│       └── trpc.ts        # tRPC + React Query setup
├── contracts/
│   ├── types.ts           # Shared types
│   └── errors.ts          # Error definitions
└── .env.example           # Environment variables reference
```

---

## Tradeoffs & Scale Notes

- **Channel Service in-process**: In production, `channel.ts` would be a separately deployed microservice behind a message queue (SQS/PubSub). It calls back to a `/webhooks/delivery` endpoint on the CRM. Here it runs in the same process as a clearly-separated module.
- **NL Query**: Currently rule-based regex intent parsing. At scale: an LLM call (GPT-4/Gemini) to generate the SQL filter spec dynamically.
- **Message personalization**: Template-based with customer context injection. At scale: LLM with customer history, brand voice guidelines, A/B test result feedback.
- **No auth**: Skipped for this scope. Production would use JWT/OAuth2 with role-based access control.
- **Single DB**: PostgreSQL is appropriate here. At 10M+ customers, the segment discovery queries would move to a dedicated analytics store (ClickHouse/BigQuery).
