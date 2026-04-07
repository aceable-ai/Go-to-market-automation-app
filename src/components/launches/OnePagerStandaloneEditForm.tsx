'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, ExternalLink } from 'lucide-react'

interface OnePager {
  id?: string
  pmmStatus?: string | null
  pmmOwner?: string | null
  pmmNotes?: string | null
  jiraTicketId?: string | null
  positionStatement?: string | null
  regulatoryStatus?: string | null
  keyMarketDifferentiator?: string | null
  launchGoal?: string | null
  executiveSummary?: string | null
  sourceCoursesAndBundles?: string | null
  ecomPages?: string | null
  regulatoryNotes?: string | null
  regulatoryContext?: string | null
  scopeOfferFeatures?: string | null
  finalPromoCode?: string | null
  pricingNotes?: string | null
  finalMsrp?: { value?: string } | null
  finalSalePrice?: { value?: string } | null
  finalPromoPrice?: { value?: string } | null
  discountStrategy?: string | null
  competitiveLandscape?: string | null
  competitivePosition?: string | null
  exploitableMarketGaps?: string | null
  differentiationPoints?: string | null
  audienceInsights?: string | null
  behavioralInsights?: string | null
  personas?: string | null
  seasonalTrends?: string | null
  objectionHandling?: string | null
  valuePropPositioning?: string | null
  brandPositioningStatement?: string | null
  stateSpecificMessaging?: string | null
  messagingAngles?: string | null
  messagingGuidelines?: string | null
  trustSignals?: string | null
  passGuaranteeTerms?: string | null
  testimonials?: string | null
  marketPresenceStatus?: string | null
  budgetTofPct?: number | null
  budgetMofPct?: number | null
  budgetBofPct?: number | null
  budgetRationale?: string | null
  tofChannelStrategy?: string | null
  mofChannelStrategy?: string | null
  bofChannelStrategy?: string | null
  marketData?: string | null
  salaryData?: string | null
  appStoreSubtitle?: string | null
  appStorePromoText?: string | null
  appStoreDescription?: string | null
  appStoreKeywords?: string | null
  playStoreShortDescription?: string | null
  playStoreFullDescription?: string | null
  brandContent?: string | null
  productNotes?: string | null
  personaMessageMap?: string | null
}

interface Props {
  onePagerId: string
  jiraBaseUrl?: string
  initial: OnePager
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="col-span-2 pt-4 pb-1 border-b border-gray-200">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="field-label">
        {required && <span className="text-amber-500 mr-1">⭐</span>}
        {label}
      </label>
      <input
        type="text"
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

function RichField({
  label,
  value,
  onChange,
  rows = 5,
  placeholder,
  hint,
  fullWidth = false,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
  hint?: string
  fullWidth?: boolean
  required?: boolean
}) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <label className="field-label">
        {required && <span className="text-amber-500 mr-1">⭐</span>}
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <textarea
        className="field-input resize-y"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

export function OnePagerStandaloneEditForm({ onePagerId, jiraBaseUrl, initial }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    pmmStatus: initial.pmmStatus ?? 'draft',
    pmmOwner: initial.pmmOwner ?? '',
    pmmNotes: initial.pmmNotes ?? '',
    jiraTicketId: initial.jiraTicketId ?? '',
    positionStatement: initial.positionStatement ?? '',
    regulatoryStatus: initial.regulatoryStatus ?? '',
    keyMarketDifferentiator: initial.keyMarketDifferentiator ?? '',
    launchGoal: initial.launchGoal ?? '',
    executiveSummary: initial.executiveSummary ?? '',
    sourceCoursesAndBundles: initial.sourceCoursesAndBundles ?? '',
    ecomPages: initial.ecomPages ?? '',
    regulatoryNotes: initial.regulatoryNotes ?? '',
    regulatoryContext: initial.regulatoryContext ?? '',
    scopeOfferFeatures: initial.scopeOfferFeatures ?? '',
    finalPromoCode: initial.finalPromoCode ?? '',
    pricingNotes: initial.pricingNotes ?? '',
    finalMsrp: initial.finalMsrp?.value ?? '',
    finalSalePrice: initial.finalSalePrice?.value ?? '',
    finalPromoPrice: initial.finalPromoPrice?.value ?? '',
    discountStrategy: initial.discountStrategy ?? '',
    competitiveLandscape: initial.competitiveLandscape ?? '',
    competitivePosition: initial.competitivePosition ?? '',
    exploitableMarketGaps: initial.exploitableMarketGaps ?? '',
    differentiationPoints: initial.differentiationPoints ?? '',
    audienceInsights: initial.audienceInsights ?? '',
    behavioralInsights: initial.behavioralInsights ?? '',
    personas: initial.personas ?? '',
    seasonalTrends: initial.seasonalTrends ?? '',
    objectionHandling: initial.objectionHandling ?? '',
    valuePropPositioning: initial.valuePropPositioning ?? '',
    brandPositioningStatement: initial.brandPositioningStatement ?? '',
    stateSpecificMessaging: initial.stateSpecificMessaging ?? '',
    messagingAngles: initial.messagingAngles ?? '',
    messagingGuidelines: initial.messagingGuidelines ?? '',
    trustSignals: initial.trustSignals ?? '',
    passGuaranteeTerms: initial.passGuaranteeTerms ?? '',
    testimonials: initial.testimonials ?? '',
    marketPresenceStatus: initial.marketPresenceStatus ?? '',
    budgetTofPct: initial.budgetTofPct?.toString() ?? '',
    budgetMofPct: initial.budgetMofPct?.toString() ?? '',
    budgetBofPct: initial.budgetBofPct?.toString() ?? '',
    budgetRationale: initial.budgetRationale ?? '',
    tofChannelStrategy: initial.tofChannelStrategy ?? '',
    mofChannelStrategy: initial.mofChannelStrategy ?? '',
    bofChannelStrategy: initial.bofChannelStrategy ?? '',
    marketData: initial.marketData ?? '',
    salaryData: initial.salaryData ?? '',
    appStoreSubtitle: initial.appStoreSubtitle ?? '',
    appStorePromoText: initial.appStorePromoText ?? '',
    appStoreDescription: initial.appStoreDescription ?? '',
    appStoreKeywords: initial.appStoreKeywords ?? '',
    playStoreShortDescription: initial.playStoreShortDescription ?? '',
    playStoreFullDescription: initial.playStoreFullDescription ?? '',
    brandContent: initial.brandContent ?? '',
    productNotes: initial.productNotes ?? '',
    personaMessageMap: initial.personaMessageMap ?? '',
  })

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/one-pagers/${onePagerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
      router.refresh()
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePushJira() {
    if (!confirm('Push this one-pager to Jira?')) return
    setPushing(true)
    setError(null)
    try {
      const res = await fetch(`/api/one-pagers/${onePagerId}/push-jira`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail ?? data.error ?? 'Push failed')
      setForm((f) => ({ ...f, jiraTicketId: data.jira_ticket_id ?? f.jiraTicketId, pmmStatus: 'pushed' }))
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to push to Jira')
    } finally {
      setPushing(false)
    }
  }

  const jiraUrl = form.jiraTicketId && jiraBaseUrl
    ? `${jiraBaseUrl}/browse/${form.jiraTicketId}`
    : null

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {jiraUrl && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-4 py-3 flex items-center gap-2">
          <Check className="w-4 h-4" />
          Pushed to Jira:{' '}
          <a href={jiraUrl} target="_blank" rel="noreferrer" className="font-medium underline flex items-center gap-1">
            {form.jiraTicketId} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-5">

        {/* ── PMM Workflow ─────────────────────────────────────────── */}
        <SectionHeader title="PMM Workflow" />

        <div>
          <label className="field-label">Status</label>
          <select
            className="field-input"
            value={form.pmmStatus}
            onChange={(e) => set('pmmStatus', e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="review">In Review</option>
            <option value="approved">Approved</option>
            <option value="pushed">Pushed to Jira</option>
          </select>
        </div>

        <Field label="PMM Owner" value={form.pmmOwner} onChange={(v) => set('pmmOwner', v)} placeholder="e.g. Peggy" />

        <RichField label="PMM Notes" value={form.pmmNotes} onChange={(v) => set('pmmNotes', v)} rows={3} fullWidth />

        {/* ── Executive Summary ────────────────────────────────────── */}
        <SectionHeader title="1. Executive Summary" />

        <Field label="Position Statement" value={form.positionStatement} onChange={(v) => set('positionStatement', v)} required />
        <Field label="Regulatory Status" value={form.regulatoryStatus} onChange={(v) => set('regulatoryStatus', v)} required />
        <Field label="Key Market Differentiator" value={form.keyMarketDifferentiator} onChange={(v) => set('keyMarketDifferentiator', v)} />
        <Field label="Launch Goal" value={form.launchGoal} onChange={(v) => set('launchGoal', v)} />
        <RichField label="Executive Summary" value={form.executiveSummary} onChange={(v) => set('executiveSummary', v)} rows={4} fullWidth required />

        {/* ── Scope & Offer ────────────────────────────────────────── */}
        <SectionHeader title="2. Scope & Offer" />

        <RichField label="Courses & Bundles" value={form.sourceCoursesAndBundles} onChange={(v) => set('sourceCoursesAndBundles', v)} rows={3} fullWidth required />
        <RichField label="Ecom Pages" value={form.ecomPages} onChange={(v) => set('ecomPages', v)} rows={3} fullWidth />
        <RichField label="Scope & Offer Features" value={form.scopeOfferFeatures} onChange={(v) => set('scopeOfferFeatures', v)} rows={3} fullWidth />
        <RichField label="Regulatory Notes" value={form.regulatoryNotes} onChange={(v) => set('regulatoryNotes', v)} rows={3} fullWidth />
        <Field label="Promo Code" value={form.finalPromoCode} onChange={(v) => set('finalPromoCode', v)} />
        <RichField label="Pricing Notes" value={form.pricingNotes} onChange={(v) => set('pricingNotes', v)} rows={3} fullWidth />
        <RichField label="Final MSRP" value={form.finalMsrp} onChange={(v) => set('finalMsrp', v)} rows={2} placeholder="All-in-One: $799 | Life & Health: $249 ..." hint="Separate product variants with |" />
        <RichField label="Final Sale Price" value={form.finalSalePrice} onChange={(v) => set('finalSalePrice', v)} rows={2} placeholder="All-in-One: $549 | Life & Health: $199 ..." />
        <RichField label="Final Promo Price" value={form.finalPromoPrice} onChange={(v) => set('finalPromoPrice', v)} rows={2} />
        <RichField label="Discount Strategy" value={form.discountStrategy} onChange={(v) => set('discountStrategy', v)} rows={3} fullWidth />

        {/* ── Competitive Analysis ─────────────────────────────────── */}
        <SectionHeader title="3. Competitive Analysis" />

        <RichField label="Competitive Landscape" value={form.competitiveLandscape} onChange={(v) => set('competitiveLandscape', v)} rows={5} fullWidth required />
        <RichField label="Our Position" value={form.competitivePosition} onChange={(v) => set('competitivePosition', v)} rows={4} fullWidth />
        <RichField label="Differentiation Points" value={form.differentiationPoints} onChange={(v) => set('differentiationPoints', v)} rows={3} fullWidth />
        <RichField label="Exploitable Market Gaps" value={form.exploitableMarketGaps} onChange={(v) => set('exploitableMarketGaps', v)} rows={3} fullWidth />

        {/* ── Audience ─────────────────────────────────────────────── */}
        <SectionHeader title="4. Audience & Pain Points" />

        <RichField label="Audience Insights" value={form.audienceInsights} onChange={(v) => set('audienceInsights', v)} rows={4} fullWidth required />
        <RichField label="Personas" value={form.personas} onChange={(v) => set('personas', v)} rows={4} fullWidth />
        <RichField label="Behavioral Insights" value={form.behavioralInsights} onChange={(v) => set('behavioralInsights', v)} rows={3} fullWidth />
        <RichField label="Seasonal Trends" value={form.seasonalTrends} onChange={(v) => set('seasonalTrends', v)} rows={3} />
        <RichField label="Objection Handling" value={form.objectionHandling} onChange={(v) => set('objectionHandling', v)} rows={3} />

        {/* ── Messaging ────────────────────────────────────────────── */}
        <SectionHeader title="5. Value Prop & Positioning" />

        <RichField label="Value Prop & Positioning" value={form.valuePropPositioning} onChange={(v) => set('valuePropPositioning', v)} rows={5} fullWidth required />
        <Field label="Brand Positioning Statement" value={form.brandPositioningStatement} onChange={(v) => set('brandPositioningStatement', v)} />
        <RichField label="State-Specific Messaging" value={form.stateSpecificMessaging} onChange={(v) => set('stateSpecificMessaging', v)} rows={5} fullWidth hint="Use numbered points for key messaging angles" />
        <RichField label="Messaging Angles" value={form.messagingAngles} onChange={(v) => set('messagingAngles', v)} rows={4} fullWidth />
        <RichField label="Messaging Guidelines" value={form.messagingGuidelines} onChange={(v) => set('messagingGuidelines', v)} rows={4} fullWidth />

        {/* ── Social Proof ─────────────────────────────────────────── */}
        <SectionHeader title="6. Social Proof & Trust Signals" />

        <RichField label="Trust Signals" value={form.trustSignals} onChange={(v) => set('trustSignals', v)} rows={4} fullWidth required />
        <RichField label="Pass Guarantee Terms" value={form.passGuaranteeTerms} onChange={(v) => set('passGuaranteeTerms', v)} rows={3} fullWidth />
        <RichField label="Testimonials" value={form.testimonials} onChange={(v) => set('testimonials', v)} rows={3} fullWidth />

        {/* ── GTM Strategy ─────────────────────────────────────────── */}
        <SectionHeader title="7. Market Presence & GTM Strategy" />

        <Field label="Market Presence" value={form.marketPresenceStatus} onChange={(v) => set('marketPresenceStatus', v)} placeholder="Emerging | Established | Growing" />

        <div>
          <label className="field-label">ToF %</label>
          <input type="number" className="field-input" value={form.budgetTofPct} onChange={(e) => set('budgetTofPct', e.target.value)} min={0} max={100} />
        </div>
        <div>
          <label className="field-label">MoF %</label>
          <input type="number" className="field-input" value={form.budgetMofPct} onChange={(e) => set('budgetMofPct', e.target.value)} min={0} max={100} />
        </div>
        <div>
          <label className="field-label">BoF %</label>
          <input type="number" className="field-input" value={form.budgetBofPct} onChange={(e) => set('budgetBofPct', e.target.value)} min={0} max={100} />
        </div>

        <RichField label="Budget Rationale" value={form.budgetRationale} onChange={(v) => set('budgetRationale', v)} rows={3} fullWidth />
        <RichField label="ToF Channel Strategy" value={form.tofChannelStrategy} onChange={(v) => set('tofChannelStrategy', v)} rows={3} fullWidth />
        <RichField label="MoF Channel Strategy" value={form.mofChannelStrategy} onChange={(v) => set('mofChannelStrategy', v)} rows={3} fullWidth />
        <RichField label="BoF Channel Strategy" value={form.bofChannelStrategy} onChange={(v) => set('bofChannelStrategy', v)} rows={3} fullWidth />

        {/* ── Research ─────────────────────────────────────────────── */}
        <SectionHeader title="Research Data" />

        <RichField label="Market Data" value={form.marketData} onChange={(v) => set('marketData', v)} rows={3} />
        <RichField label="Salary Data" value={form.salaryData} onChange={(v) => set('salaryData', v)} rows={3} />


      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
          <span className="text-xs text-gray-400 ml-2">⭐ = required before Jira push</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/one-pagers')}
            className="btn-secondary"
          >
            View
          </button>
          <button
            type="button"
            onClick={handlePushJira}
            disabled={pushing || saving}
            className="btn-secondary flex items-center gap-2 disabled:opacity-60 text-green-700 border-green-300 hover:bg-green-50"
          >
            {pushing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {pushing ? 'Pushing...' : 'Push to Jira'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
