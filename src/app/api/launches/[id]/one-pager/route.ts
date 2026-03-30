import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { onePagers, launches } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const [pager] = await db
    .select()
    .from(onePagers)
    .where(eq(onePagers.launchId, params.id))

  if (!pager) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(pager)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()

    // Ensure one-pager row exists
    const [existing] = await db
      .select({ id: onePagers.id })
      .from(onePagers)
      .where(eq(onePagers.launchId, params.id))

    if (!existing) {
      // Create it if it doesn't exist yet
      await db.insert(onePagers).values({ launchId: params.id })
    }

    const [updated] = await db
      .update(onePagers)
      .set({
        brandContent: body.brandContent ?? null,
        productNotes: body.productNotes ?? null,
        executiveSummary: body.executiveSummary ?? null,
        regulatoryContext: body.regulatoryContext ?? null,
        competitiveLandscape: body.competitiveLandscape ?? null,
        audienceInsights: body.audienceInsights ?? null,
        valuePropPositioning: body.valuePropPositioning ?? null,
        stateSpecificMessaging: body.stateSpecificMessaging ?? null,
        pricingNotes: body.pricingNotes ?? null,
        finalMsrp: body.finalMsrp ? { value: body.finalMsrp } : null,
        finalSalePrice: body.finalSalePrice ? { value: body.finalSalePrice } : null,
        finalPromoPrice: body.finalPromoPrice ? { value: body.finalPromoPrice } : null,
        finalPromoCode: body.finalPromoCode ?? null,
        competitivePosition: body.competitivePosition ?? null,
        marketData: body.marketData ?? null,
        salaryData: body.salaryData ?? null,
        scopeOfferFeatures: body.scopeOfferFeatures ?? null,
        seasonalTrends: body.seasonalTrends ?? null,
        regulatoryNotes: body.regulatoryNotes ?? null,
        exploitableMarketGaps: body.exploitableMarketGaps ?? null,
        messagingGuidelines: body.messagingGuidelines ?? null,
        sourceCoursesAndBundles: body.sourceCoursesAndBundles ?? null,
        personaMessageMap: body.personaMessageMap ?? null,
        updatedAt: new Date(),
      })
      .where(eq(onePagers.launchId, params.id))
      .returning()

    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update one-pager' }, { status: 500 })
  }
}
