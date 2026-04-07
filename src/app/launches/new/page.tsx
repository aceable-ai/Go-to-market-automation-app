import { IntakeForm } from '@/components/launches/IntakeForm'

export default function NewLaunchPage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">New One Pager Data: Main Table</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Fill in the details below to create a new launch and kick off the GTM workflow.
        </p>
      </div>
      <div className="card p-6">
        <IntakeForm />
      </div>
    </div>
  )
}
