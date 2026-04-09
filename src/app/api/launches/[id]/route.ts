import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { launches } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.delete(launches).where(eq(launches.id, params.id))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
