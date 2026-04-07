import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { onePagers } from '@/db/schema'
import { eq } from 'drizzle-orm'

const API_URL = process.env.API_URL ?? ''

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!API_URL) {
    return NextResponse.json({ error: 'API_URL not configured' }, { status: 500 })
  }

  // Get the one_pager id (FastAPI uses op.id, not launch_id)
  const [pager] = await db
    .select({ id: onePagers.id })
    .from(onePagers)
    .where(eq(onePagers.launchId, params.id))

  if (!pager) {
    return NextResponse.json({ error: 'One-pager not found' }, { status: 404 })
  }

  const res = await fetch(`${API_URL}/push-jira/${pager.id}`, { method: 'POST' })
  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  // Reflect the jira_ticket_id back into the DB row
  if (data.jira_ticket_id) {
    await db
      .update(onePagers)
      .set({ jiraTicketId: data.jira_ticket_id, jiraPushedAt: new Date() })
      .where(eq(onePagers.launchId, params.id))
  }

  return NextResponse.json(data)
}
