import { useTasks } from '../hooks/useTasks'
import { useTaskStore } from '../store/taskStore'
import PriorityBadge from '../components/PriorityBadge'
import StatusBadge from '../components/StatusBadge'
import { getDueDateStatus } from '../lib/dateUtils'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

export default function Dashboard() {
  const { data: tasks = [], isLoading } = useTasks()
  const { openModal } = useTaskStore()

  const stats = {
    total:       tasks.length,
    todo:        tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done:        tasks.filter(t => t.status === 'done').length,
    overdue:     tasks.filter(t => getDueDateStatus(t.end_date, t.status)?.label === '期限切れ').length,
  }
  const completionRate = tasks.length > 0 ? Math.round((stats.done / tasks.length) * 100) : 0

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
          <kbd className="ml-1 bg-indigo-500 text-indigo-100 text-xs px-1.5 py-0.5 rounded">N</kbd>
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: '全タスク',  value: stats.total,       color: 'indigo', icon: '📋' },
          { label: '未着手',    value: stats.todo,        color: 'gray',   icon: '⏳' },
          { label: '進行中',    value: stats.in_progress, color: 'blue',   icon: '🔄' },
          { label: '完了',      value: stats.done,        color: 'green',  icon: '✅' },
          { label: '期限切れ',  value: stats.overdue,     color: 'red',    icon: '🚨' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className={`rounded-xl border p-4 ${
            color === 'indigo' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
            color === 'gray'   ? 'bg-gray-50 border-gray-200 text-gray-700' :
            color === 'blue'   ? 'bg-blue-50 border-blue-200 text-blue-700' :
            color === 'green'  ? 'bg-green-50 border-green-200 text-green-700' :
                                 'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-3xl font-bold">{isLoading ? '…' : value}</div>
            <div className="text-xs font-medium mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* 完了率プログレスバー */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">全体の完了率</span>
          <span className="text-2xl font-bold text-indigo-600">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-indigo-500 rounded-full h-3 transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{stats.done} / {stats.total} 件完了</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 優先度が高いタスク */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            優先度：高（未完了）
          </h2>
          {highPriorityTasks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">高優先度のタスクはありません</p>
          ) : (
            <ul className="space-y-3">
              {highPriorityTasks.slice(0, 5).map(task => {
                const due = getDueDateStatus(task.end_date, task.status)
                return (
                  <li key={task.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-gray-700 truncate">{task.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {due && (
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${due.className}`}>
                          {due.label}
                        </span>
                      )}
                      <StatusBadge status={task.status} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* 直近のタスク */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            最近のタスク
          </h2>
          {recentTasks.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm mb-3">タスクがありません</p>
              <button
                onClick={() => openModal()}
                className="text-indigo-600 text-sm hover:underline"
              >
                最初のタスクを追加する →
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentTasks.map(task => (
                <li key={task.id} className="flex items-center justify-between gap-2">
                  <span className={`text-sm truncate ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {task.title}
                  </span>
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
