import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { assets, launches } from '@/db/schema'
import { eq, and, desc, isNull, or, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const channel = searchParams.get('channel')
    const launchId = searchParams.get('launchId')
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    const conditions: SQL[] = []
    conditions.push(or(eq(assets.archived, false), isNull(assets.archived))!)
    if (channel) conditions.push(eq(assets.channel, channel))
    if (launchId) conditions.push(eq(assets.launchId, launchId))
    if (status) conditions.push(eq(assets.status, status))

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const rows = await db
      .select({
        id: assets.id,
        launchId: assets.launchId,
        assetName: assets.assetName,
        assetType: assets.assetType,
        channel: assets.channel,
        persona: assets.persona,
        copy: assets.copy,
        jiraTicket: assets.jiraTicket,
        status: assets.status,
        pickedUp: assets.pickedUp,
        archived: assets.archived,
        createdAt: assets.createdAt,
        launchName: launches.launchName,
        brand: launches.brand,
        vertical: launches.vertical,
      })
      .from(assets)
      .leftJoin(launches, eq(assets.launchId, launches.id))
      .where(where)
      .orderBy(desc(assets.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({ assets: rows })
  } catch (err) {
    console.error('GET /api/assets error:', err)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const [created] = await db.insert(assets).values({
      launchId: body.launchId || null,
      assetName: body.assetName || null,
      assetType: body.assetType || null,
      channel: body.channel || null,
      persona: body.persona || null,
      copy: body.copy || null,
      jiraTicket: body.jiraTicket || null,
      status: body.status || 'Pending',
    }).returning()

    return NextResponse.json({ asset: created }, { status: 201 })
  } catch (err) {
    console.error('POST /api/assets error:', err)
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 })
  }
}
