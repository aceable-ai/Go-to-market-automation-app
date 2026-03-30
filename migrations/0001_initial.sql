-- Product Launch Hub — initial schema
-- Run this against your Railway Postgres database

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Core ─────────────────────────────────────────────────────────────────────

CREATE TABLE launches (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  launch_name       TEXT NOT NULL,
  brand             TEXT,
  vertical          TEXT,
  state             TEXT,
  market_presence   TEXT,
  regulatory_status TEXT,
  hard_launch_date  DATE,
  status            TEXT DEFAULT 'draft',
  jira_key          TEXT,
  jarvis_course_id  TEXT,
  xgrit_product_id  TEXT,
  staging_url       TEXT,
  production_url    TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE one_pagers (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  launch_id                 UUID REFERENCES launches(id) ON DELETE CASCADE,
  brand_content             TEXT,
  product_notes             TEXT,
  executive_summary         TEXT,
  regulatory_context        TEXT,
  competitive_landscape     TEXT,
  audience_insights         TEXT,
  value_prop_positioning    TEXT,
  state_specific_messaging  TEXT,
  pricing_notes             TEXT,
  final_msrp                JSONB,
  final_sale_price          JSONB,
  final_promo_price         JSONB,
  final_promo_code          TEXT,
  competitive_position      TEXT,
  market_data               TEXT,
  salary_data               TEXT,
  scope_offer_features      TEXT,
  seasonal_trends           TEXT,
  regulatory_notes          TEXT,
  exploitable_market_gaps   TEXT,
  messaging_guidelines      TEXT,
  source_courses_and_bundles TEXT,
  persona_message_map       TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE launch_products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  launch_id    UUID REFERENCES launches(id) ON DELETE CASCADE,
  product_name TEXT,
  msrp         DECIMAL(10,2),
  sale_price   DECIMAL(10,2),
  promo_price  DECIMAL(10,2)
);

-- ─── GTM Tasks ────────────────────────────────────────────────────────────────

CREATE TABLE gtm_task_templates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  launch_phase      TEXT,
  work_source_type  TEXT,
  default_assignee  TEXT,
  dependency_names  TEXT[],
  sort_order        INTEGER
);

CREATE TABLE gtm_tasks (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  launch_id        UUID REFERENCES launches(id) ON DELETE CASCADE,
  template_id      UUID REFERENCES gtm_task_templates(id),
  name             TEXT NOT NULL,
  launch_phase     TEXT,
  work_source_type TEXT,
  assignee         TEXT,
  status           TEXT DEFAULT 'Backlog',
  dependencies     TEXT[],
  comments         TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

-- ─── Assets ───────────────────────────────────────────────────────────────────

CREATE TABLE assets (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  launch_id      UUID REFERENCES launches(id) ON DELETE CASCADE,
  asset_name     TEXT,
  asset_type     TEXT,
  channel        TEXT,
  persona        TEXT,
  status         TEXT DEFAULT 'Pending',
  derivative_of  UUID REFERENCES assets(id),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Reference tables ─────────────────────────────────────────────────────────

CREATE TABLE products (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name               TEXT NOT NULL,
  is_bundle          BOOLEAN DEFAULT false,
  vertical           TEXT,
  features           JSONB,
  state_availability TEXT[],
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE brands (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  value_proposition TEXT,
  differentiators   TEXT,
  tone              TEXT
);

CREATE TABLE personas (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  motivations          TEXT,
  messaging_focus      TEXT,
  channel_preferences  TEXT[]
);

CREATE TABLE state_regulatory_rules (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state             TEXT,
  brand             TEXT,
  vertical          TEXT,
  ad_rules          TEXT,
  disclaimers       TEXT,
  compliance_notes  TEXT
);

CREATE TABLE competitors (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  vertical   TEXT,
  pricing    JSONB,
  features   TEXT,
  strengths  TEXT,
  weaknesses TEXT
);

CREATE TABLE budget_allocation_rules (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  market_presence       TEXT,
  allocation_guidelines JSONB
);

CREATE TABLE pmm_assignments (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pmm_name  TEXT,
  brand     TEXT,
  vertical  TEXT
);

CREATE TABLE notification_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  launch_id  UUID REFERENCES launches(id) ON DELETE SET NULL,
  recipient  TEXT,
  channel    TEXT,
  phase      INTEGER,
  message    TEXT,
  sent_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER launches_updated_at
  BEFORE UPDATE ON launches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER one_pagers_updated_at
  BEFORE UPDATE ON one_pagers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_launches_date     ON launches(hard_launch_date);
CREATE INDEX idx_launches_status   ON launches(status);
CREATE INDEX idx_launches_vertical ON launches(vertical);
CREATE INDEX idx_gtm_tasks_launch  ON gtm_tasks(launch_id);
CREATE INDEX idx_gtm_tasks_phase   ON gtm_tasks(launch_phase);
CREATE INDEX idx_gtm_tasks_status  ON gtm_tasks(status);
CREATE INDEX idx_gtm_tasks_assignee ON gtm_tasks(assignee);

-- ─── Seed: GTM task templates (from GTM Task Tracking view) ──────────────────

INSERT INTO gtm_task_templates (name, launch_phase, work_source_type, default_assignee, dependency_names, sort_order) VALUES
  ('Create One-Pager Brief',               'Pre-Launch', 'WF: One Pager Generator',   'Tim Johnson',   ARRAY['Persona Creative Cues'], 1),
  ('Persona Creative Cues',                'Pre-Launch', 'WF: One Pager Generator',   'Tim Johnson',   NULL,                           2),
  ('Budget Forecasting for New State',     'Pre-Launch', 'WF: One Pager Generator',   'Valencia Bush', NULL,                           3),
  ('Pre-Launch SERP Competitor Audit',     'Pre-Launch', 'Human',                     'Brooke Elliott',NULL,                           4),
  ('Keyword Research',                     'Pre-Launch', 'Human',                     'Valencia Bush', NULL,                           5),
  ('Asset Planning & Channel Alignment',   'Pre-Launch', 'WF: Asset Generator',       'Peggy Black',   ARRAY['Create One-Pager Brief'], 6),
  ('Asset Production Matrix Development',  'Pre-Launch', 'WF: Asset Generator',       'Peggy Black',   ARRAY['Asset Planning & Channel Alignment'], 7),
  ('Creative & Ad Copy Development',       'Pre-Launch', 'WF: Asset Generator',       'Valencia Bush', ARRAY['Asset Production Matrix Development'], 8),
  ('Design Production Management',         'Pre-Launch', NULL,                        'Peggy Black',   ARRAY['Asset Production Matrix Development'], 9),
  ('3-4 Email State Nurture Campaigns',    'Pre-Launch', 'WF: Asset Generator',       'Spencer Post',  ARRAY['Asset Production Matrix Development'], 10),
  ('URL & Architecture Finalization',      'Soft Launch','WF: Landing Page Generator','Brooke Elliott',NULL,                           11),
  ('Build Net New Waitlist Page in Vision','Soft Launch','WF: Landing Page Generator','Brooke Elliott',ARRAY['URL & Architecture Finalization'], 12),
  ('Draft & Approve Waitlist Page',        'Soft Launch','WF: Landing Page Generator','Brooke Elliott',ARRAY['Asset Production Matrix Development'], 13),
  ('Post Waitlist Page Live',              'Soft Launch',NULL,                        'Brooke Elliott',ARRAY['Draft & Approve Waitlist Page'], 14),
  ('No Index / No Follow Product Pages',   'Soft Launch','WF: Landing Page Generator','Brooke Elliott',NULL,                           15),
  ('Waitlist List Creation',               'Soft Launch','WF: Landing Page Generator','Tim Johnson',   NULL,                           16),
  ('Index New Pages in GSC',               'Hard Launch','Human',                     'Brooke Elliott',NULL,                           17),
  ('Build KW Tracking in SEMrush',         'Hard Launch',NULL,                        'Brooke Elliott',NULL,                           18);
