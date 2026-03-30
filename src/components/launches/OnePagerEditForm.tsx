'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'

interface OnePager {
  brandContent?: string | null
  productNotes?: string | null
  executiveSummary?: string | null
  regulatoryContext?: string | null
  competitiveLandscape?: string | null
  audienceInsights?: string | null
  valuePropPositioning?: string | null
  stateSpecificMessaging?: string | null
  pricingNotes?: string | null
  finalMsrp?: { value?: string } | null
  finalSalePrice?: { value?: string } | null
  finalPromoPrice?: { value?: string } | null
  finalPromoCode?: string | null
  competitivePosition?: string | null
  marketData?: string | null
  salaryData?: string | null
  scopeOfferFeatures?: string | null
  seasonalTrends?: string | null
  regulatoryNotes?: string | null
  exploitableMarketGaps?: string | null
  messagingGuidelines?: string | null
  sourceCoursesAndBundles?: string | null
  personaMessageMap?: string | null
}

interface Props {
  launchId: string
  initial: OnePager
}

// Section divider
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="col-span-2 pt-4 pb-1 border-b border-gray-200">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
    </div>
  )
}

// Short single-line input
function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
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

// Tall textarea for rich text content
function RichField({
  label,
  value,
  onChange,
  rows = 5,
  placeholder,
  hint,
  fullWidth = false,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  placeholder?: string
  hint?: string
  fullWidth?: boolean
}) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <label className="field-label">{label}</label>
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

export function OnePagerEditForm({ launchId, initial }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    brandContent: initial.brandContent ?? '',
    productNotes: initial.productNotes ?? '',
    executiveSummary: initial.executiveSummary ?? '',
    regulatoryContext: initial.regulatoryContext ?? '',
    competitiveLandscape: initial.competitiveLandscape ?? '',
    audienceInsights: initial.audienceInsights ?? '',
    valuePropPositioning: initial.valuePropPositioning ?? '',
    stateSpecificMessaging: initial.stateSpecificMessaging ?? '',
    pricingNotes: initial.pricingNotes ?? '',
    finalMsrp: initial.finalMsrp?.value ?? '',
    finalSalePrice: initial.finalSalePrice?.value ?? '',
    finalPromoPrice: initial.finalPromoPrice?.value ?? '',
    finalPromoCode: initial.finalPromoCode ?? '',
    competitivePosition: initial.competitivePosition ?? '',
    marketData: initial.marketData ?? '',
    salaryData: initial.salaryData ?? '',
    scopeOfferFeatures: initial.scopeOfferFeatures ?? '',
    seasonalTrends: initial.seasonalTrends ?? '',
    regulatoryNotes: initial.regulatoryNotes ?? '',
    exploitableMarketGaps: initial.exploitableMarketGaps ?? '',
    messagingGuidelines: initial.messagingGuidelines ?? '',
    sourceCoursesAndBundles: initial.sourceCoursesAndBundles ?? '',
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
      const res = await fetch(`/api/launches/${launchId}/one-pager`, {
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

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-6 gap-y-5">

        {/* ── Positioning & Messaging ─────────────────────────────── */}
        <SectionHeader title="Positioning & Messaging" />

        <RichField
          label="Executive Summary"
          value={form.executiveSummary}
          onChange={(v) => set('executiveSummary', v)}
          rows={4}
          fullWidth
          placeholder="High-level overview of this launch..."
        />

        <RichField
          label="Value Prop & Positioning"
          value={form.valuePropPositioning}
          onChange={(v) => set('valuePropPositioning', v)}
          rows={6}
          fullWidth
          placeholder="Your California Insurance License Starts Here — Pass Smarter, Not Harder..."
        />

        <RichField
          label="State-Specific Messaging"
          value={form.stateSpecificMessaging}
          onChange={(v) => set('stateSpecificMessaging', v)}
          rows={8}
          fullWidth
          placeholder="1. ...\n2. ...\n3. ..."
          hint="Use numbered points for key messaging angles"
        />

        <RichField
          label="Messaging Guidelines"
          value={form.messagingGuidelines}
          onChange={(v) => set('messagingGuidelines', v)}
          rows={4}
          fullWidth
        />

        <RichField
          label="Brand Content"
          value={form.brandContent}
          onChange={(v) => set('brandContent', v)}
          rows={3}
        />

        <RichField
          label="Product Notes"
          value={form.productNotes}
          onChange={(v) => set('productNotes', v)}
          rows={3}
        />

        {/* ── Pricing ─────────────────────────────────────────────── */}
        <SectionHeader title="Pricing" />

        <RichField
          label="Pricing Notes"
          value={form.pricingNotes}
          onChange={(v) => set('pricingNotes', v)}
          rows={4}
          fullWidth
          placeholder="Pricing strategy and rationale..."
        />

        <RichField
          label="Final MSRP"
          value={form.finalMsrp}
          onChange={(v) => set('finalMsrp', v)}
          rows={3}
          placeholder="All-in-One: $799 | Life & Health: $249 | Life-Only: $199 ..."
          hint="Separate product variants with |"
        />

        <RichField
          label="Final Sale Price"
          value={form.finalSalePrice}
          onChange={(v) => set('finalSalePrice', v)}
          rows={3}
          placeholder="All-in-One: $549 | Life & Health: $199 | Life-Only: $139 ..."
        />

        <RichField
          label="Final Promo Price"
          value={form.finalPromoPrice}
          onChange={(v) => set('finalPromoPrice', v)}
          rows={3}
          placeholder="All-in-One: $384.30 | Life & Health: $139.30 ..."
        />

        <Field
          label="Final Promo Code"
          value={form.finalPromoCode}
          onChange={(v) => set('finalPromoCode', v)}
          placeholder="e.g. CA30"
        />

        {/* ── Competitive Intelligence ────────────────────────────── */}
        <SectionHeader title="Competitive Intelligence" />

        <RichField
          label="Competitive Landscape"
          value={form.competitiveLandscape}
          onChange={(v) => set('competitiveLandscape', v)}
          rows={5}
          fullWidth
          placeholder="Key competitors, their pricing and positioning..."
        />

        <RichField
          label="Competitive Position"
          value={form.competitivePosition}
          onChange={(v) => set('competitivePosition', v)}
          rows={5}
          fullWidth
          placeholder="How Aceable should position against competitors..."
        />

        <RichField
          label="Exploitable Market Gaps"
          value={form.exploitableMarketGaps}
          onChange={(v) => set('exploitableMarketGaps', v)}
          rows={3}
          fullWidth
        />

        {/* ── Audience & Research ─────────────────────────────────── */}
        <SectionHeader title="Audience & Research" />

        <RichField
          label="Audience Insights"
          value={form.audienceInsights}
          onChange={(v) => set('audienceInsights', v)}
          rows={4}
          fullWidth
        />

        <RichField
          label="Personas / Motivation / Key Message Map"
          value={form.personaMessageMap}
          onChange={(v) => set('personaMessageMap', v)}
          rows={5}
          fullWidth
        />

        <RichField
          label="Market Data"
          value={form.marketData}
          onChange={(v) => set('marketData', v)}
          rows={3}
        />

        <RichField
          label="Salary Data"
          value={form.salaryData}
          onChange={(v) => set('salaryData', v)}
          rows={3}
        />

        {/* ── Regulatory & Compliance ─────────────────────────────── */}
        <SectionHeader title="Regulatory & Compliance" />

        <RichField
          label="Regulatory Context"
          value={form.regulatoryContext}
          onChange={(v) => set('regulatoryContext', v)}
          rows={4}
          fullWidth
        />

        <RichField
          label="Regulatory Notes"
          value={form.regulatoryNotes}
          onChange={(v) => set('regulatoryNotes', v)}
          rows={3}
          fullWidth
        />

        {/* ── GTM & Operations ────────────────────────────────────── */}
        <SectionHeader title="GTM & Operations" />

        <RichField
          label="Scope & Offer Features"
          value={form.scopeOfferFeatures}
          onChange={(v) => set('scopeOfferFeatures', v)}
          rows={4}
          fullWidth
        />

        <RichField
          label="Source Courses & Bundles"
          value={form.sourceCoursesAndBundles}
          onChange={(v) => set('sourceCoursesAndBundles', v)}
          rows={3}
          fullWidth
        />

        <RichField
          label="Seasonal Trends"
          value={form.seasonalTrends}
          onChange={(v) => set('seasonalTrends', v)}
          rows={3}
        />

      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(`/launches/${launchId}/one-pager`)}
            className="btn-secondary"
          >
            View one-pager
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
