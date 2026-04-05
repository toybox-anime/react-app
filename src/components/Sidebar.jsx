import { NavLink } from 'react-router-dom'
import { useTasks } from '../hooks/useTasks'

const navItems = [
  {
    to: '/dashboard',
    label: 'ダッシュボード',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/tasks',
    label: 'タスク一覧',
    badge: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/calendar',
    label: 'カレンダー',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/gantt',
    label: 'ガントチャート',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

export default function Sidebar() {
  const { data: tasks = [] } = useTasks()
  const activeTasks = tasks.filter(t => t.status !== 'done').length

  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      {/* ロゴ */}
      <div className="px-6 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-base tracking-tight">TaskFlow</span>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="flex items-center gap-3">
              {icon}
              {label}
            </span>
            {badge && activeTasks > 0 && (
              <span className="bg-indigo-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                {activeTasks > 99 ? '99+' : activeTasks}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* キーボードショートカットヒント */}
      <div className="px-4 py-3 border-t border-gray-700">
        <p className="text-xs text-gray-500 mb-1">ショートカット</p>
        <p className="text-xs text-gray-600">
          <kbd className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-xs">N</kbd>
          {' '}新規タスク
        </p>
      </div>

      <div className="px-6 py-3 border-t border-gray-700">
        <p className="text-xs text-gray-500">TaskFlow v1.0</p>
      </div>
    </aside>
  )
}
