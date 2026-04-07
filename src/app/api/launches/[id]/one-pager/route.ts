import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { onePagers } from '@/db/schema'
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

    const [existing] = await db
      .select({ id: onePagers.id })
      .from(onePagers)
      .where(eq(onePagers.launchId, params.id))

    if (!existing) {
      await db.insert(onePagers).values({ launchId: params.id })
    }

    const [updated] = await db
      .update(onePagers)
      .set({
        // PMM workflow
        pmmStatus: body.pmmStatus ?? undefined,
        pmmOwner: body.pmmOwner ?? undefined,
        pmmNotes: body.pmmNotes ?? undefined,

        // Executive summary
        positionStatement: body.positionStatement ?? undefined,
        regulatoryStatus: body.regulatoryStatus ?? undefined,
        keyMarketDifferentiator: body.keyMarketDifferentiator ?? undefined,
        launchGoal: body.launchGoal ?? undefined,
        executiveSummary: body.executiveSummary ?? undefined,

        // Scope & offer
        sourceCoursesAndBundles: body.sourceCoursesAndBundles ?? undefined,
        ecomPages: body.ecomPages ?? undefined,
        regulatoryNotes: body.regulatoryNotes ?? undefined,
        regulatoryContext: body.regulatoryContext ?? undefined,
        scopeOfferFeatures: body.scopeOfferFeatures ?? undefined,
        finalPromoCode: body.finalPromoCode ?? undefined,
        pricingNotes: body.pricingNotes ?? undefined,
        finalMsrp: body.finalMsrp ? { value: body.finalMsrp } : undefined,
        finalSalePrice: body.finalSalePrice ? { value: body.finalSalePrice } : undefined,
        finalPromoPrice: body.finalPromoPrice ? { value: body.finalPromoPrice } : undefined,
        discountStrategy: body.discountStrategy ?? undefined,

        // Competitive
        competitiveLandscape: body.competitiveLandscape ?? undefined,
        competitivePosition: body.competitivePosition ?? undefined,
        exploitableMarketGaps: body.exploitableMarketGaps ?? undefined,
        differentiationPoints: body.differentiationPoints ?? undefined,

        // Audience
        audienceInsights: body.audienceInsights ?? undefined,
        behavioralInsights: body.behavioralInsights ?? undefined,
        personas: body.personas ?? undefined,
        seasonalTrends: body.seasonalTrends ?? undefined,
        objectionHandling: body.objectionHandling ?? undefined,

        // Messaging
        valuePropPositioning: body.valuePropPositioning ?? undefined,
        brandPositioningStatement: body.brandPositioningStatement ?? undefined,
        stateSpecificMessaging: body.stateSpecificMessaging ?? undefined,
        messagingAngles: body.messagingAngles ?? undefined,
        messagingGuidelines: body.messagingGuidelines ?? undefined,

        // Social proof
        trustSignals: body.trustSignals ?? undefined,
        passGuaranteeTerms: body.passGuaranteeTerms ?? undefined,
        testimonials: body.testimonials ?? undefined,

        // Market & GTM
        marketPresenceStatus: body.marketPresenceStatus ?? undefined,
        budgetTofPct: body.budgetTofPct != null ? Number(body.budgetTofPct) : undefined,
        budgetMofPct: body.budgetMofPct != null ? Number(body.budgetMofPct) : undefined,
        budgetBofPct: body.budgetBofPct != null ? Number(body.budgetBofPct) : undefined,
        budgetRationale: body.budgetRationale ?? undefined,
        tofChannelStrategy: body.tofChannelStrategy ?? undefined,
        mofChannelStrategy: body.mofChannelStrategy ?? undefined,
        bofChannelStrategy: body.bofChannelStrategy ?? undefined,

        // Research
        marketData: body.marketData ?? undefined,
        salaryData: body.salaryData ?? undefined,

        // App store
        appStoreSubtitle: body.appStoreSubtitle ?? undefined,
        appStorePromoText: body.appStorePromoText ?? undefined,
        appStoreDescription: body.appStoreDescription ?? undefined,
        appStoreKeywords: body.appStoreKeywords ?? undefined,
        playStoreShortDescription: body.playStoreShortDescription ?? undefined,
        playStoreFullDescription: body.playStoreFullDescription ?? undefined,

        // Legacy
        brandContent: body.brandContent ?? undefined,
        productNotes: body.productNotes ?? undefined,
        personaMessageMap: body.personaMessageMap ?? undefined,

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
