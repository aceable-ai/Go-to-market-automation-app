'use client'

import { useEffect, useState, useCallback } from 'react'

interface AssetRow {
  id: string
  launchId: string | null
  assetName: string | null
  assetType: string | null
  channel: string | null
  persona: string | null
  copy: string | null
  jiraTicket: string | null
  status: string | null
  pickedUp: boolean | null
  archived: boolean | null
  createdAt: string | null
  launchName: string | null
  brand: string | null
  vertical: string | null
}

const CHANNELS = ['Meta', 'Google', 'TikTok', 'Email', 'SMS', 'YouTube', 'LinkedIn', 'Display', 'Print']
const ASSET_TYPES = ['Email', 'Social', 'Display', 'Video', 'Landing Page', 'Print']

const CHANNEL_COLORS: Record<string, string> = {
  Meta: 'bg-blue-100 text-blue-800',
  Google: 'bg-yellow-100 text-yellow-800',
  TikTok: 'bg-gray-100 text-gray-800',
  Email: 'bg-purple-100 text-purple-800',
  SMS: 'bg-green-100 text-green-800',
  YouTube: 'bg-red-100 text-red-800',
  LinkedIn: 'bg-sky-100 text-sky-800',
  Display: 'bg-orange-100 text-orange-800',
  Print: 'bg-amber-100 text-amber-800',
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  Ready: 'bg-green-100 text-green-700',
  'Picked Up': 'bg-purple-100 text-purple-700',
}

function Badge({ text, colorMap }: { text: string | null; colorMap: Record<string, string> }) {
  const cls = colorMap[text ?? ''] ?? 'bg-gray-100 text-gray-700'
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{text ?? '—'}</span>
}

function AssetDetail({ asset, onClose, onTogglePickedUp, updating }: {
  asset: AssetRow
  onClose: () => void
  onTogglePickedUp: (id: string, current: boolean | null) => void
  updating: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Asset Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Asset Name</p>
              <p className="text-sm font-medium text-gray-900">{asset.assetName ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Channel</p>
              <Badge text={asset.channel} colorMap={CHANNEL_COLORS} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Launch</p>
              <p className="text-sm text-gray-900">{asset.launchName ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Brand</p>
              <p className="text-sm text-gray-900">{asset.brand ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Asset Type</p>
              <p className="text-sm text-gray-900">{asset.assetType ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Persona</p>
              <p className="text-sm text-gray-900">{asset.persona ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <Badge text={asset.status} colorMap={STATUS_COLORS} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Jira Ticket</p>
              <p className="text-sm text-gray-900">{asset.jiraTicket ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Picked Up</p>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={asset.pickedUp ?? false}
                  disabled={updating}
                  onChange={() => onTogglePickedUp(asset.id, asset.pickedUp)}
                  className="h-4 w-4 rounded border-gray-300 text-[#2D1169] focus:ring-[#2D1169] cursor-pointer"
                />
                <span className="text-sm text-gray-600">{asset.pickedUp ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
          {asset.copy && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Copy / Description</p>
              <div className="bg-gray-50 rounded-md p-3 text-sm text-gray-900 whitespace-pre-wrap">{asset.copy}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AssetsPage() {
  const [rows, setRows] = useState<AssetRow[]>([])
  const [loading, setLoading] = useState(true)
  const [channelFilter, setChannelFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<AssetRow | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const fetchAssets = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (channelFilter) params.set('channel', channelFilter)
    if (statusFilter) params.set('status', statusFilter)
    params.set('limit', '200')

    fetch(`/api/assets?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setRows(data.assets ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [channelFilter, statusFilter])

  useEffect(() => { fetchAssets() }, [fetchAssets])

  const togglePickedUp = async (id: string, current: boolean | null) => {
    setUpdatingId(id)
    try {
      const newVal = !current
      await fetch(`/api/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickedUp: newVal, status: newVal ? 'Picked Up' : 'Ready' }),
      })
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, pickedUp: newVal, status: newVal ? 'Picked Up' : 'Ready' } : r))
      if (selectedAsset?.id === id) {
        setSelectedAsset((prev) => prev ? { ...prev, pickedUp: newVal, status: newVal ? 'Picked Up' : 'Ready' } : null)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleArchive = async (id: string, current: boolean | null) => {
    try {
      await fetch(`/api/assets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: !current }),
      })
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, archived: !current } : r))
    } catch (e) {
      console.error(e)
    }
  }

  const visibleRows = rows.filter((r) => showArchived ? r.archived : !r.archived)

  const totalAssets = rows.filter((r) => !r.archived).length
  const pickedUpCount = rows.filter((r) => !r.archived && r.pickedUp).length
  const pendingCount = rows.filter((r) => !r.archived && !r.pickedUp).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Asset Pick Up Window</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track and pick up creative assets for GTM launches.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Assets</p>
          <p className="text-3xl font-bold text-gray-900">{totalAssets}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Picked Up</p>
          <p className="text-3xl font-bold text-green-600">{pickedUpCount}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pending Pickup</p>
          <p className="text-3xl font-bold text-amber-600">{pendingCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Channel</label>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[#2D1169] focus:outline-none"
          >
            <option value="">All channels</option>
            {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[#2D1169] focus:outline-none"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Ready">Ready</option>
            <option value="Picked Up">Picked Up</option>
          </select>
        </div>
        <button
          onClick={() => setShowArchived((v) => !v)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${showArchived ? 'bg-gray-200 border-gray-300 text-gray-700' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
        >
          {showArchived ? 'Show Active' : 'Show Archived'}
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Asset Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Launch</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jira</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Picked Up</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-5 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No assets found. Assets will appear here when generated by the GTM pipeline.
                  </td>
                </tr>
              ) : (
                visibleRows.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedAsset(a)}
                  >
                    <td className="px-5 py-3 font-medium text-gray-900">{a.assetName ?? '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{a.launchName ?? '—'}</td>
                    <td className="px-5 py-3"><Badge text={a.channel} colorMap={CHANNEL_COLORS} /></td>
                    <td className="px-5 py-3 text-gray-600">{a.assetType ?? '—'}</td>
                    <td className="px-5 py-3"><Badge text={a.status} colorMap={STATUS_COLORS} /></td>
                    <td className="px-5 py-3 text-xs text-gray-600">{a.jiraTicket ?? '—'}</td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={a.pickedUp ?? false}
                        disabled={updatingId === a.id}
                        onChange={() => togglePickedUp(a.id, a.pickedUp)}
                        className="h-4 w-4 rounded border-gray-300 text-[#2D1169] focus:ring-[#2D1169] cursor-pointer"
                      />
                    </td>
                    <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleArchive(a.id, a.archived)}
                        className="text-gray-300 hover:text-gray-500"
                        title={a.archived ? 'Unarchive' : 'Archive'}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAsset && (
        <AssetDetail
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onTogglePickedUp={(id, current) => togglePickedUp(id, current)}
          updating={updatingId === selectedAsset.id}
        />
      )}
    </div>
  )
}
