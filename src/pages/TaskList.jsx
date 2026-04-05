import { useState } from 'react'
import { useTasks, useDeleteTask, useUpdateTask } from '../hooks/useTasks'
import { useTaskStore } from '../store/taskStore'
import PriorityBadge from '../components/PriorityBadge'
import StatusBadge from '../components/StatusBadge'
import { getDueDateStatus } from '../lib/dateUtils'
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

const SORT_OPTIONS = [
  { value: 'created_desc', label: '作成日（新しい順）' },
  { value: 'created_asc',  label: '作成日（古い順）' },
  { value: 'priority',     label: '優先度順' },
  { value: 'end_date',     label: '期限順' },
]

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

// ステータスを順に切り替える
const STATUS_CYCLE = { todo: 'in_progress', in_progress: 'done', done: 'todo' }
const STATUS_CYCLE_LABEL = { todo: '→ 進行中にする', in_progress: '→ 完了にする', done: '→ 未着手に戻す' }

export default function TaskList() {
  const { data: tasks = [], isLoading } = useTasks()
  const deleteTask = useDeleteTask()
  const updateTask = useUpdateTask()
  const { openModal, filterStatus, filterPriority, searchQuery, setFilterStatus, setFilterPriority, setSearchQuery } = useTaskStore()
  const [sortKey, setSortKey] = useState('created_desc')

  const filtered = tasks
    .filter(task => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'created_asc':  return new Date(a.created_at) - new Date(b.created_at)
        case 'priority':     return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
        case 'end_date':
          if (!a.end_date && !b.end_date) return 0
          if (!a.end_date) return 1
          if (!b.end_date) return -1
          return new Date(a.end_date) - new Date(b.end_date)
        default:             return new Date(b.created_at) - new Date(a.created_at)
      }
    })

  const handleDelete = async (id) => {
    if (!window.confirm('このタスクを削除しますか？')) return
    await deleteTask.mutateAsync(id)
  }

  const handleStatusCycle = async (task) => {
    await updateTask.mutateAsync({ id: task.id, status: STATUS_CYCLE[task.status] })
  }

  const hasActiveFilters = filterStatus !== 'all' || filterPriority !== 'all' || searchQuery

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
          <kbd className="ml-1 bg-indigo-500 text-indigo-100 text-xs px-1.5 py-0.5 rounded">N</kbd>
        </button>
      </div>

      {/* フィルター・ソート */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          {/* 検索 */}
          <div className="relative">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="タスクを検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48"
            />
          </div>

          {/* ソート */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">並び替え:</span>
            <select
              value={sortKey}
              onChange={e => setSortKey(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* フィルタークリア */}
          {hasActiveFilters && (
            <button
              onClick={() => { setFilterStatus('all'); setFilterPriority('all'); setSearchQuery('') }}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              フィルターをクリア
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          {/* ステータスフィルター */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">ステータス:</span>
            <div className="flex gap-1">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilterStatus(value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
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

          {/* 優先度フィルター */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">優先度:</span>
            <div className="flex gap-1">
              {PRIORITY_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilterPriority(value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
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
      </div>

      {/* タスクカウント */}
      <p className="text-sm text-gray-500 mb-4">{filtered.length} 件のタスク</p>

      {/* タスクリスト */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
              <div className="flex gap-2 mb-2">
                <div className="h-4 w-10 bg-gray-200 rounded" />
                <div className="h-4 w-14 bg-gray-200 rounded" />
              </div>
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm mb-3">
            {hasActiveFilters ? '条件に一致するタスクがありません' : 'タスクがありません'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={() => { setFilterStatus('all'); setFilterPriority('all'); setSearchQuery('') }}
              className="text-indigo-600 text-sm hover:underline"
            >
              フィルターをリセット
            </button>
          ) : (
            <button onClick={() => openModal()} className="text-indigo-600 text-sm hover:underline">
              最初のタスクを追加する →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(task => {
            const due = getDueDateStatus(task.end_date, task.status)
            const isDone = task.status === 'done'
            return (
              <div
                key={task.id}
                className={`bg-white border rounded-xl p-4 flex items-start justify-between gap-4 hover:shadow-sm transition-all ${
                  due?.label === '期限切れ' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <PriorityBadge priority={task.priority} />
                    {/* ステータスをクリックで切り替え */}
                    <button
                      onClick={() => handleStatusCycle(task)}
                      title={STATUS_CYCLE_LABEL[task.status]}
                      className="hover:scale-105 transition-transform"
                    >
                      <StatusBadge status={task.status} />
                    </button>
                    {due && (
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${due.className}`}>
                        {due.label}
                      </span>
                    )}
                  </div>
                  <h3 className={`font-medium truncate ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                  )}
                  {(task.start_date || task.end_date) && (
                    <p className="text-xs text-gray-400 mt-1.5">
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
            )
          })}
        </div>
      )}
    </div>
  )
}
