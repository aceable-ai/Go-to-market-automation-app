import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { assets } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [row] = await db.select().from(assets).where(eq(assets.id, params.id))
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ asset: row })
  } catch (err) {
    console.error('GET /api/assets/[id] error:', err)
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json() as Record<string, unknown>

    const allowed = ['assetName', 'assetType', 'channel', 'persona', 'copy', 'jiraTicket', 'status', 'pickedUp', 'archived']
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    const [updated] = await db
      .update(assets)
      .set(updates)
      .where(eq(assets.id, params.id))
      .returning()

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ asset: updated })
  } catch (err) {
    console.error('PATCH /api/assets/[id] error:', err)
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.delete(assets).where(eq(assets.id, params.id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/assets/[id] error:', err)
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}
