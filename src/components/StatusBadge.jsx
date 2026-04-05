const config = {
  todo:        { label: '未着手', className: 'bg-gray-100 text-gray-600 border border-gray-200' },
  in_progress: { label: '進行中', className: 'bg-blue-100 text-blue-700 border border-blue-200' },
  done:        { label: '完了',   className: 'bg-green-100 text-green-700 border border-green-200' },
}

export default function StatusBadge({ status }) {
  const { label, className } = config[status] ?? config.todo
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
