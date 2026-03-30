import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  jsonb,
  boolean,
  integer,
  decimal,
} from 'drizzle-orm/pg-core'

// ─── Core ─────────────────────────────────────────────────────────────────────

export const launches = pgTable('launches', {
  id: uuid('id').primaryKey().defaultRandom(),
  launchName: text('launch_name').notNull(),
  brand: text('brand'),
  vertical: text('vertical'),           // INS | RE | MTG | DRV-IDS | DRV-DEC | DRV-ACE
  state: text('state'),
  marketPresence: text('market_presence'), // Emerging | Established | Growing
  regulatoryStatus: text('regulatory_status'),
  hardLaunchDate: date('hard_launch_date'),
  status: text('status').default('draft'), // draft | kick_off_automation | confirmed | live
  jiraKey: text('jira_key'),
  jarvisCourseId: text('jarvis_course_id'),
  xgritProductId: text('xgrit_product_id'),
  stagingUrl: text('staging_url'),
  productionUrl: text('production_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const onePagers = pgTable('one_pagers', {
  id: uuid('id').primaryKey().defaultRandom(),
  launchId: uuid('launch_id').references(() => launches.id, { onDelete: 'cascade' }).notNull(),
  brandContent: text('brand_content'),
  productNotes: text('product_notes'),
  executiveSummary: text('executive_summary'),
  regulatoryContext: text('regulatory_context'),
  competitiveLandscape: text('competitive_landscape'),
  audienceInsights: text('audience_insights'),
  valuePropPositioning: text('value_prop_positioning'),
  stateSpecificMessaging: text('state_specific_messaging'),
  pricingNotes: text('pricing_notes'),
  finalMsrp: jsonb('final_msrp'),
  finalSalePrice: jsonb('final_sale_price'),
  finalPromoPrice: jsonb('final_promo_price'),
  finalPromoCode: text('final_promo_code'),
  competitivePosition: text('competitive_position'),
  marketData: text('market_data'),
  salaryData: text('salary_data'),
  scopeOfferFeatures: text('scope_offer_features'),
  seasonalTrends: text('seasonal_trends'),
  regulatoryNotes: text('regulatory_notes'),
  exploitableMarketGaps: text('exploitable_market_gaps'),
  messagingGuidelines: text('messaging_guidelines'),
  sourceCoursesAndBundles: text('source_courses_and_bundles'),
  personaMessageMap: text('persona_message_map'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const launchProducts = pgTable('launch_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  launchId: uuid('launch_id').references(() => launches.id, { onDelete: 'cascade' }),
  productName: text('product_name'), // All-in-One | Property & Casualty | Life & Health | Life
  msrp: decimal('msrp', { precision: 10, scale: 2 }),
  salePrice: decimal('sale_price', { precision: 10, scale: 2 }),
  promoPrice: decimal('promo_price', { precision: 10, scale: 2 }),
})

// ─── GTM Tasks ────────────────────────────────────────────────────────────────

export const gtmTaskTemplates = pgTable('gtm_task_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  launchPhase: text('launch_phase'),    // Pre-Launch | Soft Launch | Hard Launch | Post-Launch
  workSourceType: text('work_source_type'), // Human | WF: Landing Page Generator | WF: One Pager Generator | WF: Asset Generator
  defaultAssignee: text('default_assignee'),
  dependencyNames: text('dependency_names').array(),
  sortOrder: integer('sort_order'),
})

export const gtmTasks = pgTable('gtm_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  launchId: uuid('launch_id').references(() => launches.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').references(() => gtmTaskTemplates.id),
  name: text('name').notNull(),
  launchPhase: text('launch_phase'),
  workSourceType: text('work_source_type'),
  assignee: text('assignee'),
  status: text('status').default('Backlog'), // Backlog | In Progress | Done | Blocked
  dependencies: text('dependencies').array(),
  comments: text('comments'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
})

// ─── Assets ───────────────────────────────────────────────────────────────────

export const assets = pgTable('assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  launchId: uuid('launch_id').references(() => launches.id, { onDelete: 'cascade' }),
  assetName: text('asset_name'),
  assetType: text('asset_type'),
  channel: text('channel'),
  persona: text('persona'),
  status: text('status').default('Pending'),
  derivativeOf: uuid('derivative_of'),
  createdAt: timestamp('created_at').defaultNow(),
})

// ─── Reference tables ─────────────────────────────────────────────────────────

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  isBundle: boolean('is_bundle').default(false),
  vertical: text('vertical'),
  features: jsonb('features'),
  stateAvailability: text('state_availability').array(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  valueProposition: text('value_proposition'),
  differentiators: text('differentiators'),
  tone: text('tone'),
})

export const personas = pgTable('personas', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  motivations: text('motivations'),
  messagingFocus: text('messaging_focus'),
  channelPreferences: text('channel_preferences').array(),
})

export const stateRegulatoryRules = pgTable('state_regulatory_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  state: text('state'),
  brand: text('brand'),
  vertical: text('vertical'),
  adRules: text('ad_rules'),
  disclaimers: text('disclaimers'),
  complianceNotes: text('compliance_notes'),
})

export const competitors = pgTable('competitors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  vertical: text('vertical'),
  pricing: jsonb('pricing'),
  features: text('features'),
  strengths: text('strengths'),
  weaknesses: text('weaknesses'),
})

export const budgetAllocationRules = pgTable('budget_allocation_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  marketPresence: text('market_presence'),
  allocationGuidelines: jsonb('allocation_guidelines'),
})

export const pmmAssignments = pgTable('pmm_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  pmmName: text('pmm_name'),
  brand: text('brand'),
  vertical: text('vertical'),
})

export const notificationLog = pgTable('notification_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  launchId: uuid('launch_id').references(() => launches.id, { onDelete: 'set null' }),
  recipient: text('recipient'),
  channel: text('channel'),
  phase: integer('phase'),
  message: text('message'),
  sentAt: timestamp('sent_at').defaultNow(),
})

// ─── Landing Pages ─────────────────────────────────────────────────────────────
// One row per product × phase per launch.
// Phase 1 = waitlist (no cart), Phase 2 = cart active.
// n8n writes content via POST /api/landing-pages.
// Feed Me pulls from GET /api/feed/landing-pages.

export const landingPages = pgTable('landing_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  launchId: uuid('launch_id').references(() => launches.id, { onDelete: 'cascade' }).notNull(),

  // Identity
  productName: text('product_name').notNull(),   // e.g. "Property & Casualty"
  state: text('state'),                           // e.g. "TX"
  vertical: text('vertical'),                     // e.g. "INS"
  phase: integer('phase').notNull(),              // 1 = waitlist | 2 = cart
  slug: text('slug'),                             // URL slug for Craft entry

  // Status
  status: text('status').default('draft'),        // draft | ready | published
  cartEnabled: boolean('cart_enabled').default(false),
  craftEntryId: text('craft_entry_id'),           // populated after Feed Me import

  // Page content — written by n8n, editable in UI
  pageTitle: text('page_title'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  heroHeadline: text('hero_headline'),
  heroSubheadline: text('hero_subheadline'),
  heroCtaText: text('hero_cta_text'),
  heroCtaUrl: text('hero_cta_url'),
  bodyContent: text('body_content'),
  valuePropBullets: jsonb('value_prop_bullets'),  // string[]
  pricingBlock: jsonb('pricing_block'),            // { msrp, salePrice, promoPrice, promoCode }
  features: jsonb('features'),                     // string[]
  faq: jsonb('faq'),                              // { question, answer }[]
  stateDisclaimer: text('state_disclaimer'),
  waitlistFormId: text('waitlist_form_id'),        // Phase 1 only

  // Raw payload from n8n — stored in full so nothing is lost
  rawContent: jsonb('raw_content'),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})
