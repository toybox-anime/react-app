import { useMemo, useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useTaskStore } from '../store/taskStore'
import {
  eachDayOfInterval,
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  differenceInCalendarDays,
  isToday,
  isWeekend,
  parseISO,
} from 'date-fns'
import { ja } from 'date-fns/locale'

const PRIORITY_COLORS = {
  high:   'bg-red-500',
  medium: 'bg-amber-400',
  low:    'bg-green-500',
}

const COL_WIDTH = 36 // px per day

export default function GanttPage() {
  const { data: tasks = [], isLoading } = useTasks()
  const { openModal } = useTaskStore()
  const [baseDate, setBaseDate] = useState(new Date())

  const monthStart = startOfMonth(baseDate)
  const monthEnd = endOfMonth(addMonths(baseDate, 1)) // 2ヶ月表示
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const taskRows = useMemo(
    () => tasks.filter(t => t.start_date && t.end_date),
    [tasks]
  )

  const getBarStyle = (task) => {
    const start = parseISO(task.start_date)
    const end = parseISO(task.end_date)
    const offsetDays = differenceInCalendarDays(start, monthStart)
    const spanDays = differenceInCalendarDays(end, start) + 1
    return {
      left: `${offsetDays * COL_WIDTH}px`,
      width: `${spanDays * COL_WIDTH - 4}px`,
    }
  }

  const todayOffset = differenceInCalendarDays(new Date(), monthStart)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ガントチャート</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setBaseDate(d => subMonths(d, 1))}
              className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-24 text-center">
              {format(baseDate, 'yyyy年M月', { locale: ja })}
            </span>
            <button
              onClick={() => setBaseDate(d => addMonths(d, 1))}
              className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
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
      </div>

      {/* 凡例 */}
      <div className="flex gap-4 mb-4">
        {[['high', '高', 'bg-red-500'], ['medium', '中', 'bg-amber-400'], ['low', '低', 'bg-green-500']].map(([k, label, cls]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm inline-block ${cls}`} />
            <span className="text-xs text-gray-600">優先度：{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-0.5 h-4 bg-red-400 inline-block" />
          <span className="text-xs text-gray-600">今日</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : taskRows.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-sm">開始日・終了日が設定されたタスクがありません</p>
            <button
              onClick={() => openModal()}
              className="mt-4 text-indigo-600 text-sm hover:underline"
            >
              タスクを追加する
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {/* タスク名列 */}
                  <th className="sticky left-0 z-10 bg-gray-50 border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-600 min-w-52">
                    タスク名
                  </th>
                  {/* 日付ヘッダー */}
                  {days.map(day => (
                    <th
                      key={day.toISOString()}
                      className={`px-0 py-3 text-center text-xs font-medium border-r border-gray-100 ${
                        isToday(day) ? 'bg-red-50 text-red-600 font-bold' :
                        isWeekend(day) ? 'text-gray-400 bg-gray-100' : 'text-gray-500'
                      }`}
                      style={{ minWidth: `${COL_WIDTH}px`, width: `${COL_WIDTH}px` }}
                    >
                      {format(day, 'd')}
                    </th>
                  ))}
                </tr>
                {/* 月ラベル行 */}
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="sticky left-0 z-10 bg-gray-50 border-r border-gray-200 px-4 py-1 text-xs text-gray-400">
                    期間
                  </td>
                  {days.map((day, i) => (
                    <td
                      key={i}
                      className={`text-center text-xs border-r border-gray-100 py-1 ${
                        isWeekend(day) ? 'bg-gray-100' : ''
                      }`}
                    >
                      {day.getDate() === 1 && (
                        <span className="text-indigo-600 font-semibold">
                          {format(day, 'M月', { locale: ja })}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {taskRows.map(task => (
                  <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                    {/* タスク名 */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-r border-gray-200 px-4 py-2 min-w-52">
                      <button
                        onClick={() => openModal(task)}
                        className="text-sm text-gray-700 hover:text-indigo-600 text-left truncate max-w-44 block"
                      >
                        {task.title}
                      </button>
                    </td>
                    {/* ガントバー */}
                    <td
                      colSpan={days.length}
                      className="relative py-2"
                      style={{ minWidth: `${days.length * COL_WIDTH}px` }}
                    >
                      {/* 今日ライン */}
                      {todayOffset >= 0 && todayOffset < days.length && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10 pointer-events-none"
                          style={{ left: `${todayOffset * COL_WIDTH + COL_WIDTH / 2}px` }}
                        />
                      )}
                      {/* バー */}
                      <div
                        className={`absolute top-1.5 bottom-1.5 rounded ${PRIORITY_COLORS[task.priority] ?? 'bg-indigo-500'} opacity-80 hover:opacity-100 cursor-pointer transition-opacity flex items-center px-2`}
                        style={getBarStyle(task)}
                        onClick={() => openModal(task)}
                        title={task.title}
                      >
                        <span className="text-white text-xs truncate font-medium">{task.title}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {tasks.length > 0 && taskRows.length < tasks.length && (
        <p className="text-xs text-gray-400 mt-3 text-center">
          ※ 開始日・終了日が未設定のタスク {tasks.length - taskRows.length} 件は非表示です
        </p>
      )}
    </div>
  )
}
