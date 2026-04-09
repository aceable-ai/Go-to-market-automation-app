import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { onePagers, launches } from '@/db/schema'
import { eq, or } from 'drizzle-orm'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the one-pager
    const [pager] = await db.select().from(onePagers).where(eq(onePagers.id, params.id))
    if (!pager) {
      return NextResponse.json({ error: 'One-pager not found' }, { status: 404 })
    }

    // Find the launch — prefer launch_id FK, fall back to airtable_record_id match
    // (webhook sets airtable_record_id = launch UUID but may not set launch_id)
    let launchId: string | null = pager.launchId ?? null

    if (!launchId && pager.airtableRecordId) {
      const [matched] = await db
        .select({ id: launches.id })
        .from(launches)
        .where(eq(launches.id, pager.airtableRecordId))
      launchId = matched?.id ?? null
    }

    if (!launchId) {
      return NextResponse.json({ error: 'No launch found for this one-pager' }, { status: 400 })
    }

    // Reset launch status to kick_off_automation so n8n picks it up again
    await db
      .update(launches)
      .set({ status: 'kick_off_automation', updatedAt: new Date() })
      .where(eq(launches.id, launchId))

    return NextResponse.json({ ok: true, launchId })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to queue regeneration' }, { status: 500 })
  }
}
