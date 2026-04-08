import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { launches, onePagers, gtmTasks, gtmTaskTemplates, launchProducts } from '@/db/schema'
import { asc } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // 1. Create launch record
    const [launch] = await db
      .insert(launches)
      .values({
        launchName: body.launchName,
        brand: body.brand || null,
        vertical: body.vertical || null,
        state: body.state || null,
        marketPresence: body.marketPresence || null,
        regulatoryStatus: body.regulatoryStatus || null,
        hardLaunchDate: body.hardLaunchDate || null,
        status: body.status || 'draft',
      })
      .returning()

    // 2. Save selected products to launch_products
    if (body.products && body.products.length > 0) {
      await db.insert(launchProducts).values(
        body.products.map((name: string) => ({ launchId: launch.id, productName: name }))
      )
    }

    // 3. Create empty one-pager
    await db.insert(onePagers).values({ launchId: launch.id, launchName: body.launchName })

    // 4. Instantiate all GTM task templates for this launch
    const templates = await db
      .select()
      .from(gtmTaskTemplates)
      .orderBy(asc(gtmTaskTemplates.sortOrder))

    if (templates.length > 0) {
      await db.insert(gtmTasks).values(
        templates.map((t) => ({
          launchId: launch.id,
          templateId: t.id,
          name: t.name,
          launchPhase: t.launchPhase,
          workSourceType: t.workSourceType,
          assignee: t.defaultAssignee,
          channel: t.channel,
          dayOffset: t.dayOffset,
          durationBusinessDays: t.durationBusinessDays,
          peopleHours: t.peopleHours,
          measureOfSuccess: t.measureOfSuccess,
          status: 'Backlog',
          dependencies: t.dependencyNames ?? [],
        }))
      )
    }

    // 5. Fire n8n webhook if status is kick-off
    if (
      launch.status?.toLowerCase().includes('kick') &&
      process.env.N8N_WEBHOOK_URL
    ) {
      await fetch(process.env.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          launch,
          products: body.products ?? [],
        }),
      }).catch(() => {
        // Don't fail the request if n8n is unreachable
        console.warn('n8n webhook failed — launch still created')
      })
    }

    return NextResponse.json({ id: launch.id }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create launch' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const all = await db
      .select({
        id: launches.id,
        launchName: launches.launchName,
        brand: launches.brand,
        vertical: launches.vertical,
        hardLaunchDate: launches.hardLaunchDate,
        status: launches.status,
      })
      .from(launches)
      .orderBy(asc(launches.hardLaunchDate))

    return NextResponse.json(all)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch launches' }, { status: 500 })
  }
}
