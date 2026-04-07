import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { landingPages } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

// POST — called by n8n after it generates landing page copy
// Body shape (sent by n8n):
// {
//   launchId: string,
//   productName: string,
//   state: string,
//   vertical: string,
//   phase: 1 | 2,
//   slug?: string,
//   pageTitle?: string,
//   metaTitle?: string,
//   metaDescription?: string,
//   heroHeadline?: string,
//   heroSubheadline?: string,
//   heroCtaText?: string,
//   heroCtaUrl?: string,
//   bodyContent?: string,
//   valuePropBullets?: string[],
//   pricingBlock?: object,
//   features?: string[],
//   faq?: { question: string, answer: string }[],
//   stateDisclaimer?: string,
//   waitlistFormId?: string,
//   ...anything else goes into rawContent
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      launchId,
      productName,
      state,
      vertical,
      phase,
      slug,
      pageTitle,
      metaTitle,
      metaDescription,
      heroHeadline,
      heroSubheadline,
      heroCtaText,
      heroCtaUrl,
      bodyContent,
      valuePropBullets,
      pricingBlock,
      features,
      faq,
      stateDisclaimer,
      waitlistFormId,
      ...rest
    } = body

    if (!launchId || !productName || !phase) {
      return NextResponse.json(
        { error: 'launchId, productName, and phase are required' },
        { status: 400 }
      )
    }

    // Upsert — if a page already exists for this launch+product+phase, update it
    const existing = await db
      .select({ id: landingPages.id })
      .from(landingPages)
      .where(
        and(
          eq(landingPages.launchId, launchId),
          eq(landingPages.productName, productName),
          eq(landingPages.phase, phase)
        )
      )

    const values = {
      launchId,
      productName,
      state: state ?? null,
      vertical: vertical ?? null,
      phase: Number(phase),
      slug: slug ?? null,
      pageTitle: pageTitle ?? null,
      metaTitle: metaTitle ?? null,
      metaDescription: metaDescription ?? null,
      heroHeadline: heroHeadline ?? null,
      heroSubheadline: heroSubheadline ?? null,
      heroCtaText: heroCtaText ?? null,
      heroCtaUrl: heroCtaUrl ?? null,
      bodyContent: bodyContent ?? null,
      valuePropBullets: valuePropBullets ?? null,
      pricingBlock: pricingBlock ?? null,
      features: features ?? null,
      faq: faq ?? null,
      stateDisclaimer: stateDisclaimer ?? null,
      waitlistFormId: waitlistFormId ?? null,
      cartEnabled: phase === 2,
      rawContent: Object.keys(rest).length > 0 ? rest : null,
      status: 'ready' as const,
      updatedAt: new Date(),
    }

    let page
    if (existing.length > 0) {
      const [updated] = await db
        .update(landingPages)
        .set(values)
        .where(eq(landingPages.id, existing[0].id))
        .returning()
      page = updated
    } else {
      const [created] = await db
        .insert(landingPages)
        .values(values)
        .returning()
      page = created
    }

    return NextResponse.json({ id: page.id, status: page.status }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to save landing page' }, { status: 500 })
  }
}

export async function GET() {
  const pages = await db.select().from(landingPages)
  return NextResponse.json(pages)
}
