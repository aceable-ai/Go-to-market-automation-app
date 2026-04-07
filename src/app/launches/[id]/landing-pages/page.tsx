import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { launches, landingPages } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { cn } from '@/lib/utils'
import { VERTICAL_STYLES } from '@/lib/constants'
import { Plus, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PHASE_LABELS: Record<number, string> = {
  1: 'Phase 1 — Waitlist',
  2: 'Phase 2 — Cart Active',
}

const PHASE_STYLES: Record<number, string> = {
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-green-100 text-green-700',
}

const STATUS_STYLES: Record<string, string> = {
  draft:     'bg-gray-100 text-gray-600',
  ready:     'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
}

export default async function LandingPagesPage({ params }: { params: { id: string } }) {
  const [launch] = await db.select().from(launches).where(eq(launches.id, params.id))
  if (!launch) notFound()

  const pages = await db
    .select()
    .from(landingPages)
    .where(eq(landingPages.launchId, params.id))
    .orderBy(asc(landingPages.productName), asc(landingPages.phase))

  // Group by product name
  const byProduct = pages.reduce((acc, page) => {
    if (!acc[page.productName]) acc[page.productName] = []
    acc[page.productName].push(page)
    return acc
  }, {} as Record<string, typeof pages>)

  const feedUrl = `/api/feed/landing-pages?launchId=${params.id}`

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">{launch.launchName}</p>
          <h1 className="text-xl font-semibold text-gray-900">Landing Pages</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pages.length} pages across {Object.keys(byProduct).length} products</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={feedUrl}
            target="_blank"
            className="btn-secondary flex items-center gap-1.5 text-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Feed Me URL
          </a>
          <Link
            href={`/launches/${params.id}/landing-pages/new`}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add page
          </Link>
        </div>
      </div>

      {/* Feed Me callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-blue-800 mb-1">Feed Me endpoint for this launch</p>
        <div className="flex items-center gap-2">
          <code className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded flex-1 truncate">
            {typeof window !== 'undefined' ? window.location.origin : 'https://your-app.railway.app'}{feedUrl}
          </code>
        </div>
        <p className="text-xs text-blue-600 mt-1.5">
          Point Craft CMS → Feed Me at this URL. Add <code>?phase=1</code> or <code>?phase=2</code> to import one phase at a time.
        </p>
      </div>

      {/* Empty state */}
      {pages.length === 0 && (
        <div className="card p-10 text-center">
          <p className="text-gray-500 font-medium">No landing pages yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Pages will appear here once n8n generates them, or you can add one manually.
          </p>
          <Link href={`/launches/${params.id}/landing-pages/new`} className="btn-primary inline-flex mt-4">
            Add first page
          </Link>
        </div>
      )}

      {/* Pages grouped by product */}
      <div className="space-y-6">
        {Object.entries(byProduct).map(([product, productPages]) => (
          <div key={product} className="card overflow-hidden">
            {/* Product header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900">{product}</span>
                {launch.vertical && (
                  <span className={cn('badge', VERTICAL_STYLES[launch.vertical] ?? 'bg-gray-100 text-gray-600')}>
                    {launch.vertical}
                  </span>
                )}
                {launch.state && (
                  <span className="text-xs text-gray-500">{launch.state}</span>
                )}
              </div>
              <span className="text-xs text-gray-400">{productPages.length} page{productPages.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Phase rows */}
            <div className="divide-y divide-gray-50">
              {[1, 2].map((phase) => {
                const page = productPages.find((p) => p.phase === phase)
                return (
                  <div key={phase} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className={cn('badge', PHASE_STYLES[phase])}>
                        {PHASE_LABELS[phase]}
                      </span>
                      {page?.slug && (
                        <span className="text-xs text-gray-400 font-mono">/{page.slug}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {page ? (
                        <>
                          <span className={cn('badge', STATUS_STYLES[page.status ?? 'draft'])}>
                            {page.status ?? 'draft'}
                          </span>
                          {page.craftEntryId && (
                            <span className="text-xs text-gray-400">Craft #{page.craftEntryId}</span>
                          )}
                          <Link
                            href={`/launches/${params.id}/landing-pages/${page.id}`}
                            className="text-xs text-[#2D1169] hover:underline font-medium"
                          >
                            View / Edit
                          </Link>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Waiting for n8n to generate…
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
