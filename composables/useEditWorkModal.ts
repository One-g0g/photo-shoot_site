import type { Work } from '~/api/works'

export function useEditWorkModal() {
  const isOpen = useState('photo-shoot-edit-work-modal', () => false)
  const editingWork = useState<Work | null>('photo-shoot-edit-work-target', () => null)
  const updatedWork = useState<Work | null>('photo-shoot-edit-work-updated', () => null)

  function openEditWorkModal(work: Work) {
    editingWork.value = work
    isOpen.value = true
  }

  function notifyWorkUpdated(work: Work) {
    updatedWork.value = work
  }

  function clearUpdatedWork() {
    updatedWork.value = null
  }

  function closeEditWorkModal() {
    isOpen.value = false
    editingWork.value = null
  }

  return {
    isOpen,
    editingWork,
    updatedWork,
    openEditWorkModal,
    closeEditWorkModal,
    notifyWorkUpdated,
    clearUpdatedWork,
  }
}
