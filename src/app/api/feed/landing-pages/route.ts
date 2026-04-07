import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { landingPages, launches } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'

// GET /api/feed/landing-pages
// This is the Feed Me endpoint — point Craft CMS's Feed Me plugin at this URL.
//
// Query params:
//   ?status=ready          filter by status (default: ready)
//   ?launchId=<uuid>       filter to one launch
//   ?phase=1               filter to phase 1 or 2
//
// Feed Me expects JSON in this shape:
// {
//   "entries": [ { ...fields } ]
// }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status') ?? 'ready'
  const launchIdFilter = searchParams.get('launchId')
  const phaseFilter = searchParams.get('phase')

  let query = db
    .select({
      id: landingPages.id,
      launchId: landingPages.launchId,
      productName: landingPages.productName,
      state: landingPages.state,
      vertical: landingPages.vertical,
      phase: landingPages.phase,
      slug: landingPages.slug,
      status: landingPages.status,
      cartEnabled: landingPages.cartEnabled,
      craftEntryId: landingPages.craftEntryId,
      pageTitle: landingPages.pageTitle,
      metaTitle: landingPages.metaTitle,
      metaDescription: landingPages.metaDescription,
      heroHeadline: landingPages.heroHeadline,
      heroSubheadline: landingPages.heroSubheadline,
      heroCtaText: landingPages.heroCtaText,
      heroCtaUrl: landingPages.heroCtaUrl,
      bodyContent: landingPages.bodyContent,
      valuePropBullets: landingPages.valuePropBullets,
      pricingBlock: landingPages.pricingBlock,
      features: landingPages.features,
      faq: landingPages.faq,
      stateDisclaimer: landingPages.stateDisclaimer,
      waitlistFormId: landingPages.waitlistFormId,
      updatedAt: landingPages.updatedAt,
    })
    .from(landingPages)

  const pages = await query

  // Apply filters in JS (simpler than building dynamic where clauses)
  let filtered = pages
  if (statusFilter) filtered = filtered.filter((p) => p.status === statusFilter)
  if (launchIdFilter) filtered = filtered.filter((p) => p.launchId === launchIdFilter)
  if (phaseFilter) filtered = filtered.filter((p) => p.phase === Number(phaseFilter))

  // Shape the response for Feed Me
  // Feed Me maps JSON keys to Craft field handles — adjust field names to match your Craft entry type
  const entries = filtered.map((p) => ({
    // Craft entry fields
    title: p.pageTitle ?? `${p.productName} — ${p.state ?? ''} Phase ${p.phase}`,
    slug: p.slug ?? buildSlug(p.productName, p.state, p.phase),
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    heroHeadline: p.heroHeadline,
    heroSubheadline: p.heroSubheadline,
    heroCtaText: p.heroCtaText,
    heroCtaUrl: p.heroCtaUrl,
    bodyContent: p.bodyContent,
    valuePropBullets: p.valuePropBullets,
    pricingBlock: p.pricingBlock,
    features: p.features,
    faq: p.faq,
    stateDisclaimer: p.stateDisclaimer,
    cartEnabled: p.cartEnabled,
    waitlistFormId: p.waitlistFormId,

    // Metadata Feed Me can use for matching/deduplication
    _id: p.id,
    _launchId: p.launchId,
    _productName: p.productName,
    _state: p.state,
    _vertical: p.vertical,
    _phase: p.phase,
    _updatedAt: p.updatedAt,
  }))

  return NextResponse.json(
    { entries },
    {
      headers: {
        'Content-Type': 'application/json',
        // Allow Feed Me to cache-bust
        'Cache-Control': 'no-store',
      },
    }
  )
}

function buildSlug(productName: string, state: string | null, phase: number): string {
  const base = [state, productName, phase === 1 ? 'waitlist' : 'buy']
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
  return base
}
