-- Migration 0003: Add missing columns to gtm_task_templates and gtm_tasks
-- Also expands budget_allocation_rules and state_regulatory_rules to match CSV data

-- ─── gtm_task_templates: add missing columns ──────────────────────────────────

ALTER TABLE gtm_task_templates
  ADD COLUMN IF NOT EXISTS channel                TEXT,
  ADD COLUMN IF NOT EXISTS day_offset             INTEGER,
  ADD COLUMN IF NOT EXISTS duration_business_days INTEGER,
  ADD COLUMN IF NOT EXISTS people_hours           DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS measure_of_success     TEXT,
  ADD COLUMN IF NOT EXISTS optimization_opportunity BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS optimization_notes     TEXT,
  ADD COLUMN IF NOT EXISTS linked_docs            TEXT,
  ADD COLUMN IF NOT EXISTS is_template            BOOLEAN DEFAULT false;

-- ─── gtm_tasks: add matching columns so instances carry the data ───────────────

ALTER TABLE gtm_tasks
  ADD COLUMN IF NOT EXISTS channel                TEXT,
  ADD COLUMN IF NOT EXISTS day_offset             INTEGER,
  ADD COLUMN IF NOT EXISTS duration_business_days INTEGER,
  ADD COLUMN IF NOT EXISTS people_hours           DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS measure_of_success     TEXT;

-- ─── state_regulatory_rules: expand to match CSV ─────────────────────────────

ALTER TABLE state_regulatory_rules
  ADD COLUMN IF NOT EXISTS state_name             TEXT,
  ADD COLUMN IF NOT EXISTS regulatory_body        TEXT,
  ADD COLUMN IF NOT EXISTS hours_required         INTEGER,
  ADD COLUMN IF NOT EXISTS required_disclaimers   TEXT,
  ADD COLUMN IF NOT EXISTS state_notes            TEXT,
  ADD COLUMN IF NOT EXISTS pre_license_required   BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS state_approval_required BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS status                 TEXT DEFAULT 'Todo';

-- ─── budget_allocation_rules: expand to match CSV ────────────────────────────

ALTER TABLE budget_allocation_rules
  ADD COLUMN IF NOT EXISTS name                   TEXT,
  ADD COLUMN IF NOT EXISTS vertical               TEXT,
  ADD COLUMN IF NOT EXISTS tof_pct                DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS mof_pct                DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS bof_pct                DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS rationale              TEXT;

-- ─── competitors: expand to match CSV ─────────────────────────────────────────

ALTER TABLE competitors
  ADD COLUMN IF NOT EXISTS coverage               TEXT,
  ADD COLUMN IF NOT EXISTS states                 TEXT[],
  ADD COLUMN IF NOT EXISTS price_range            TEXT,
  ADD COLUMN IF NOT EXISTS promotions             TEXT,
  ADD COLUMN IF NOT EXISTS key_features           TEXT,
  ADD COLUMN IF NOT EXISTS rating                 TEXT,
  ADD COLUMN IF NOT EXISTS pass_guarantee         TEXT,
  ADD COLUMN IF NOT EXISTS website                TEXT,
  ADD COLUMN IF NOT EXISTS last_updated           DATE;

-- ─── pmm_assignments: add email and slack_id ─────────────────────────────────

ALTER TABLE pmm_assignments
  ADD COLUMN IF NOT EXISTS pmm_email              TEXT,
  ADD COLUMN IF NOT EXISTS slack_id               TEXT;

-- ─── Wipe old partial template seed so 0004 can insert the full set ───────────

TRUNCATE TABLE gtm_task_templates CASCADE;
