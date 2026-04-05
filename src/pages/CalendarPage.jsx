import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import jaLocale from '@fullcalendar/core/locales/ja'
import { useTasks } from '../hooks/useTasks'
import { useTaskStore } from '../store/taskStore'

const PRIORITY_COLORS = {
  high:   '#ef4444',
  medium: '#f59e0b',
  low:    '#22c55e',
}

export default function CalendarPage() {
  const { data: tasks = [] } = useTasks()
  const { openModal } = useTaskStore()

  const events = tasks
    .filter(t => t.start_date || t.end_date)
    .map(task => ({
      id: task.id,
      title: task.title,
      start: task.start_date ?? task.end_date,
      end: task.end_date ?? task.start_date,
      backgroundColor: PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.medium,
      borderColor: PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS.medium,
      extendedProps: { task },
    }))

  const handleEventClick = ({ event }) => {
    openModal(event.extendedProps.task)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">カレンダー</h1>
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

      {/* 凡例 */}
      <div className="flex gap-4 mb-4">
        {[['high', '高優先度', '#ef4444'], ['medium', '中優先度', '#f59e0b'], ['low', '低優先度', '#22c55e']].map(([key, label, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          locale={jaLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,listWeek',
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
        />
      </div>
    </div>
  )
}
