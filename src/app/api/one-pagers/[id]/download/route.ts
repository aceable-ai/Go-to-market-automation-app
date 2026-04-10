import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { onePagers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle,
} from 'docx'

interface Section {
  heading: string
  fields: { label: string; key: string }[]
}

const SECTIONS: Section[] = [
  {
    heading: '1. Executive Summary',
    fields: [
      { label: 'Executive Summary', key: 'executiveSummary' },
    ],
  },
  {
    heading: '2. Scope & Offer',
    fields: [
      { label: 'Courses & Bundles', key: 'sourceCoursesAndBundles' },
      { label: 'Ecom Pages', key: 'ecomPages' },
      { label: 'Scope & Offer Features', key: 'scopeOfferFeatures' },
      { label: 'Regulatory Notes', key: 'regulatoryNotes' },
      { label: 'Promo Code', key: 'finalPromoCode' },
      { label: 'Final MSRP', key: 'finalMsrp' },
      { label: 'Final Sale Price', key: 'finalSalePrice' },
      { label: 'Final Promo Price', key: 'finalPromoPrice' },
      { label: 'Pricing Notes', key: 'pricingNotes' },
      { label: 'Discount Strategy', key: 'discountStrategy' },
    ],
  },
  {
    heading: '3. Competitive Analysis',
    fields: [
      { label: 'Competitive Landscape', key: 'competitiveLandscape' },
      { label: 'Our Position', key: 'competitivePosition' },
      { label: 'Differentiation Points', key: 'differentiationPoints' },
      { label: 'Exploitable Market Gaps', key: 'exploitableMarketGaps' },
    ],
  },
  {
    heading: '4. Audience & Pain Points',
    fields: [
      { label: 'Audience Insights', key: 'audienceInsights' },
      { label: 'Personas', key: 'personas' },
      { label: 'Behavioral Insights', key: 'behavioralInsights' },
      { label: 'Seasonal Trends', key: 'seasonalTrends' },
      { label: 'Objection Handling', key: 'objectionHandling' },
    ],
  },
  {
    heading: '5. Value Prop & Positioning',
    fields: [
      { label: 'Value Prop & Positioning', key: 'valuePropPositioning' },
      { label: 'Brand Positioning Statement', key: 'brandPositioningStatement' },
      { label: 'State-Specific Messaging', key: 'stateSpecificMessaging' },
      { label: 'Messaging Angles', key: 'messagingAngles' },
      { label: 'Messaging Guidelines', key: 'messagingGuidelines' },
    ],
  },
  {
    heading: '6. Social Proof & Trust Signals',
    fields: [
      { label: 'Trust Signals', key: 'trustSignals' },
      { label: 'Competitor Pass Guarantees', key: 'passGuaranteeTerms' },
      { label: 'Testimonials', key: 'testimonials' },
    ],
  },
  {
    heading: '7. Market Presence & GTM Strategy',
    fields: [
      { label: 'Market Presence', key: 'marketPresenceStatus' },
      { label: 'Budget Rationale', key: 'budgetRationale' },
      { label: 'ToF Channel Strategy', key: 'tofChannelStrategy' },
      { label: 'MoF Channel Strategy', key: 'mofChannelStrategy' },
      { label: 'BoF Channel Strategy', key: 'bofChannelStrategy' },
    ],
  },
  {
    heading: 'Research Data',
    fields: [
      { label: 'Market Data', key: 'marketData' },
      { label: 'Salary Data', key: 'salaryData' },
    ],
  },
]

function extractText(val: unknown): string {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object' && val !== null && 'value' in val) return String((val as { value: string }).value ?? '')
  return String(val)
}

function textToParagraphs(text: string): Paragraph[] {
  return text.split('\n').map(
    (line) =>
      new Paragraph({
        children: [new TextRun({ text: line, size: 22 })],
        spacing: { after: 80 },
      })
  )
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const [pager] = await db.select().from(onePagers).where(eq(onePagers.id, params.id))
  if (!pager) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const record = pager as Record<string, unknown>
  const title = (pager.launchName || 'One-Pager').toString()

  const children: Paragraph[] = []

  // Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 36 })],
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    })
  )

  // PMM info line
  const pmmInfo = [
    pager.pmmOwner ? `PMM: ${pager.pmmOwner}` : null,
    pager.pmmStatus ? `Status: ${pager.pmmStatus}` : null,
  ].filter(Boolean).join('  |  ')
  if (pmmInfo) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: pmmInfo, size: 20, color: '666666' })],
        spacing: { after: 300 },
      })
    )
  }

  // Budget summary
  if (pager.budgetTofPct != null || pager.budgetMofPct != null || pager.budgetBofPct != null) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Budget Split: ToF ${pager.budgetTofPct ?? '—'}% | MoF ${pager.budgetMofPct ?? '—'}% | BoF ${pager.budgetBofPct ?? '—'}%`,
            size: 22,
            bold: true,
          }),
        ],
        spacing: { after: 200 },
      })
    )
  }

  // Sections
  for (const section of SECTIONS) {
    // Section heading
    children.push(
      new Paragraph({
        children: [new TextRun({ text: section.heading, bold: true, size: 28 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 150 },
        border: {
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
        },
      })
    )

    for (const field of section.fields) {
      const val = extractText(record[field.key])
      if (!val) continue

      // Field label
      children.push(
        new Paragraph({
          children: [new TextRun({ text: field.label, bold: true, size: 22, color: '333333' })],
          spacing: { before: 200, after: 60 },
        })
      )

      // Field content
      children.push(...textToParagraphs(val))
    }
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 },
        },
      },
      children,
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  const filename = title.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_') + '_One_Pager.docx'

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
