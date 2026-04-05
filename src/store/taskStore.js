import { create } from 'zustand'

export const useTaskStore = create((set) => ({
  isModalOpen: false,
  editingTask: null,
  filterStatus: 'all',
  filterPriority: 'all',
  searchQuery: '',

  openModal: (task = null) => set({ isModalOpen: true, editingTask: task }),
  closeModal: () => set({ isModalOpen: false, editingTask: null }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
