import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { onePagers } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()

    const [updated] = await db
      .update(onePagers)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(onePagers.id, params.id))
      .returning()

    return NextResponse.json(updated)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.delete(onePagers).where(eq(onePagers.id, params.id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
