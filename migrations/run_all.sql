-- run_all.sql
-- Single file to build and seed the GTM Database from scratch.
-- Safe to run on a fresh Neon database.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Core tables ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS launches (
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

CREATE TABLE IF NOT EXISTS one_pagers (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  launch_id                   UUID REFERENCES launches(id) ON DELETE CASCADE,
  airtable_record_id          TEXT UNIQUE,
  launch_name                 TEXT,

  -- PMM workflow
  pmm_status                  TEXT DEFAULT 'draft',
  pmm_owner                   TEXT,
  pmm_notes                   TEXT,
  jira_ticket_id              TEXT,
  jira_pushed_at              TIMESTAMPTZ,

  -- Executive Summary
  position_statement          TEXT,
  regulatory_status           TEXT,
  key_market_differentiator   TEXT,
  launch_goal                 TEXT,
  executive_summary           TEXT,

  -- Scope & Offer
  source_courses_and_bundles  TEXT,
  pricing_table               TEXT,
  ecom_pages                  TEXT,
  regulatory_notes            TEXT,
  regulatory_context          TEXT,
  scope_offer_features        TEXT,
  final_promo_code            TEXT,
  pricing_notes               TEXT,
  final_msrp                  JSONB,
  final_sale_price            JSONB,
  final_promo_price           JSONB,
  discount_strategy           TEXT,

  -- Competitive
  competitive_landscape       TEXT,
  competitive_position        TEXT,
  exploitable_market_gaps     TEXT,
  differentiation_points      TEXT,

  -- Audience
  audience_insights           TEXT,
  behavioral_insights         TEXT,
  personas                    TEXT,
  seasonal_trends             TEXT,
  objection_handling          TEXT,

  -- Messaging
  value_prop_positioning      TEXT,
  brand_positioning_statement TEXT,
  state_specific_messaging    TEXT,
  messaging_angles            TEXT,
  messaging_guidelines        TEXT,

  -- Social proof
  trust_signals               TEXT,
  pass_guarantee_terms        TEXT,
  testimonials                TEXT,

  -- Market & GTM
  market_presence_status      TEXT,
  budget_tof_pct              INTEGER,
  budget_mof_pct              INTEGER,
  budget_bof_pct              INTEGER,
  budget_rationale            TEXT,
  tof_channel_strategy        TEXT,
  mof_channel_strategy        TEXT,
  bof_channel_strategy        TEXT,

  -- Research
  market_data                 TEXT,
  salary_data                 TEXT,

  -- App store
  app_store_subtitle          TEXT,
  app_store_promo_text        TEXT,
  app_store_description       TEXT,
  app_store_keywords          TEXT,
  play_store_short_description TEXT,
  play_store_full_description TEXT,

  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS launch_products (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  launch_id    UUID REFERENCES launches(id) ON DELETE CASCADE,
  product_name TEXT,
  msrp         DECIMAL(10,2),
  sale_price   DECIMAL(10,2),
  promo_price  DECIMAL(10,2)
);

-- ─── GTM Tasks ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gtm_task_templates (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                    TEXT NOT NULL,
  launch_phase            TEXT,
  work_source_type        TEXT,
  default_assignee        TEXT,
  channel                 TEXT,
  day_offset              INTEGER,
  duration_business_days  INTEGER,
  people_hours            DECIMAL(10,2),
  measure_of_success      TEXT,
  optimization_opportunity BOOLEAN DEFAULT false,
  optimization_notes      TEXT,
  linked_docs             TEXT,
  is_template             BOOLEAN DEFAULT false,
  dependency_names        TEXT[],
  sort_order              INTEGER
);

CREATE TABLE IF NOT EXISTS gtm_tasks (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  launch_id              UUID REFERENCES launches(id) ON DELETE CASCADE,
  template_id            UUID REFERENCES gtm_task_templates(id),
  name                   TEXT NOT NULL,
  launch_phase           TEXT,
  work_source_type       TEXT,
  assignee               TEXT,
  channel                TEXT,
  day_offset             INTEGER,
  duration_business_days INTEGER,
  people_hours           DECIMAL(10,2),
  measure_of_success     TEXT,
  status                 TEXT DEFAULT 'Backlog',
  dependencies           TEXT[],
  comments               TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  completed_at           TIMESTAMPTZ
);

-- ─── Assets ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assets (
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

CREATE TABLE IF NOT EXISTS products (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name               TEXT NOT NULL,
  is_bundle          BOOLEAN DEFAULT false,
  vertical           TEXT,
  features           JSONB,
  state_availability TEXT[],
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brands (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  value_proposition TEXT,
  differentiators   TEXT,
  tone              TEXT
);

CREATE TABLE IF NOT EXISTS personas (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  motivations          TEXT,
  messaging_focus      TEXT,
  channel_preferences  TEXT[]
);

CREATE TABLE IF NOT EXISTS state_regulatory_rules (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state                   TEXT,
  state_name              TEXT,
  brand                   TEXT,
  vertical                TEXT,
  status                  TEXT DEFAULT 'Todo',
  pre_license_required    BOOLEAN DEFAULT false,
  state_approval_required BOOLEAN DEFAULT false,
  regulatory_body         TEXT,
  hours_required          INTEGER,
  required_disclaimers    TEXT,
  state_notes             TEXT,
  ad_rules                TEXT,
  disclaimers             TEXT,
  compliance_notes        TEXT
);

CREATE TABLE IF NOT EXISTS competitors (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  vertical       TEXT,
  coverage       TEXT,
  states         TEXT[],
  price_range    TEXT,
  promotions     TEXT,
  key_features   TEXT,
  strengths      TEXT,
  weaknesses     TEXT,
  rating         TEXT,
  pass_guarantee TEXT,
  website        TEXT,
  last_updated   DATE,
  pricing        JSONB,
  features       TEXT
);

CREATE TABLE IF NOT EXISTS budget_allocation_rules (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                  TEXT,
  market_presence       TEXT,
  vertical              TEXT,
  tof_pct               DECIMAL(5,2),
  mof_pct               DECIMAL(5,2),
  bof_pct               DECIMAL(5,2),
  rationale             TEXT,
  allocation_guidelines JSONB
);

CREATE TABLE IF NOT EXISTS pmm_assignments (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pmm_name  TEXT,
  brand     TEXT,
  vertical  TEXT,
  pmm_email TEXT,
  slack_id  TEXT
);

CREATE TABLE IF NOT EXISTS notification_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  launch_id  UUID REFERENCES launches(id) ON DELETE SET NULL,
  recipient  TEXT,
  channel    TEXT,
  phase      INTEGER,
  message    TEXT,
  sent_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Landing Pages ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS landing_pages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  launch_id        UUID REFERENCES launches(id) ON DELETE CASCADE NOT NULL,
  product_name     TEXT NOT NULL,
  state            TEXT,
  vertical         TEXT,
  phase            INTEGER NOT NULL,
  slug             TEXT,
  status           TEXT DEFAULT 'draft',
  cart_enabled     BOOLEAN DEFAULT false,
  craft_entry_id   TEXT,
  page_title       TEXT,
  meta_title       TEXT,
  meta_description TEXT,
  hero_headline    TEXT,
  hero_subheadline TEXT,
  hero_cta_text    TEXT,
  hero_cta_url     TEXT,
  body_content     TEXT,
  value_prop_bullets JSONB,
  pricing_block    JSONB,
  features         JSONB,
  faq              JSONB,
  state_disclaimer TEXT,
  waitlist_form_id TEXT,
  raw_content      JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Triggers ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS launches_updated_at    ON launches;
DROP TRIGGER IF EXISTS one_pagers_updated_at  ON one_pagers;
DROP TRIGGER IF EXISTS landing_pages_updated_at ON landing_pages;

CREATE TRIGGER launches_updated_at
  BEFORE UPDATE ON launches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER one_pagers_updated_at
  BEFORE UPDATE ON one_pagers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER landing_pages_updated_at
  BEFORE UPDATE ON landing_pages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_launches_date        ON launches(hard_launch_date);
CREATE INDEX IF NOT EXISTS idx_launches_status      ON launches(status);
CREATE INDEX IF NOT EXISTS idx_launches_vertical    ON launches(vertical);
CREATE INDEX IF NOT EXISTS idx_gtm_tasks_launch     ON gtm_tasks(launch_id);
CREATE INDEX IF NOT EXISTS idx_gtm_tasks_phase      ON gtm_tasks(launch_phase);
CREATE INDEX IF NOT EXISTS idx_gtm_tasks_status     ON gtm_tasks(status);
CREATE INDEX IF NOT EXISTS idx_gtm_tasks_assignee   ON gtm_tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_landing_pages_launch ON landing_pages(launch_id);
CREATE INDEX IF NOT EXISTS idx_landing_pages_status ON landing_pages(status);
CREATE INDEX IF NOT EXISTS idx_landing_pages_phase  ON landing_pages(phase);

-- ─── GTM Task Templates (all 73) ─────────────────────────────────────────────

INSERT INTO gtm_task_templates (
  name, launch_phase, work_source_type, default_assignee,
  channel, day_offset, duration_business_days, people_hours,
  measure_of_success, optimization_opportunity, optimization_notes,
  linked_docs, is_template, dependency_names, sort_order
) VALUES
('Persona Creative Cues','Pre-Launch','WF: One Pager Generator','Tim Johnson','PMM',-56,14,1.00,NULL,false,NULL,NULL,true,NULL,1),
('Create One-Pager Brief','Pre-Launch','WF: One Pager Generator','Tim Johnson','PMM',-49,4,1.00,NULL,true,NULL,NULL,true,ARRAY['Persona Creative Cues'],2),
('Waitlist List Creation','Pre-Launch','WF: Landing Page Generator','Tim Johnson','Email',-63,3,1.00,'Setup only — no send metric',false,NULL,NULL,true,NULL,3),
('URL & Architecture Finalization','Pre-Launch','WF: Landing Page Generator','Brooke Elliott','Website',-63,2,1.50,NULL,true,NULL,NULL,true,NULL,4),
('Pre-Launch SERP Competitor Audit','Pre-Launch','Human','Brooke Elliott','SEO',-42,10,6.00,'# of sessions',false,NULL,NULL,true,NULL,5),
('Asset Planning & Channel Alignment','Pre-Launch','WF: Asset Generator','Peggy Black','Asset Production',-42,10,7.00,'Reduce planning time by 10%',true,NULL,NULL,true,ARRAY['Create One-Pager Brief'],6),
('Index New Pages in GSC','Pre-Launch','Human','Brooke Elliott','SEO',-42,1,2.00,NULL,false,NULL,NULL,false,NULL,7),
('Draft & Approve Waitlist Page','Pre-Launch','WF: Landing Page Generator','Brooke Elliott','SEO',-42,10,10.00,'Indexed in GSC within 10 days; ≥2% email form conversion rate',true,'Use previous state LP templates for faster launch',NULL,true,ARRAY['Asset Production Matrix Development','Waitlist List Creation','URL & Architecture Finalization'],8),
('No Index / No Follow Product Pages','Pre-Launch','WF: Landing Page Generator','Brooke Elliott','SEO',-42,1,1.00,NULL,false,NULL,NULL,false,NULL,9),
('Asset Production Matrix Development','Pre-Launch','WF: Asset Generator','Peggy Black','Asset Production',-35,10,1.00,'Increase asset reuse by 10%',true,NULL,NULL,true,ARRAY['Asset Planning & Channel Alignment'],10),
('3-4 Email State Nurture Campaigns','Pre-Launch','WF: Asset Generator','Spencer Post','Email',-35,12,7.00,'OR: 20-35%; CTR: 3-6%',true,NULL,NULL,true,ARRAY['Asset Production Matrix Development'],11),
('Budget Forecasting for New State','Pre-Launch','WF: One Pager Generator','Valencia Bush','Paid',-35,7,8.00,NULL,false,NULL,NULL,false,NULL,12),
('Creative & Ad Copy Development','Pre-Launch','WF: Asset Generator','Valencia Bush','Paid',-35,5,4.00,NULL,true,NULL,NULL,true,ARRAY['Asset Production Matrix Development'],13),
('Keyword Research','Pre-Launch','Human','Valencia Bush','Paid',-35,5,6.00,NULL,true,NULL,NULL,true,NULL,14),
('Build Net New Waitlist Page in Vision','Pre-Launch','WF: Landing Page Generator','Brooke Elliott','Website',-35,5,2.00,NULL,false,NULL,NULL,false,ARRAY['Draft & Approve Waitlist Page'],15),
('Design Production Management','Pre-Launch',NULL,'Peggy Black','Asset Production',-35,10,4.00,'Reduction in design time by 10%',true,NULL,NULL,true,ARRAY['Asset Production Matrix Development'],16),
('Asset Distribution & Launch Readiness','Pre-Launch',NULL,'Peggy Black','Asset Production',-35,10,1.00,'Linked from ≥1 blog or email; ≥5 tracked downloads',true,'Promote in email sequences as freebie',NULL,true,ARRAY['Asset Production Matrix Development'],17),
('Post Waitlist Page Live','Pre-Launch',NULL,'Brooke Elliott','SEO',-28,10,10.00,'# of email conversions',true,'Use previous state LP templates for faster launch',NULL,true,ARRAY['Draft & Approve Waitlist Page'],18),
('Build KW Tracking in SEMrush','Pre-Launch',NULL,'Brooke Elliott','SEO',-28,2,2.00,NULL,false,NULL,NULL,false,NULL,19),
('MILESTONE: Waitlist Launch','Pre-Launch',NULL,'Tim Johnson','Milestone',-28,0,0.00,NULL,false,NULL,NULL,false,NULL,20),
('PR Kickoff & Messaging Direction','Soft Launch',NULL,'Tim Johnson','PR',-35,2,1.00,NULL,true,NULL,'Must be delivered 4 weeks before hard launch',true,NULL,21),
('PL Product Pages Live','Soft Launch',NULL,'Brooke Elliott','Ecom',-14,10,5.00,'≥2% CTA CTR; ≥1 form submission or purchase start per page',false,NULL,NULL,true,ARRAY['Create One-Pager Brief'],22),
('Nurture - Transactional Onboarding & Offboarding','Soft Launch',NULL,'Spencer Post','Email',-14,10,4.00,'OR: 40-60%; CTR: 5-10%',true,NULL,NULL,true,NULL,23),
('SMS Journeys','Soft Launch',NULL,'Spencer Post','Email',-14,7,5.00,'OR: 15-25%; CTR: 20-30%',true,NULL,NULL,true,NULL,24),
('Course Behavior-Based & Milestone Emails','Soft Launch',NULL,'Spencer Post','Email',-14,10,6.00,'OR: 40-55%; CTR: 5-10%',true,NULL,NULL,true,ARRAY['Asset Production Matrix Development'],25),
('FAQs Development','Soft Launch',NULL,'Brooke Elliott','Ecom',-14,10,2.00,'Visibility & CX Containment',false,NULL,NULL,true,NULL,26),
('Create Storyline & Narrative Document','Soft Launch',NULL,'Tim Johnson','PR',-14,5,0.00,NULL,true,NULL,NULL,false,ARRAY['PR Kickoff & Messaging Direction'],27),
('Launch Announcement Blog Post','Soft Launch',NULL,'Tim Johnson','PR',-14,10,2.00,NULL,false,NULL,NULL,false,ARRAY['PR Kickoff & Messaging Direction'],28),
('Nurture - Abandoned Cart Automations','Soft Launch',NULL,'Spencer Post','Email',-14,10,4.00,'OR: 30-40%; CTR: 6-8%; CVR: 5-12%',true,NULL,NULL,false,ARRAY['Asset Production Matrix Development'],29),
('Build Meta Paid Campaigns (TOF)','Soft Launch',NULL,'Valencia Bush','Paid',-14,2,2.00,'CTR ~1-2%',false,NULL,NULL,false,ARRAY['Asset Production Matrix Development'],30),
('Update Meta Follower Campaign','Soft Launch',NULL,'Valencia Bush','Paid',-14,2,1.00,'Cost Per Follow ~$1.65',false,NULL,NULL,false,ARRAY['Asset Production Matrix Development'],31),
('Add Product to Backend Product & Ecomm Sync','Soft Launch','Human',NULL,'Website',-14,5,NULL,NULL,false,NULL,NULL,false,ARRAY['Create One-Pager Brief'],32),
('Create XCC Checkouts','Soft Launch','Human',NULL,'Website',-14,5,NULL,NULL,false,NULL,NULL,false,ARRAY['Create One-Pager Brief'],33),
('SEO & Accessibility QA Check on Landing Page','Soft Launch','WF: Landing Page Generator',NULL,'Website',-14,1,NULL,NULL,false,NULL,NULL,false,NULL,34),
('Build Targeted Paid Search Campaigns','Soft Launch',NULL,'Valencia Bush','Paid',-14,10,9.00,'ROAS ~1x-1.5x',true,NULL,NULL,false,ARRAY['Keyword Research','Creative & Ad Copy Development'],35),
('Add Product Page to Disambiguation & Dropdown','Soft Launch',NULL,'Brooke Elliott','Website',-14,1,0.50,NULL,false,NULL,NULL,false,NULL,36),
('Add Relevant Content to Product Page Resources','Soft Launch',NULL,'Brooke Elliott','Website',-14,1,2.00,NULL,false,NULL,NULL,false,ARRAY['Build Net New Waitlist Page in Vision'],37),
('Update XML Sitemap','Soft Launch',NULL,'Brooke Elliott','SEO',-14,0,NULL,'Live XML sitemap includes all newly added product and resource article URLs',false,NULL,NULL,false,NULL,38),
('Soft Launch Promotional Offer','Soft Launch',NULL,'Tim Johnson','Multi',-14,10,1.00,NULL,false,NULL,NULL,false,NULL,39),
('MILESTONE: Soft Launch','Soft Launch',NULL,'Tim Johnson','Milestone',-14,0,0.00,NULL,false,NULL,NULL,false,NULL,40),
('PL Press Release','Hard Launch',NULL,'Tim Johnson','PR',-7,5,5.00,'# of syndications',false,NULL,NULL,true,NULL,41),
('Social Launch Announcement','Hard Launch',NULL,'Tim Johnson','Social',-7,10,3.00,'# of engagements',true,NULL,NULL,true,ARRAY['PL Press Release'],42),
('PL Market Now Available Email (All Verticals)','Hard Launch',NULL,'Patricia Ruiz-Rivera','Email',-7,5,2.00,'OR: 15-25%; CTR: 1.3-2.6%; CVR: 2-5%',true,NULL,NULL,true,ARRAY['Asset Production Matrix Development'],43),
('Banner Within Insurance Vertical','Hard Launch',NULL,'Brooke Elliott','Website',-7,5,2.00,'CTR',false,NULL,NULL,false,NULL,44),
('Structured Data Integration','Hard Launch',NULL,'Brooke Elliott','Website',-7,5,NULL,NULL,true,NULL,NULL,true,ARRAY['Build Net New Waitlist Page in Vision'],45),
('Individual Licensing Q Articles (10 pieces)','Hard Launch',NULL,'Brooke Elliott','SEO',-21,12,40.00,'≥5 pageviews per article in 30 days; indexed in GSC within 14 days; bounce rate ≤80%',true,'Batch articles by topic and stagger QA to streamline production; add FAQ schema markup',NULL,true,NULL,46),
('Funnel Journey Pieces (8 articles)','Hard Launch',NULL,'Brooke Elliott','SEO',-14,10,30.00,'CTR ≥0.8%; avg time on page ≥30 seconds; ≥5 pageviews per article in first 30 days',true,'Schedule daily check-ins during content sprint for article progress',NULL,true,NULL,47),
('Comparison Articles','Hard Launch',NULL,'Brooke Elliott','SEO',-7,5,12.00,'≥1 goal completion per article; ≥4 pageviews in 30 days; ≥20 seconds avg time on page',true,'Coordinate with PM for accurate feature data; incorporate product visual tables and FAQ blocks',NULL,true,NULL,48),
('Aggregated FAQ Hub','Hard Launch',NULL,'Brooke Elliott','SEO',-7,3,4.00,'≥10 outbound clicks to FAQ articles from hub in first 30 days',true,'Match FAQ questions 1:1 with articles; track outbound click behavior in GA4',NULL,true,NULL,49),
('Common Ninja Widgets (Quiz, Calculator, Comparison Chart)','Hard Launch',NULL,'Brooke Elliott','SEO',-7,4,6.00,'≥5 user interactions; ≥2 completions; ≤40% abandonment rate',true,'Test CTA placements above and below quiz widget; validate logic flows for all quiz states',NULL,true,NULL,50),
('Run State-Specific Pop-Up on Articles','Hard Launch',NULL,'Brooke Elliott','Website',-7,3,2.00,'≥5 leads or clicks to waitlist/product page in first 14 days',false,NULL,NULL,false,NULL,51),
('State-Specific Dual Licensing White Paper','Hard Launch',NULL,'Brooke Elliott','SEO',-7,5,4.00,'≥15 sessions in first 30 days; ≥1% CTR from email to blog; ≥1 tracked email lead or waitlist click',false,NULL,NULL,false,NULL,52),
('RE Cross-Sell Email Campaign','Hard Launch',NULL,'Spencer Post','Email',-7,5,3.00,'OR: 18-30%; CTR: 2-4%; CVR: 5%+',true,NULL,NULL,true,NULL,53),
('Create Coupon Codes','Hard Launch','WF: Promo Code Generator',NULL,'Ecom',0,1,0.00,NULL,false,NULL,NULL,false,NULL,54),
('Change Waitlist into Product Page','Hard Launch',NULL,'Brooke Elliott','Website',0,1,1.00,NULL,false,NULL,NULL,false,NULL,55),
('MILESTONE: Hard Launch','Hard Launch',NULL,'Tim Johnson','Milestone',0,0,0.00,NULL,false,NULL,NULL,false,NULL,56),
('Alumni Referrals Campaign','Post-Launch',NULL,'Spencer Post','Email',1,5,2.00,'OR: 20-35%; CTR: 3-5%; CVR: 3-7%',true,NULL,NULL,true,NULL,57),
('Post-Launch Asset Review','Post-Launch',NULL,'Peggy Black','Asset Production',1,5,2.00,NULL,true,NULL,NULL,true,ARRAY['Design Production Management'],58),
('Post-Launch Performance Review (Website)','Post-Launch',NULL,'Tim Johnson','Website',1,10,NULL,NULL,true,NULL,NULL,false,NULL,59),
('Execute Internal Linking Plan','Post-Launch',NULL,'Brooke Elliott','Website',1,5,NULL,NULL,true,NULL,NULL,false,NULL,60),
('PL Product Demo Video','Post-Launch','Human','Spencer Post','Multi',1,20,10.00,'Video completion rate: 30-50%; CTR: 3-6%; CVR 5%+ if tracked post-view',true,NULL,NULL,true,NULL,61),
('Source Nano-Creator Partners','Post-Launch','Human','Patricia Ruiz-Rivera','Social',1,20,10.00,'# of creators secured',false,NULL,NULL,true,NULL,62),
('Create Persona Based Content (3-4 pieces)','Post-Launch',NULL,'Brooke Elliott','SEO',1,10,4.00,'Sessions',false,NULL,NULL,true,ARRAY['Create One-Pager Brief'],63),
('Influencer Campaign - State INS PL Intro','Post-Launch',NULL,'Patricia Ruiz-Rivera','Social',1,20,10.00,'# of engagements and views',false,NULL,NULL,true,NULL,64),
('Set Up Trustpilot Reviews Collection','Post-Launch',NULL,'Brooke Elliott','Website',1,2,5.00,'Minimum 5 reviews; CVR; CTR on page with reviews',false,NULL,NULL,true,NULL,65),
('Mark Up Testimonials & Reviews in Schema','Post-Launch',NULL,'Patricia Ruiz-Rivera','Website',1,2,NULL,NULL,true,NULL,NULL,false,ARRAY['Set Up Trustpilot Reviews Collection'],66),
('Market PL Intro Reels/Video (3-5 videos)','Post-Launch',NULL,'Patricia Ruiz-Rivera','Social',1,10,2.00,'# of views; # of engagements',false,NULL,NULL,true,NULL,67),
('Email to Driving Alumni & Parents','Post-Launch','WF: Asset Generator','Spencer Post','Email',1,7,4.00,'OR: 15-25%; CTR: 2-5%; CVR: 3-7%',true,NULL,NULL,true,NULL,68),
('Recruiter/Affiliate Outreach & Discovery','Post-Launch',NULL,'Patricia Ruiz-Rivera','B2B',1,5,NULL,NULL,false,NULL,NULL,true,NULL,69),
('Outbound Campaign - Insurance Brokerages','Post-Launch','WF: Asset Generator',NULL,'B2B',1,10,NULL,NULL,false,NULL,NULL,true,NULL,70),
('Take Down Promotional Banners & Ads','Post-Launch','WF: Launch Promotion Automation','Brooke Elliott','Multi',1,10,1.00,NULL,false,NULL,NULL,true,NULL,71),
('Confirm All Hypercare Activities Complete','Post-Launch',NULL,'Tim Johnson','PMM',14,0,0.00,NULL,false,NULL,NULL,true,NULL,72),
('Add new product to the Promotion templates in Jarvis',NULL,'Human','Tim Johnson',NULL,NULL,NULL,NULL,NULL,false,NULL,NULL,false,NULL,73);


-- ─── Budget Allocation Rules ───────────────────────────────────────────────────

INSERT INTO budget_allocation_rules (name, market_presence, vertical, tof_pct, mof_pct, bof_pct, rationale, allocation_guidelines) VALUES
('INS - Budget Allocation (Strong Market)','Strong','INS',20.00,45.00,35.00,
'ToF (20%): Light awareness spend—brand already has recognition. Channels: Meta, Organic SEO. MoF (45%): Heavy investment in differentiation and credibility since audience is actively comparing. Channels: Paid Search, Meta Retargeting, Email/SMS Nurture, LinkedIn. BoF (35%): Strong conversion focus—leverage existing trust with guarantees, testimonials, promos. Channels: Paid Search, Meta Retargeting, Email/SMS.',
'{"tof_pct":20,"mof_pct":45,"bof_pct":35}'),
('INS - Budget Allocation (Emerging Market)','Emerging','INS',30.00,40.00,30.00,
'ToF (30%): Increased awareness spend to establish Aceable Insurance as a credible option. Channels: Meta, Organic SEO, YouTube. MoF (40%): Balanced differentiation. Channels: Paid Search, Meta Retargeting, Email/SMS Nurture, LinkedIn. BoF (30%): Moderate conversion focus. Channels: Paid Search, Meta Retargeting, Email/SMS.',
'{"tof_pct":30,"mof_pct":40,"bof_pct":30}'),
('INS - Budget Allocation (New Market)','New','INS',40.00,35.00,25.00,
'ToF (40%): Heavy awareness investment—must establish Aceable as a trusted name before asking for conversion. Channels: Meta, Organic SEO, YouTube, PR/partnerships. MoF (35%): Build credibility and differentiation. Channels: Paid Search, Meta Retargeting, Email/SMS Nurture, LinkedIn. BoF (25%): Lower conversion spend. Channels: Paid Search (brand + high-intent), Email/SMS.',
'{"tof_pct":40,"mof_pct":35,"bof_pct":25}');


-- ─── State Regulatory Rules ───────────────────────────────────────────────────

INSERT INTO state_regulatory_rules (state, state_name, vertical, status, pre_license_required, state_approval_required, regulatory_body, hours_required, required_disclaimers, state_notes, ad_rules) VALUES
('Arizona','Arizona Insurance Pre-License Advertising Rules','Insurance','Done',false,false,'Arizona Dept of Insurance & Financial Institutions (ADOI)',NULL,'Provider approval number','PSI. Exam prep recommended but not mandated.','No course may be advertised or otherwise promoted as appropriate for Arizona CE credit until it has been approved in writing. Provider approval number required. 30 days approval lead time.'),
('Massachusetts','Massachusetts Insurance Pre-License Advertising Rules','Insurance','Done',false,false,'MA Division of Insurance',NULL,'Provider identification','Prometric. No prelicensing courses required.','Standard NAIC guidelines — cannot advertise as approved until written approval received. Provider identification required. 30 days standard approval lead time.'),
('Georgia','Georgia Insurance Pre-License Advertising Rules','Insurance','Done',true,true,'Office of Commissioner of Insurance and Safety Fire (OCI)',8,'Approval statement with credit hours, cost, cancellation procedures, tuition refund policy','Pearson VUE. 8 hrs per single line. 40 hrs combined Life, Accident & Sickness.','Advertisements MUST contain the statement: ''This course is approved by the Georgia Division of Insurance for Continuing Education Credit'' followed by number of credit hours. 15 business days review.'),
('Ohio','Ohio Insurance Pre-License Advertising Rules','Insurance','Done',true,true,'Ohio Department of Insurance',20,'Provider identification, credit hours','PSI. 20 hrs per major line. Certificate valid 180 days.','Standard NAIC guidelines — cannot advertise as approved until written confirmation received. Provider identification and credit hours required. 30 days standard approval lead time.'),
('California','California Insurance Pre-License Advertising Rules','Insurance','Done',false,true,'California Department of Insurance (CDI)',12,'License number on all print advertising, business cards, premium quotes','Prometric. Effective Jan 1, 2026: 20-hr general prelicensing eliminated. 12-hr Code & Ethics still required (incl. 1 hr fraud).','May advertise as pending with required disclaimer. License numbers required on business cards, premium quotes, and print ads distributed exclusively in California.'),
('Tennessee','Tennessee Insurance Pre-License Advertising Rules','Insurance','Done',false,false,'TN Dept of Commerce & Insurance',NULL,'Provider identification, credit hours','Pearson VUE. No prelicensing course requirements.','Standard NAIC guidelines — cannot advertise as approved until written approval received. 30 days standard approval lead time.'),
('Washington','Washington Insurance Pre-License Advertising Rules','Insurance','Done',false,false,'WA Office of Insurance Commissioner',NULL,'Provider identification','Prometric. Eliminated prelicensing requirement.','Standard NAIC guidelines — cannot advertise as approved until written approval received. 30 days standard approval lead time.'),
('New York','New York Insurance Pre-License Advertising Rules','Insurance','Done',true,true,'NY Department of Financial Services (DFS)',20,'Full insurer name, principal office location, form numbers','PSI. L&H: 40 hrs | P&C: 90 hrs | A&H only: 20 hrs | Personal Lines: 40 hrs. Max 8 hrs study/day. Certificate valid lifetime.','Must include full insurer name AND city/town/village of principal office. Cannot use trade names without full legal entity name.'),
('Florida','Florida Insurance Pre-License Advertising Rules','Insurance','Done',true,true,'FL Dept of Financial Services (DFS)',30,'Insurer name, form number of policy advertised','Pearson VUE. Life: 30 hrs | Health: 40 hrs | L&H: 60 hrs | P&C General Lines: 200 hrs | Personal Lines: 60 hrs. Includes 3 hrs ethics.','Advertising a course as approved or soliciting attendance for any course that has not yet been approved is a VIOLATION. Must submit course offerings 30 days prior to class.'),
('Louisiana','Louisiana Insurance Pre-License Advertising Rules','Insurance','Todo',false,false,'LA Dept of Insurance',NULL,'TBD','Prometric. Eliminated prelicensing requirement prior to 2024.','Standard NAIC guidelines — research specific rules. TBD approval lead time.'),
('South Carolina','South Carolina Insurance Pre-License Advertising Rules','Insurance','Todo',false,false,'SC Dept of Insurance',NULL,'TBD','Pearson VUE. No prelicensing education required.','Standard NAIC guidelines — research specific rules. TBD approval lead time.'),
('Michigan','Michigan Insurance Pre-License Advertising Rules','Insurance','Todo',true,true,'MI DIFS (Dept of Insurance & Financial Services)',20,'TBD','PSI. 20 hrs per line of authority. Certificate submitted with license application to DIFS.','Standard NAIC guidelines — research specific rules. TBD approval lead time.'),
('Oklahoma','Oklahoma Insurance Pre-License Advertising Rules','Insurance','Todo',false,false,'OK Insurance Department',NULL,'TBD','PSI. No prelicensing education required.','Standard NAIC guidelines — research specific rules. TBD approval lead time.'),
('North Carolina','North Carolina Insurance Pre-License Advertising Rules','Insurance','Done',false,false,'NC Dept of Insurance (NCDOI)',NULL,'Provider number, credit hours','Pearson VUE. Eliminated effective Oct 1, 2025 (was 40 hrs). HB 737 passed.','This course may NOT be advertised or offered as approved in the state until approval has been received from the insurance department.'),
('Colorado','Colorado Insurance Pre-License Advertising Rules','Insurance','Todo',true,true,'CO Division of Insurance',50,'TBD','Pearson VUE. 50 hrs per line. Includes 3 hrs Principles, 4 hrs Legal Concepts, 3 hrs Ethics. Certificate valid 1 year.','Standard NAIC guidelines — research specific rules. TBD approval lead time.'),
('Maryland','Maryland Insurance Pre-License Advertising Rules','Insurance','Todo',false,false,'MD Insurance Administration',NULL,'Provider number, credit hours','Prometric. Eliminated effective Oct 1, 2024.','Standard NAIC guidelines — cannot advertise until approved. 15 days before presenting approval lead time.'),
('New Jersey','New Jersey Insurance Pre-License Advertising Rules','Insurance','Todo',true,true,'NJ DOBI (Dept of Banking & Insurance)',20,'TBD','PSI. 20 hrs per line of authority. Proctored certification exam required. Fingerprinting required.','Standard NAIC guidelines — research specific rules. TBD approval lead time.'),
('Indiana','Indiana Insurance Pre-License Advertising Rules','Insurance','Todo',true,true,'IN Dept of Insurance (IDOI)',20,'Provider identification','Pearson VUE. 20 hrs per line of authority. Certificate valid 6 months.','Standard NAIC guidelines — cannot advertise until approved. TBD approval lead time.');


-- ─── Competitors ──────────────────────────────────────────────────────────────

INSERT INTO competitors (name, vertical, coverage, price_range, key_features, strengths, weaknesses, rating, pass_guarantee, website, last_updated) VALUES
('A.D. Banker','Insurance','National','PL: ~$169–$232 (Silver/Gold/Platinum tiers). CE: ~$30–$50 for 24-hr packages.','3-part learning system; chapter assessments & unlimited final exams; mobile-friendly & audio-enabled; live webinar CE; 60-day PL access; flashcards and cram sheets; Spanish-language courses; A.D. Banker for Business enterprise portal','Comprehensive national coverage (all 50 states). Strong enterprise solutions with bulk enrollment and student tracking. Multiple learning formats. Well-established brand trusted by top banks and insurance companies. Robust CE library.','A la carte tools expensive when not bundled. Self-paced format requires discipline. Some content errors reported. Customer service complaints around CE reporting delays. 60-day PL access is short.',NULL,NULL,'https://www.adbanker.com','2025-02-05'),
('XCEL Solutions','Insurance','National','PL: ~$199 standard. Corporate/partner discounts available (as low as $49.99).','3-part training (Pre-Licensing → Prep Review → Exam Simulators); bite-size intro/summary videos; 3 simulators weighted to match state exam; unlimited retakes; 30-day access per phase; 95% self-reported pass rate; Spanish-language courses; 150,000+ students annually','Strong 3-part structured methodology. Exam simulators weighted by topic to mirror actual state exams. Excellent corporate/agency partnerships. High self-reported pass rates (95%). Clean, modern platform. Strong brand in agency channel. Available all 50 states for L&H.','30-day access per phase is short. Less brand recognition among individual consumers. Limited course format options. CE library smaller than competitors. Pricing not transparent on website.',NULL,NULL,'https://www.xcelsolutions.com','2025-02-05'),
('Kaplan Financial Education','Insurance','National','PL: All packages under $400 (4 tiers). CE: Total Access subscription ~$39–$49. 60-day PL access.','Prepare-Practice-Perform methodology; 4-tier packages (Basic, Essential, EssentialPlus, Career Launcher); InsurancePro QBank; customizable Study Plan; direct instructor email access; Kaplan Commitment® pass guarantee; 80+ CE courses; 93% self-reported pass rate','Most recognized and trusted brand — named Best Overall by StateRequirement. Highest-rated customer satisfaction (4.7/5 on Trustpilot). Direct instructor access even on lowest packages. In-person courses in 12 states. Extensive CE library with Total Access subscription. Kaplan Commitment® pass guarantee.','CE courses significantly harder than competitors. 60-day access relatively short; extensions cost extra. Premium packages can be pricey. In-person classes limited to 12 states.','4.7/5','Kaplan Commitment® pass guarantee (refund if criteria met)','https://www.kaplanfinancial.com','2025-02-05'),
('ExamFX','Insurance','National','PL: ~$199 standard (Video Study Package). 60-day access with extension option ($29.95/30-day). CE: All-access library.','Elite Learning Platform; state-aligned exam content outlines; on-demand video lectures; exam simulators; Study Plan Builder; Readiness Exam for pass prediction; 93% self-reported pass rate; Spanish-language courses in select states; 8M+ candidates trained since 1996','Strong pass guarantee. Most affordable among top-tier providers. 8M+ students trained. Study Plan Builder for customized pacing. Available in 300+ licensing schools. Strong Spanish-language support. Frequent promotional pricing.','CE courses widely criticized as overly difficult. Only 60-day access. Pass Guarantee has strict 3-day window. Website doesn''t display prices transparently. Some ambiguous exam questions reported.','4.2-4.5/5','Pass Guarantee — refund if you score 80%+ on Readiness Exam and fail state exam within 3 days','https://www.examfx.com','2025-02-05'),
('WebCE','Insurance','National','PL Exam Prep: varies by state; 90-day access. CE: below-industry-average pricing; bundle packages available.','Exam Tutor (unlimited practice tests); FlashTutor (digital flashcards); EXCEED reinforcement videos; audio-enabled courses; 90-day PL access (longest among top competitors); same-day CE credit reporting; one-click CE renewal packages; multi-profession platform; 30+ years in business','Undisputed market leader for CE — largest CE library in the industry. Longest PL access period (90 days). CE praised as easiest and most user-friendly. Same-day CE credit reporting — fastest in the industry. Below-industry-average pricing on CE. Strong agency and carrier partnerships.','Pre-licensing considered weaker than Kaplan or ExamFX. FlashTutor criticized as gimmicky. AI read-to-me voice described as robotic. Not the go-to for serious exam prep.','4.0-4.2/5','N/A for CE; pass guarantee on select exam prep products','https://www.webce.com','2025-02-05');


-- ─── Personas ─────────────────────────────────────────────────────────────────

INSERT INTO personas (name, motivations, messaging_focus, channel_preferences) VALUES
('Recruit-Directed Rookie','Pass ASAP to start earning','Simple, recruiter-approved prep you can start now—designed to let you hit the ground running with confidence.',ARRAY['Recruiter Toolkits','Email','SMS']),
('Career Switcher','Transition to a stable new career','Fast-track your new career with tools made for real life—study when you can, pass confidently on your own terms.',ARRAY['Meta','Google Search','YouTube']),
('Ambitious Grad','Launch a growth-oriented career','Game-plan your future with next-gen prep—engaging lessons, mobile-first, and built for ambitious thinkers like you.',ARRAY['Google Search','LinkedIn']),
('Side Hustler','Speedy license-completion, no fluff','Clear. Fast. No fluff. Get licensed and compliant quickly—on your time, on your terms.',ARRAY['Google Search','Referrals']);


-- ─── Brands ───────────────────────────────────────────────────────────────────

INSERT INTO brands (name, value_proposition, differentiators, tone) VALUES
('Aceable Insurance',
'"Prep smarter—not just more—because we''re your biggest fans and invested in your success." Emotional emphasis on support, clarity, speed, and confidence.',
'Mobile-first platform, Adaptive tech, Pass guarantee, Expert support, Clear structure in an unstructured market, Modern UX + real explanations, Designed for first-try pass confidence, Career-forward messaging vs "test cram"',
'Supportive & Motivational, Learner-first, Modern. For regulated/compliance-driven states: Authoritative, Clear, Supportive, Compliance-forward.');


-- ─── Products ─────────────────────────────────────────────────────────────────

INSERT INTO products (name, is_bundle, vertical, features, state_availability) VALUES
('Life',false,'Insurance','["Available on App","Practice Questions","Flashcards","Video Instruction","Mobile-First Learning","Pass Guarantee"]',ARRAY['National']),
('Life & Health',false,'Insurance','["Available on App","Practice Questions","Flashcards","Video Instruction","Mobile-First Learning","Pass Guarantee","1300+ practice questions","300+ interactive checkpoints","5+ hours of video instruction"]',ARRAY['National']),
('Property & Casualty',false,'Insurance','["1000+ practice questions","750+ quiz + final exam items","250+ interactive learning checkpoints","250+ digital flashcards","9+ hours of on-demand video content"]',ARRAY['National']),
('Personal Lines',false,'Insurance','["Available on App","Practice Questions","Flashcards","Video Instruction","Mobile-First Learning","Pass Guarantee"]',ARRAY['FL']),
('Exam Prep Videos',false,'Insurance','[]',ARRAY['National']),
('Life + Exam Prep Videos',true,'Insurance','[]',ARRAY['National']),
('Life & Health + Exam Prep Videos',true,'Insurance','[]',ARRAY['National']),
('Property & Casualty + Exam Prep Videos',true,'Insurance','[]',ARRAY['National']),
('Personal Lines + Exam Prep Videos',true,'Insurance','[]',ARRAY['National']),
('All-in-One',true,'Insurance','[]',ARRAY['National']),
('Life-Only CE - 24 Hour Package',false,'Insurance','["Available on App","State-Approved Content","3 hours ethics included","Self-Paced Learning","Certificate of Completion","Mobile-First Experience"]',ARRAY['National']),
('Health-Only CE - 24 Hour Package',false,'Insurance','["Available on App","State-Approved Content","3 hours ethics included","Self-Paced Learning","Certificate of Completion","Mobile-First Experience"]',ARRAY['National']),
('Life & Health CE - 24 Hour Package',false,'Insurance','["Available on App","State-Approved Content","3 hours ethics included","Self-Paced Learning","Certificate of Completion","Mobile-First Experience"]',ARRAY['National']),
('Property & Casualty CE - 24 Hour Package',false,'Insurance','["Available on App","State-Approved Content","3 hours ethics included","Self-Paced Learning","Certificate of Completion","Mobile-First Experience"]',ARRAY['National']),
('Annual CE Pass',true,'Insurance','[]',ARRAY['National']);


-- ─── PMM Assignments ──────────────────────────────────────────────────────────

INSERT INTO pmm_assignments (pmm_name, brand, vertical, pmm_email, slack_id) VALUES
('Tim J','Aceable Insurance','INS','timothy.johnson@aceable.com','U09HKPFMVGS'),
('Tim J','Aceable Mortgage','MTG','timothy.johnson@aceable.com','U09HKPFMVGS'),
('Mike C','AceableAgent','RE','michael@aceable.com','U03LJKBGRCH'),
('Matt M','Aceable Driving','DRV','matt.moretti@aceable.com','U047FSUM41X'),
('Matt M','IDS','DRV','matt.moretti@aceable.com','U047FSUM41X'),
('Matt M','DEC','DRV','matt.moretti@aceable.com','U047FSUM41X');
