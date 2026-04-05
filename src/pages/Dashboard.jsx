import { useTasks } from '../hooks/useTasks'
import { useTaskStore } from '../store/taskStore'
import PriorityBadge from '../components/PriorityBadge'
import StatusBadge from '../components/StatusBadge'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const STAT_CARDS = [
  { key: 'total',       label: '全タスク',  color: 'indigo', icon: '📋' },
  { key: 'todo',        label: '未着手',    color: 'gray',   icon: '⏳' },
  { key: 'in_progress', label: '進行中',    color: 'blue',   icon: '🔄' },
  { key: 'done',        label: '完了',      color: 'green',  icon: '✅' },
]

const colorMap = {
  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  gray:   'bg-gray-50 border-gray-200 text-gray-700',
  blue:   'bg-blue-50 border-blue-200 text-blue-700',
  green:  'bg-green-50 border-green-200 text-green-700',
}

export default function Dashboard() {
  const { data: tasks = [], isLoading } = useTasks()
  const { openModal } = useTaskStore()

  const stats = {
    total:       tasks.length,
    todo:        tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done:        tasks.filter(t => t.status === 'done').length,
  }

  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done')
  const recentTasks = [...tasks].slice(0, 5)

  return (
    <div className="p-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(), 'yyyy年M月d日（E）', { locale: ja })}
          </p>
        </div>
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

      {/* 統計カード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ key, label, color, icon }) => (
          <div key={key} className={`rounded-xl border p-5 ${colorMap[color]}`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-3xl font-bold">{isLoading ? '…' : stats[key]}</div>
            <div className="text-sm font-medium mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 優先度が高いタスク */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            優先度：高（未完了）
          </h2>
          {highPriorityTasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">高優先度のタスクはありません</p>
          ) : (
            <ul className="space-y-3">
              {highPriorityTasks.slice(0, 5).map(task => (
                <li key={task.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-700 truncate">{task.title}</span>
                  <StatusBadge status={task.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 直近のタスク */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
            最近のタスク
          </h2>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">タスクがありません</p>
          ) : (
            <ul className="space-y-3">
              {recentTasks.map(task => (
                <li key={task.id} className="flex items-center justify-between gap-2">
                  <span className="text-sm text-gray-700 truncate">{task.title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
