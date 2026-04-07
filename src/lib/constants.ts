export const VERTICALS = ['INS', 'RE', 'MTG', 'DRV-IDS', 'DRV-DEC', 'DRV-ACE'] as const

export const VERTICAL_STYLES: Record<string, string> = {
  INS:       'bg-blue-100 text-blue-700',
  RE:        'bg-purple-100 text-purple-700',
  MTG:       'bg-orange-100 text-orange-700',
  'DRV-IDS': 'bg-green-100 text-green-700',
  'DRV-DEC': 'bg-teal-100 text-teal-700',
  'DRV-ACE': 'bg-indigo-100 text-indigo-700',
}

export const BRANDS = [
  'Aceable Insurance',
  'Aceable Agent',
  'Aceable Driver Ed',
] as const

export const MARKET_PRESENCE = ['Emerging', 'Established', 'Growing'] as const

export const REGULATORY_STATUS = ['Regulated State', 'Non-Regulated State'] as const

export const LAUNCH_STATUSES = [
  'Draft',
  'Kick off automation',
  'Confirmed',
  'Live',
] as const

export const LAUNCH_PHASES = [
  'Pre-Launch',
  'Soft Launch',
  'Hard Launch',
  'Post-Launch',
] as const

export const LAUNCH_PHASE_STYLES: Record<string, string> = {
  'Pre-Launch':  'bg-blue-100 text-blue-700',
  'Soft Launch': 'bg-cyan-100 text-cyan-700',
  'Hard Launch': 'bg-green-100 text-green-700',
  'Post-Launch': 'bg-orange-100 text-orange-700',
}

export const TASK_STATUS_STYLES: Record<string, string> = {
  Backlog:     'bg-slate-100 text-slate-600',
  'In Progress':'bg-yellow-100 text-yellow-700',
  Done:        'bg-green-100 text-green-700',
  Blocked:     'bg-red-100 text-red-700',
}

export const WORK_SOURCE_STYLES: Record<string, string> = {
  'Human':                    'bg-gray-100 text-gray-700',
  'WF: Landing Page Generator':'bg-pink-100 text-pink-700',
  'WF: One Pager Generator':  'bg-orange-100 text-orange-700',
  'WF: Asset Generator':      'bg-green-100 text-green-700',
}

export const ASSIGNEE_COLORS: Record<string, string> = {
  'Peggy Black':   'bg-purple-500',
  'Brooke Elliott':'bg-blue-500',
  'Tim Johnson':   'bg-teal-500',
  'Valencia Bush': 'bg-violet-500',
  'Spencer Post':  'bg-green-500',
}
