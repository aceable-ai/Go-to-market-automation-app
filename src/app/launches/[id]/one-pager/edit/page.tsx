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

  // Auto-create one-pager row if it doesn't exist yet
  if (!pager) {
    const [created] = await db
      .insert(onePagers)
      .values({ launchId: params.id })
      .returning()
    pager = created
  }

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <Link
          href={`/launches/${params.id}/one-pager`}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <p className="text-sm text-gray-500">{launch.launchName}</p>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6 ml-7">Edit One-Pager</h1>

      <OnePagerEditForm
        launchId={params.id}
        initial={{
          brandContent: pager.brandContent,
          productNotes: pager.productNotes,
          executiveSummary: pager.executiveSummary,
          regulatoryContext: pager.regulatoryContext,
          competitiveLandscape: pager.competitiveLandscape,
          audienceInsights: pager.audienceInsights,
          valuePropPositioning: pager.valuePropPositioning,
          stateSpecificMessaging: pager.stateSpecificMessaging,
          pricingNotes: pager.pricingNotes,
          finalMsrp: pager.finalMsrp as { value?: string } | null,
          finalSalePrice: pager.finalSalePrice as { value?: string } | null,
          finalPromoPrice: pager.finalPromoPrice as { value?: string } | null,
          finalPromoCode: pager.finalPromoCode,
          competitivePosition: pager.competitivePosition,
          marketData: pager.marketData,
          salaryData: pager.salaryData,
          scopeOfferFeatures: pager.scopeOfferFeatures,
          seasonalTrends: pager.seasonalTrends,
          regulatoryNotes: pager.regulatoryNotes,
          exploitableMarketGaps: pager.exploitableMarketGaps,
          messagingGuidelines: pager.messagingGuidelines,
          sourceCoursesAndBundles: pager.sourceCoursesAndBundles,
          personaMessageMap: pager.personaMessageMap,
        }}
      />
    </div>
  )
}
