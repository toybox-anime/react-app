import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateTask, useUpdateTask } from '../hooks/useTasks'
import { useTaskStore } from '../store/taskStore'

const defaultValues = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  start_date: '',
  end_date: '',
}

export default function TaskForm() {
  const { editingTask, closeModal } = useTaskStore()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues,
  })

  useEffect(() => {
    if (editingTask) {
      reset({
        title: editingTask.title ?? '',
        description: editingTask.description ?? '',
        priority: editingTask.priority ?? 'medium',
        status: editingTask.status ?? 'todo',
        start_date: editingTask.start_date ?? '',
        end_date: editingTask.end_date ?? '',
      })
    } else {
      reset(defaultValues)
    }
  }, [editingTask, reset])

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
    }
    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, ...payload })
    } else {
      await createTask.mutateAsync(payload)
    }
    closeModal()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* タイトル */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          {...register('title', { required: 'タイトルは必須です' })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="タスクのタイトル"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      {/* 説明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          placeholder="タスクの詳細を入力（任意）"
        />
      </div>

      {/* 優先度・ステータス */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">優先度</label>
          <select
            {...register('priority')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
          <select
            {...register('status')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="todo">未着手</option>
            <option value="in_progress">進行中</option>
            <option value="done">完了</option>
          </select>
        </div>
      </div>

      {/* 開始日・終了日 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
          <input
            type="date"
            {...register('start_date')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
          <input
            type="date"
            {...register('end_date')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* ボタン */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={closeModal}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? '保存中...' : editingTask ? '更新する' : '作成する'}
        </button>
      </div>
    </form>
  )
}
