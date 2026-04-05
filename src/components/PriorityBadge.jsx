const config = {
  high:   { label: '高', className: 'bg-red-100 text-red-700 border border-red-200' },
  medium: { label: '中', className: 'bg-amber-100 text-amber-700 border border-amber-200' },
  low:    { label: '低', className: 'bg-green-100 text-green-700 border border-green-200' },
}

export default function PriorityBadge({ priority }) {
  const { label, className } = config[priority] ?? config.medium
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
