import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { launches, onePagers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { OnePagerEditForm } from '@/components/launches/OnePagerEditForm'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OnePagerEditPage({ params }: { params: { id: string } }) {
  const [launch] = await db.select().from(launches).where(eq(launches.id, params.id))
  if (!launch) notFound()

  let [pager] = await db.select().from(onePagers).where(eq(onePagers.launchId, params.id))

  if (!pager) {
    const [created] = await db.insert(onePagers).values({ launchId: params.id }).returning()
    pager = created
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <Link href={`/launches/${params.id}/one-pager`} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <p className="text-sm text-gray-500">{launch.launchName}</p>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6 ml-7">Edit One-Pager</h1>

      <OnePagerEditForm
        launchId={params.id}
        jiraBaseUrl={process.env.JIRA_BASE_URL ?? 'https://aceable.atlassian.net'}
        initial={{
          id: pager.id,
          pmmStatus: pager.pmmStatus,
          pmmOwner: pager.pmmOwner,
          pmmNotes: pager.pmmNotes,
          jiraTicketId: pager.jiraTicketId,
          positionStatement: pager.positionStatement,
          regulatoryStatus: pager.regulatoryStatus,
          keyMarketDifferentiator: pager.keyMarketDifferentiator,
          launchGoal: pager.launchGoal,
          executiveSummary: pager.executiveSummary,
          sourceCoursesAndBundles: pager.sourceCoursesAndBundles,
          ecomPages: pager.ecomPages,
          regulatoryNotes: pager.regulatoryNotes,
          regulatoryContext: pager.regulatoryContext,
          scopeOfferFeatures: pager.scopeOfferFeatures,
          finalPromoCode: pager.finalPromoCode,
          pricingNotes: pager.pricingNotes,
          finalMsrp: pager.finalMsrp as { value?: string } | null,
          finalSalePrice: pager.finalSalePrice as { value?: string } | null,
          finalPromoPrice: pager.finalPromoPrice as { value?: string } | null,
          discountStrategy: pager.discountStrategy,
          competitiveLandscape: pager.competitiveLandscape,
          competitivePosition: pager.competitivePosition,
          exploitableMarketGaps: pager.exploitableMarketGaps,
          differentiationPoints: pager.differentiationPoints,
          audienceInsights: pager.audienceInsights,
          behavioralInsights: pager.behavioralInsights,
          personas: pager.personas,
          seasonalTrends: pager.seasonalTrends,
          objectionHandling: pager.objectionHandling,
          valuePropPositioning: pager.valuePropPositioning,
          brandPositioningStatement: pager.brandPositioningStatement,
          stateSpecificMessaging: pager.stateSpecificMessaging,
          messagingAngles: pager.messagingAngles,
          messagingGuidelines: pager.messagingGuidelines,
          trustSignals: pager.trustSignals,
          passGuaranteeTerms: pager.passGuaranteeTerms,
          testimonials: pager.testimonials,
          marketPresenceStatus: pager.marketPresenceStatus,
          budgetTofPct: pager.budgetTofPct,
          budgetMofPct: pager.budgetMofPct,
          budgetBofPct: pager.budgetBofPct,
          budgetRationale: pager.budgetRationale,
          tofChannelStrategy: pager.tofChannelStrategy,
          mofChannelStrategy: pager.mofChannelStrategy,
          bofChannelStrategy: pager.bofChannelStrategy,
          marketData: pager.marketData,
          salaryData: pager.salaryData,
          appStoreSubtitle: pager.appStoreSubtitle,
          appStorePromoText: pager.appStorePromoText,
          appStoreDescription: pager.appStoreDescription,
          appStoreKeywords: pager.appStoreKeywords,
          playStoreShortDescription: pager.playStoreShortDescription,
          playStoreFullDescription: pager.playStoreFullDescription,
          brandContent: pager.brandContent,
          productNotes: pager.productNotes,
          personaMessageMap: pager.personaMessageMap,
        }}
      />
    </div>
  )
}
