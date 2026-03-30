# Product Launch Hub

Internal GTM launch management platform for Aceable. Replaces Airtable with a custom Next.js app backed by PostgreSQL, with n8n handling all workflow automation.

---

## What it does

| Feature | Description |
|---|---|
| **Launch Calendar** | Monthly kanban view of all launches — mirrors the Course Dashboard layout with vertical badges and launch dates |
| **Intake Form** | Creates a new launch, fires the n8n automation webhook, and auto-generates all 73 GTM tasks |
| **One-Pager** | Full document view and edit form for every launch — executive summary, positioning, pricing, competitive intel, regulatory notes, and more |
| **Task Dashboard** | Bar chart + pivot table of all GTM tasks broken down by phase (Pre-Launch → Soft Launch → Hard Launch → Post-Launch) |
| **GTM Task Tracking** | Per-launch and global task tables showing assignee, work source type, status, and dependencies |

---

## Tech stack

| Layer | Tool |
|---|---|
| Frontend + API | Next.js 14 (App Router) |
| Database | PostgreSQL (Railway) |
| ORM | Drizzle ORM |
| Automation | n8n (self-hosted or cloud) |
| Styling | Tailwind CSS |
| Hosting | Railway |

---

## Project structure

```
product-launch-hub/
├── migrations/
│   └── 0001_initial.sql        # Full schema + GTM task template seed data
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Launch calendar (home)
│   │   ├── launches/
│   │   │   ├── new/page.tsx                  # Intake form
│   │   │   └── [id]/
│   │   │       ├── page.tsx                  # Launch overview
│   │   │       ├── one-pager/page.tsx         # One-pager document view
│   │   │       ├── one-pager/edit/page.tsx    # One-pager edit form
│   │   │       └── tasks/page.tsx             # GTM tasks for this launch
│   │   ├── tasks/
│   │   │   ├── page.tsx                      # Task dashboard (charts + pivot)
│   │   │   └── all/page.tsx                  # All tasks across all launches
│   │   └── api/
│   │       ├── launches/route.ts             # GET all / POST new launch
│   │       └── launches/[id]/
│   │           └── one-pager/route.ts        # GET / PATCH one-pager content
│   ├── components/
│   │   ├── layout/Sidebar.tsx
│   │   ├── launches/
│   │   │   ├── LaunchCalendar.tsx
│   │   │   ├── LaunchCard.tsx
│   │   │   ├── IntakeForm.tsx
│   │   │   └── OnePagerEditForm.tsx
│   ├── db/
│   │   ├── schema.ts                         # All Drizzle table definitions
│   │   └── index.ts                          # DB connection
│   └── lib/
│       ├── constants.ts                      # Verticals, phases, badge styles
│       └── utils.ts                          # cn(), formatDate(), groupByMonth()
```

---

## Database schema

### Operational tables

| Table | Purpose |
|---|---|
| `launches` | Core launch record — name, brand, vertical, state, dates, status |
| `one_pagers` | 1:1 with launches — all rich text content (positioning, pricing, research) |
| `launch_products` | Products linked to a launch with per-variant pricing |
| `gtm_tasks` | Per-launch task instances, auto-created from templates on intake |
| `assets` | Marketing asset tracking per launch |

### Reference tables

| Table | Purpose |
|---|---|
| `gtm_task_templates` | Master set of GTM tasks — seeded with 18, add the rest to reach 73 |
| `products` | Products & Bundles catalog |
| `brands` | Brand guidelines |
| `personas` | Customer persona profiles |
| `state_regulatory_rules` | State-level ad rules and compliance |
| `competitors` | Competitive intelligence |
| `budget_allocation_rules` | Budget guidelines by market presence |
| `pmm_assignments` | PMM to brand/vertical mapping |
| `notification_log` | Audit log of all Slack/system notifications sent |

---

## Automation flow

```
User submits intake form
        ↓
POST /api/launches
  → Creates launch record in Postgres
  → Creates empty one-pager row
  → Instantiates all GTM tasks from templates
  → Fires N8N_WEBHOOK_URL if status = "Kick off automation"
        ↓
n8n workflow:
  → Creates Jira ticket
  → Sends Slack to PMM + Product Ops
  → Triggers downstream workflows (Jarvis setup, SEO, etc.)
        ↓
As each n8n phase completes, it POSTs back to update
the launch record (jira_key, jarvis_course_id, staging_url, etc.)
```

---

## Local development

### 1. Clone and install

```bash
git clone https://github.com/aceable-ai/Go-to-market-automation-app.git
cd Go-to-market-automation-app
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/product_launch_hub
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/product-launch-intake
```

### 3. Set up the database

Run the migration against your Postgres instance:

```bash
psql $DATABASE_URL -f migrations/0001_initial.sql
```

Or use Drizzle to push the schema directly:

```bash
npm run db:push
```

### 4. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:3000`.

---

## Deploying to Railway

### 1. Create the project

1. Go to [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → select `aceable-ai/Go-to-market-automation-app`
3. Railway will detect Next.js automatically

### 2. Add a Postgres database

1. In your Railway project → **New Service** → **Database** → **PostgreSQL**
2. Copy the `DATABASE_URL` from the Postgres service's **Connect** tab

### 3. Add environment variables

In your Next.js service → **Variables**:

```
DATABASE_URL=<from Railway Postgres>
N8N_WEBHOOK_URL=<your n8n webhook URL>
```

### 4. Run the migration

Using the Railway CLI or the Postgres service's query console, run:

```sql
-- paste contents of migrations/0001_initial.sql
```

### 5. Deploy

Railway auto-deploys on every push to `main`. Build command: `npm run build`. Start command: `npm run start`.

---

## Adding GTM task templates

The migration seeds 18 task templates from the visible screenshot. To add the remaining tasks to reach 73, insert rows into `gtm_task_templates`:

```sql
INSERT INTO gtm_task_templates
  (name, launch_phase, work_source_type, default_assignee, dependency_names, sort_order)
VALUES
  ('Your task name', 'Pre-Launch', 'Human', 'Assignee Name', NULL, 19),
  ('Another task',   'Hard Launch','WF: Asset Generator', 'Peggy Black', ARRAY['Asset Matrix'], 20);
```

Valid values:
- **launch_phase:** `Pre-Launch` | `Soft Launch` | `Hard Launch` | `Post-Launch`
- **work_source_type:** `Human` | `WF: Landing Page Generator` | `WF: One Pager Generator` | `WF: Asset Generator`

Every new launch created via the intake form will automatically get all templates instantiated as tasks.

---

## Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `N8N_WEBHOOK_URL` | No | n8n webhook to fire on new launch creation. If not set, launch is still created — automation just won't trigger. |

---

## Contributing

Branch off `main`, open a PR to `aceable-ai/Go-to-market-automation-app`. Railway preview environments can be configured to deploy each PR branch automatically.
