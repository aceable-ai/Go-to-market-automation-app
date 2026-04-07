import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { onePagers } from '@/db/schema'
import { eq } from 'drizzle-orm'

const API_URL = process.env.API_URL ?? ''

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!API_URL) {
    return NextResponse.json({ error: 'API_URL not configured' }, { status: 500 })
  }

  const res = await fetch(`${API_URL}/push-jira/${params.id}`, { method: 'POST' })
  const data = await res.json()

  if (!res.ok) {
    return NextResponse.json(data, { status: res.status })
  }

  if (data.jira_ticket_id) {
    await db
      .update(onePagers)
      .set({ jiraTicketId: data.jira_ticket_id, jiraPushedAt: new Date() })
      .where(eq(onePagers.id, params.id))
  }

  return NextResponse.json(data)
}
