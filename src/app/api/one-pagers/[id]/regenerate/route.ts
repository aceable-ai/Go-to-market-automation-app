import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { onePagers, launches } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get the one-pager to find its associated launch
    const [pager] = await db.select().from(onePagers).where(eq(onePagers.id, params.id))
    if (!pager) {
      return NextResponse.json({ error: 'One-pager not found' }, { status: 404 })
    }
    if (!pager.launchId) {
      return NextResponse.json({ error: 'No launch linked to this one-pager' }, { status: 400 })
    }

    // Reset launch status to kick_off_automation so n8n picks it up again
    await db
      .update(launches)
      .set({ status: 'kick_off_automation', updatedAt: new Date() })
      .where(eq(launches.id, pager.launchId))

    return NextResponse.json({ ok: true, launchId: pager.launchId })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to queue regeneration' }, { status: 500 })
  }
}
