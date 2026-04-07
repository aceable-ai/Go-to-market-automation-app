import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/db'
import { onePagers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { OnePagerStandaloneEditForm } from '@/components/launches/OnePagerStandaloneEditForm'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function StandaloneOnePagerEditPage({ params }: { params: { id: string } }) {
  const [pager] = await db.select().from(onePagers).where(eq(onePagers.id, params.id))
  if (!pager) notFound()

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <Link href="/one-pagers" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <p className="text-sm text-gray-500">{pager.airtableRecordId ?? pager.id}</p>
      </div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6 ml-7">Edit One-Pager</h1>

      <OnePagerStandaloneEditForm
        onePagerId={params.id}
        jiraBaseUrl={process.env.JIRA_BASE_URL ?? 'https://aceable.atlassian.net'}
        initial={pager}
      />
    </div>
  )
}
