import { useTasks, useDeleteTask } from '../hooks/useTasks'
import { useTaskStore } from '../store/taskStore'
import PriorityBadge from '../components/PriorityBadge'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'

const STATUS_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'todo', label: '未着手' },
  { value: 'in_progress', label: '進行中' },
  { value: 'done', label: '完了' },
]

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'すべて' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

export default function TaskList() {
  const { data: tasks = [], isLoading } = useTasks()
  const deleteTask = useDeleteTask()
  const { openModal, filterStatus, filterPriority, searchQuery, setFilterStatus, setFilterPriority, setSearchQuery } = useTaskStore()

  const filtered = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const handleDelete = async (id) => {
    if (!window.confirm('このタスクを削除しますか？')) return
    await deleteTask.mutateAsync(id)
  }

  return (
    <div className="p-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">タスク一覧</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          タスクを追加
        </button>
      </div>

      {/* フィルター */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="タスクを検索..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">ステータス:</span>
          <div className="flex gap-1">
            {STATUS_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilterStatus(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">優先度:</span>
          <div className="flex gap-1">
            {PRIORITY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilterPriority(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterPriority === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* タスクカウント */}
      <p className="text-sm text-gray-500 mb-4">{filtered.length} 件のタスク</p>

      {/* タスクリスト */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm">タスクが見つかりません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => (
            <div
              key={task.id}
              className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
                <h3 className="font-medium text-gray-800 truncate">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                )}
                {(task.start_date || task.end_date) && (
                  <p className="text-xs text-gray-400 mt-2">
                    {task.start_date && format(new Date(task.start_date), 'yyyy/MM/dd')}
                    {task.start_date && task.end_date && ' 〜 '}
                    {task.end_date && format(new Date(task.end_date), 'yyyy/MM/dd')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openModal(task)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="編集"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="削除"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
