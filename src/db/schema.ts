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
  airtableRecordId: text('airtable_record_id'),

  // PMM workflow
  pmmStatus: text('pmm_status').default('draft'), // draft | review | approved | pushed
  pmmOwner: text('pmm_owner'),
  pmmNotes: text('pmm_notes'),
  jiraTicketId: text('jira_ticket_id'),
  jiraPushedAt: timestamp('jira_pushed_at'),

  // Executive Summary
  positionStatement: text('position_statement'),
  regulatoryStatus: text('regulatory_status'),
  keyMarketDifferentiator: text('key_market_differentiator'),
  launchGoal: text('launch_goal'),
  executiveSummary: text('executive_summary'),

  // Scope & Offer
  sourceCoursesAndBundles: text('source_courses_and_bundles'),
  pricingTable: text('pricing_table'),
  ecomPages: text('ecom_pages'),
  regulatoryNotes: text('regulatory_notes'),
  regulatoryContext: text('regulatory_context'),
  scopeOfferFeatures: text('scope_offer_features'),
  finalPromoCode: text('final_promo_code'),
  pricingNotes: text('pricing_notes'),
  finalMsrp: jsonb('final_msrp'),
  finalSalePrice: jsonb('final_sale_price'),
  finalPromoPrice: jsonb('final_promo_price'),
  discountStrategy: text('discount_strategy'),

  // Competitive
  competitiveLandscape: text('competitive_landscape'),
  competitivePosition: text('competitive_position'),
  exploitableMarketGaps: text('exploitable_market_gaps'),
  differentiationPoints: text('differentiation_points'),

  // Audience
  audienceInsights: text('audience_insights'),
  behavioralInsights: text('behavioral_insights'),
  personas: text('personas'),
  seasonalTrends: text('seasonal_trends'),
  objectionHandling: text('objection_handling'),

  // Messaging
  valuePropPositioning: text('value_prop_positioning'),
  brandPositioningStatement: text('brand_positioning_statement'),
  stateSpecificMessaging: text('state_specific_messaging'),
  messagingAngles: text('messaging_angles'),
  messagingGuidelines: text('messaging_guidelines'),

  // Social proof
  trustSignals: text('trust_signals'),
  passGuaranteeTerms: text('pass_guarantee_terms'),
  testimonials: text('testimonials'),

  // Market & GTM
  marketPresenceStatus: text('market_presence_status'),
  budgetTofPct: integer('budget_tof_pct'),
  budgetMofPct: integer('budget_mof_pct'),
  budgetBofPct: integer('budget_bof_pct'),
  budgetRationale: text('budget_rationale'),
  tofChannelStrategy: text('tof_channel_strategy'),
  mofChannelStrategy: text('mof_channel_strategy'),
  bofChannelStrategy: text('bof_channel_strategy'),

  // Research
  marketData: text('market_data'),
  salaryData: text('salary_data'),

  // App store
  appStoreSubtitle: text('app_store_subtitle'),
  appStorePromoText: text('app_store_promo_text'),
  appStoreDescription: text('app_store_description'),
  appStoreKeywords: text('app_store_keywords'),
  playStoreShortDescription: text('play_store_short_description'),
  playStoreFullDescription: text('play_store_full_description'),

  // Legacy fields
  brandContent: text('brand_content'),
  productNotes: text('product_notes'),
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
  channel: text('channel'),
  dayOffset: integer('day_offset'),
  durationBusinessDays: integer('duration_business_days'),
  peopleHours: decimal('people_hours', { precision: 10, scale: 2 }),
  measureOfSuccess: text('measure_of_success'),
  optimizationOpportunity: boolean('optimization_opportunity').default(false),
  optimizationNotes: text('optimization_notes'),
  linkedDocs: text('linked_docs'),
  isTemplate: boolean('is_template').default(false),
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
  channel: text('channel'),
  dayOffset: integer('day_offset'),
  durationBusinessDays: integer('duration_business_days'),
  peopleHours: decimal('people_hours', { precision: 10, scale: 2 }),
  measureOfSuccess: text('measure_of_success'),
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
  stateName: text('state_name'),
  brand: text('brand'),
  vertical: text('vertical'),
  status: text('status').default('Todo'),       // Done | Todo
  preLicenseRequired: boolean('pre_license_required').default(false),
  stateApprovalRequired: boolean('state_approval_required').default(false),
  regulatoryBody: text('regulatory_body'),
  hoursRequired: integer('hours_required'),
  requiredDisclaimers: text('required_disclaimers'),
  stateNotes: text('state_notes'),
  adRules: text('ad_rules'),
  disclaimers: text('disclaimers'),
  complianceNotes: text('compliance_notes'),
})

export const competitors = pgTable('competitors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  vertical: text('vertical'),
  coverage: text('coverage'),               // National | Regional
  states: text('states').array(),
  priceRange: text('price_range'),
  promotions: text('promotions'),
  keyFeatures: text('key_features'),
  strengths: text('strengths'),
  weaknesses: text('weaknesses'),
  rating: text('rating'),
  passGuarantee: text('pass_guarantee'),
  website: text('website'),
  lastUpdated: date('last_updated'),
  pricing: jsonb('pricing'),
  features: text('features'),
})

export const budgetAllocationRules = pgTable('budget_allocation_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name'),
  marketPresence: text('market_presence'),   // Strong | Emerging | New
  vertical: text('vertical'),
  tofPct: decimal('tof_pct', { precision: 5, scale: 2 }),
  mofPct: decimal('mof_pct', { precision: 5, scale: 2 }),
  bofPct: decimal('bof_pct', { precision: 5, scale: 2 }),
  rationale: text('rationale'),
  allocationGuidelines: jsonb('allocation_guidelines'),
})

export const pmmAssignments = pgTable('pmm_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  pmmName: text('pmm_name'),
  brand: text('brand'),
  vertical: text('vertical'),
  pmmEmail: text('pmm_email'),
  slackId: text('slack_id'),
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
