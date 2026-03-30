'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const PHASE_LABELS: Record<number, string> = {
  1: 'Phase 1 — Waitlist',
  2: 'Phase 2 — Cart Active',
}

const STATUS_OPTIONS = ['draft', 'ready', 'published'] as const

interface LandingPage {
  id: string
  launchId: string
  productName: string
  state: string | null
  vertical: string | null
  phase: number
  slug: string | null
  status: string | null
  cartEnabled: boolean | null
  craftEntryId: string | null
  pageTitle: string | null
  metaTitle: string | null
  metaDescription: string | null
  heroHeadline: string | null
  heroSubheadline: string | null
  heroCtaText: string | null
  heroCtaUrl: string | null
  bodyContent: string | null
  valuePropBullets: unknown
  pricingBlock: unknown
  features: unknown
  faq: unknown
  stateDisclaimer: string | null
  waitlistFormId: string | null
  rawContent: unknown
}

export default function LandingPageEditPage({
  params,
}: {
  params: { id: string; pageId: string }
}) {
  const router = useRouter()
  const [page, setPage] = useState<LandingPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/landing-pages/${params.pageId}`)
      .then((r) => r.json())
      .then((data) => {
        setPage(data)
        setLoading(false)
      })
  }, [params.pageId])

  function set(field: keyof LandingPage, value: string | boolean) {
    setPage((p) => p ? { ...p, [field]: value } : p)
    setSaved(false)
  }

  async function handleSave() {
    if (!page) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/landing-pages/${params.pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(true)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading…
      </div>
    )
  }

  if (!page) return <div className="p-6 text-gray-500">Page not found.</div>

  const s = (field: keyof LandingPage): string => String(page[field] ?? '')

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Link href={`/launches/${params.id}/landing-pages`} className="text-gray-400 hover:text-gray-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <p className="text-sm text-gray-500">{page.productName}</p>
      </div>
      <div className="flex items-center justify-between mb-6 ml-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {PHASE_LABELS[page.phase]} — {page.productName}
        </h1>
        <span className="badge bg-blue-100 text-blue-700">{page.state}</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-5">

        {/* Status + slug */}
        <div className="card p-5 grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">Status</label>
            <select
              className="field-select"
              value={page.status ?? 'draft'}
              onChange={(e) => set('status', e.target.value)}
            >
              {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              Set to <strong>ready</strong> for Feed Me to pick up. Set to <strong>published</strong> after Craft confirms import.
            </p>
          </div>
          <div>
            <label className="field-label">URL Slug</label>
            <input
              type="text"
              className="field-input font-mono text-xs"
              value={s('slug')}
              onChange={(e) => set('slug', e.target.value)}
              placeholder="tx-property-casualty-waitlist"
            />
          </div>
          {page.craftEntryId && (
            <div>
              <label className="field-label">Craft Entry ID</label>
              <input type="text" className="field-input" value={s('craftEntryId')} onChange={(e) => set('craftEntryId', e.target.value)} />
            </div>
          )}
          {page.phase === 1 && (
            <div>
              <label className="field-label">Waitlist Form ID</label>
              <input type="text" className="field-input" value={s('waitlistFormId')} onChange={(e) => set('waitlistFormId', e.target.value)} placeholder="Form ID from your form provider" />
            </div>
          )}
        </div>

        {/* SEO */}
        <div className="card p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SEO</h2>
          <div>
            <label className="field-label">Page Title</label>
            <input type="text" className="field-input" value={s('pageTitle')} onChange={(e) => set('pageTitle', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Meta Title</label>
            <input type="text" className="field-input" value={s('metaTitle')} onChange={(e) => set('metaTitle', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Meta Description</label>
            <textarea rows={2} className="field-input resize-none" value={s('metaDescription')} onChange={(e) => set('metaDescription', e.target.value)} />
          </div>
        </div>

        {/* Hero */}
        <div className="card p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Hero</h2>
          <div>
            <label className="field-label">Headline</label>
            <input type="text" className="field-input" value={s('heroHeadline')} onChange={(e) => set('heroHeadline', e.target.value)} />
          </div>
          <div>
            <label className="field-label">Subheadline</label>
            <textarea rows={2} className="field-input resize-none" value={s('heroSubheadline')} onChange={(e) => set('heroSubheadline', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">CTA Text</label>
              <input type="text" className="field-input" value={s('heroCtaText')} onChange={(e) => set('heroCtaText', e.target.value)} placeholder="Get Started" />
            </div>
            <div>
              <label className="field-label">CTA URL</label>
              <input type="text" className="field-input" value={s('heroCtaUrl')} onChange={(e) => set('heroCtaUrl', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="card p-5 space-y-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Body Content</h2>
          <textarea
            rows={10}
            className="field-input resize-y w-full"
            value={s('bodyContent')}
            onChange={(e) => set('bodyContent', e.target.value)}
            placeholder="Generated by n8n — edit as needed before publishing to Craft"
          />
        </div>

        {/* Disclaimer */}
        <div className="card p-5">
          <label className="field-label">State Disclaimer</label>
          <textarea rows={3} className="field-input resize-none w-full" value={s('stateDisclaimer')} onChange={(e) => set('stateDisclaimer', e.target.value)} />
        </div>

        {/* Raw content from n8n (read-only) */}
        {page.rawContent && (
          <div className="card p-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Raw n8n payload</h2>
            <pre className="text-xs text-gray-500 bg-gray-50 rounded p-3 overflow-auto max-h-48">
              {JSON.stringify(page.rawContent, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 py-4 flex items-center justify-between mt-6">
        <div className="text-sm">
          {saved && (
            <span className="flex items-center gap-1.5 text-green-600">
              <Check className="w-4 h-4" /> Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/launches/${params.id}/landing-pages`} className="btn-secondary">
            Back to pages
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
