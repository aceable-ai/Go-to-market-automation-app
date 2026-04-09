import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { onePagers, gtmTaskTemplates, gtmTasks } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()

    // Fetch current state before updating so we can detect status transitions
    const [before] = await db.select().from(onePagers).where(eq(onePagers.id, params.id))

    const [updated] = await db
      .update(onePagers)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(onePagers.id, params.id))
      .returning()

    // When pmmStatus transitions to 'approved', generate GTM tasks for the launch
    const wasApproved = before?.pmmStatus !== 'approved' && body.pmmStatus === 'approved'
    if (wasApproved && updated.launchId) {
      // Only generate if no tasks exist yet for this launch
      const existing = await db
        .select({ id: gtmTasks.id })
        .from(gtmTasks)
        .where(eq(gtmTasks.launchId, updated.launchId))
        .limit(1)

      if (existing.length === 0) {
        const templates = await db
          .select()
          .from(gtmTaskTemplates)
          .orderBy(asc(gtmTaskTemplates.sortOrder))

        if (templates.length > 0) {
          await db.insert(gtmTasks).values(
            templates.map((t) => ({
              launchId: updated.launchId!,
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
      }
    }

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
