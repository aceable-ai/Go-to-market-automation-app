import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { launches, onePagers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { VERTICAL_STYLES } from '@/lib/constants'
import { cn, formatDate } from '@/lib/utils'
import { Pencil } from 'lucide-react'

export const dynamic = 'force-dynamic'

function Section({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 pr-6 text-sm font-medium text-gray-600 align-top w-56 shrink-0">{label}</td>
      <td className="py-3 text-sm text-gray-900 whitespace-pre-wrap">{value}</td>
    </tr>
  )
}

function JsonSection({ label, value }: { label: string; value: unknown }) {
  if (!value) return null
  const text = typeof value === 'object' && value !== null && 'value' in value
    ? (value as { value: string }).value
    : String(value)
  if (!text) return null
  return (
    <tr className="border-b border-gray-100">
      <td className="py-3 pr-6 text-sm font-medium text-gray-600 align-top w-56 shrink-0">{label}</td>
      <td className="py-3 text-sm text-gray-900 whitespace-pre-wrap">{text}</td>
    </tr>
  )
}

export default async function OnePagerPage({ params }: { params: { id: string } }) {
  const [launch] = await db.select().from(launches).where(eq(launches.id, params.id))
  if (!launch) notFound()

  const [pager] = await db.select().from(onePagers).where(eq(onePagers.launchId, params.id))

  const verticalStyle = launch.vertical ? VERTICAL_STYLES[launch.vertical] ?? 'bg-gray-100 text-gray-600' : null

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{launch.launchName}</h1>
        <Link
          href={`/launches/${params.id}/one-pager/edit`}
          className="btn-primary flex items-center gap-1.5"
        >
          <Pencil className="w-4 h-4" />
          Edit one-pager
        </Link>
      </div>

      <table className="w-full">
        <tbody>
          <tr className="border-b border-gray-100">
            <td className="py-3 pr-6 text-sm font-medium text-gray-600 w-56">Launch Name</td>
            <td className="py-3 text-sm text-gray-900">{launch.launchName}</td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-3 pr-6 text-sm font-medium text-gray-600">Brand</td>
            <td className="py-3">
              {launch.brand
                ? <span className="badge bg-teal-100 text-teal-700">{launch.brand}</span>
                : <span className="text-gray-400">—</span>}
            </td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-3 pr-6 text-sm font-medium text-gray-600">Vertical</td>
            <td className="py-3">
              {launch.vertical
                ? <span className={cn('badge', verticalStyle)}>{launch.vertical}</span>
                : <span className="text-gray-400">—</span>}
            </td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-3 pr-6 text-sm font-medium text-gray-600">State</td>
            <td className="py-3 text-sm text-gray-900">{launch.state ?? '—'}</td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-3 pr-6 text-sm font-medium text-gray-600">Market Presence</td>
            <td className="py-3">
              {launch.marketPresence
                ? <span className="badge bg-green-100 text-green-700">{launch.marketPresence}</span>
                : <span className="text-gray-400">—</span>}
            </td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-3 pr-6 text-sm font-medium text-gray-600">Hard Launch Date</td>
            <td className="py-3 text-sm text-gray-900">{formatDate(launch.hardLaunchDate)}</td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-3 pr-6 text-sm font-medium text-gray-600">Status</td>
            <td className="py-3">
              {launch.status
                ? <span className="badge bg-purple-100 text-purple-700">{launch.status}</span>
                : <span className="text-gray-400">—</span>}
            </td>
          </tr>
          <tr className="border-b border-gray-100">
            <td className="py-3 pr-6 text-sm font-medium text-gray-600">Regulatory Status</td>
            <td className="py-3">
              {launch.regulatoryStatus
                ? <span className="badge bg-yellow-100 text-yellow-700">{launch.regulatoryStatus}</span>
                : <span className="text-gray-400">—</span>}
            </td>
          </tr>

          {pager && (
            <>
              <Section label="Brand Content"            value={pager.brandContent} />
              <Section label="Product Notes"            value={pager.productNotes} />
              <Section label="Executive Summary"        value={pager.executiveSummary} />
              <Section label="Regulatory Context"       value={pager.regulatoryContext} />
              <Section label="Competitive Landscape"    value={pager.competitiveLandscape} />
              <Section label="Audience Insights"        value={pager.audienceInsights} />
              <Section label="Value Prop & Positioning" value={pager.valuePropPositioning} />
              <Section label="State-Specific Messaging" value={pager.stateSpecificMessaging} />
              <Section label="Pricing Notes"            value={pager.pricingNotes} />
              <JsonSection label="Final MSRP"           value={pager.finalMsrp} />
              <JsonSection label="Final Sale Price"     value={pager.finalSalePrice} />
              <JsonSection label="Final Promo Price"    value={pager.finalPromoPrice} />
              <Section label="Final Promo Code"         value={pager.finalPromoCode} />
              <Section label="Competitive Position"     value={pager.competitivePosition} />
              <Section label="Market Data"              value={pager.marketData} />
              <Section label="Salary Data"              value={pager.salaryData} />
              <Section label="Scope & Offer Features"   value={pager.scopeOfferFeatures} />
              <Section label="Seasonal Trends"          value={pager.seasonalTrends} />
              <Section label="Regulatory Notes"         value={pager.regulatoryNotes} />
              <Section label="Exploitable Market Gaps"  value={pager.exploitableMarketGaps} />
              <Section label="Messaging Guidelines"     value={pager.messagingGuidelines} />
              <Section label="Source Courses & Bundles" value={pager.sourceCoursesAndBundles} />
              <Section label="Personas/Motivation/Key Message Map" value={pager.personaMessageMap} />
            </>
          )}

          {launch.jiraKey && (
            <tr className="border-b border-gray-100">
              <td className="py-3 pr-6 text-sm font-medium text-gray-600">Jira Ticket</td>
              <td className="py-3 text-sm font-medium text-[#2D1169]">{launch.jiraKey}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
