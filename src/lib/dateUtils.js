import { differenceInCalendarDays, parseISO } from 'date-fns'

/**
 * 期限ステータスを返す
 * @returns {{ label: string, className: string } | null}
 */
export function getDueDateStatus(endDate, status) {
  if (!endDate || status === 'done') return null
  const diff = differenceInCalendarDays(parseISO(endDate), new Date())
  if (diff < 0)  return { label: '期限切れ', className: 'bg-red-100 text-red-700 border border-red-300' }
  if (diff === 0) return { label: '今日まで', className: 'bg-orange-100 text-orange-700 border border-orange-300' }
  if (diff <= 3)  return { label: `あと${diff}日`, className: 'bg-yellow-100 text-yellow-700 border border-yellow-300' }
  return null
}
