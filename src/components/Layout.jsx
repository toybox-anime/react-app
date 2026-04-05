import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TaskModal from './TaskModal'
import { useTaskStore } from '../store/taskStore'

export default function Layout() {
  const { isModalOpen, openModal } = useTaskStore()

  // N キーで新規タスク作成
  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName
      if (
        e.key === 'n' &&
        !isModalOpen &&
        tag !== 'INPUT' &&
        tag !== 'TEXTAREA' &&
        tag !== 'SELECT'
      ) {
        openModal()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isModalOpen, openModal])

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
      <TaskModal />
    </div>
  )
}
