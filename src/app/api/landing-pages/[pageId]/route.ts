import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { landingPages } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: { pageId: string } }) {
  const [page] = await db
    .select()
    .from(landingPages)
    .where(eq(landingPages.id, params.pageId))

  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(page)
}

export async function PATCH(req: NextRequest, { params }: { params: { pageId: string } }) {
  try {
    const body = await req.json()

    const [updated] = await db
      .update(landingPages)
      .set({
        slug: body.slug ?? null,
        status: body.status ?? null,
        cartEnabled: body.cartEnabled ?? null,
        craftEntryId: body.craftEntryId ?? null,
        pageTitle: body.pageTitle ?? null,
        metaTitle: body.metaTitle ?? null,
        metaDescription: body.metaDescription ?? null,
        heroHeadline: body.heroHeadline ?? null,
        heroSubheadline: body.heroSubheadline ?? null,
        heroCtaText: body.heroCtaText ?? null,
        heroCtaUrl: body.heroCtaUrl ?? null,
        bodyContent: body.bodyContent ?? null,
        valuePropBullets: body.valuePropBullets ?? null,
        pricingBlock: body.pricingBlock ?? null,
        features: body.features ?? null,
        faq: body.faq ?? null,
        stateDisclaimer: body.stateDisclaimer ?? null,
        waitlistFormId: body.waitlistFormId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(landingPages.id, params.pageId))
      .returning()

    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
