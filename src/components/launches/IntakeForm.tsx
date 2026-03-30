'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BRANDS,
  VERTICALS,
  MARKET_PRESENCE,
  REGULATORY_STATUS,
  LAUNCH_STATUSES,
} from '@/lib/constants'

const PRODUCT_OPTIONS = [
  'All-in-One',
  'Property & Casualty',
  'Life & Health',
  'Life',
  'Pre-License',
  'CE Package',
]

export function IntakeForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    launchName: '',
    brand: '',
    vertical: '',
    state: '',
    marketPresence: '',
    regulatoryStatus: '',
    hardLaunchDate: '',
    status: 'Kick off automation',
    products: [] as string[],
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function toggleProduct(product: string) {
    setForm((f) => ({
      ...f,
      products: f.products.includes(product)
        ? f.products.filter((p) => p !== product)
        : [...f.products, product],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.launchName) {
      setError('Launch name is required')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/launches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Failed to create launch')
      const { id } = await res.json()
      router.push(`/launches/${id}`)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
          {error}
        </div>
      )}

      {/* Launch Name */}
      <div>
        <label className="field-label">
          Launch Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="field-input"
          placeholder="e.g. Aceable Insurance — NY launch"
          value={form.launchName}
          onChange={(e) => set('launchName', e.target.value)}
        />
      </div>

      {/* Brand + Vertical */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Brand</label>
          <select className="field-select" value={form.brand} onChange={(e) => set('brand', e.target.value)}>
            <option value="">Select brand</option>
            {BRANDS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Vertical</label>
          <select className="field-select" value={form.vertical} onChange={(e) => set('vertical', e.target.value)}>
            <option value="">Select vertical</option>
            {VERTICALS.map((v) => <option key={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {/* Product (multi-select) */}
      <div>
        <label className="field-label">Product</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {PRODUCT_OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => toggleProduct(p)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium border transition-colors
                ${form.products.includes(p)
                  ? 'bg-[#2D1169] text-white border-[#2D1169]'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}
              `}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* State */}
      <div>
        <label className="field-label">State</label>
        <input
          type="text"
          className="field-input"
          placeholder="e.g. NY"
          value={form.state}
          onChange={(e) => set('state', e.target.value)}
        />
      </div>

      {/* Market Presence + Regulatory Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Market Presence</label>
          <select className="field-select" value={form.marketPresence} onChange={(e) => set('marketPresence', e.target.value)}>
            <option value="">Select presence</option>
            {MARKET_PRESENCE.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Regulatory Status</label>
          <select className="field-select" value={form.regulatoryStatus} onChange={(e) => set('regulatoryStatus', e.target.value)}>
            <option value="">Select status</option>
            {REGULATORY_STATUS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Hard Launch Date */}
      <div>
        <label className="field-label">Hard Launch Date</label>
        <input
          type="date"
          className="field-input"
          value={form.hardLaunchDate}
          onChange={(e) => set('hardLaunchDate', e.target.value)}
        />
      </div>

      {/* Status */}
      <div>
        <label className="field-label">Status</label>
        <select className="field-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
          {LAUNCH_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        {form.status === 'Kick off automation' && (
          <p className="text-xs text-[#2D1169] mt-1">
            Submitting will fire the n8n automation — creating a Jira ticket, spinning up GTM tasks, and notifying the team.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <button
          type="button"
          onClick={() => setForm({
            launchName: '', brand: '', vertical: '', state: '',
            marketPresence: '', regulatoryStatus: '', hardLaunchDate: '',
            status: 'Kick off automation', products: [],
          })}
          className="btn-secondary"
        >
          Clear form
        </button>
        <button type="submit" disabled={loading} className="btn-primary disabled:opacity-60">
          {loading ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  )
}
