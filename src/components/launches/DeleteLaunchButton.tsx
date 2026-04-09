'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

export function DeleteLaunchButton({ launchId }: { launchId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Remove this launch and its one-pager? This cannot be undone.')) return
    setDeleting(true)
    try {
      await fetch(`/api/launches/${launchId}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="btn-secondary flex items-center gap-1 text-xs py-1.5 px-3 text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-60"
    >
      {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
    </button>
  )
}
