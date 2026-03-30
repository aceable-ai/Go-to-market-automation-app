-- Landing Pages
-- Run after 0001_initial.sql

CREATE TABLE landing_pages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  launch_id        UUID REFERENCES launches(id) ON DELETE CASCADE NOT NULL,

  -- Identity
  product_name     TEXT NOT NULL,
  state            TEXT,
  vertical         TEXT,
  phase            INTEGER NOT NULL,        -- 1 = waitlist | 2 = cart
  slug             TEXT,

  -- Status
  status           TEXT DEFAULT 'draft',    -- draft | ready | published
  cart_enabled     BOOLEAN DEFAULT false,
  craft_entry_id   TEXT,

  -- Page content (written by n8n, editable in UI)
  page_title       TEXT,
  meta_title       TEXT,
  meta_description TEXT,
  hero_headline    TEXT,
  hero_subheadline TEXT,
  hero_cta_text    TEXT,
  hero_cta_url     TEXT,
  body_content     TEXT,
  value_prop_bullets JSONB,   -- string[]
  pricing_block    JSONB,     -- { msrp, salePrice, promoPrice, promoCode }
  features         JSONB,     -- string[]
  faq              JSONB,     -- { question, answer }[]
  state_disclaimer TEXT,
  waitlist_form_id TEXT,

  -- Full raw payload from n8n
  raw_content      JSONB,

  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER landing_pages_updated_at
  BEFORE UPDATE ON landing_pages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_landing_pages_launch_id ON landing_pages(launch_id);
CREATE INDEX idx_landing_pages_status    ON landing_pages(status);
CREATE INDEX idx_landing_pages_phase     ON landing_pages(phase);
