import type { Work } from '~/api/works'

export function useAddWorkModal() {
  const isOpen = useState('photo-shoot-add-work-modal', () => false)
  const createdWork = useState<Work | null>('photo-shoot-add-work-created', () => null)

  function openAddWorkModal() {
    isOpen.value = true
  }

  function notifyWorkCreated(work: Work) {
    createdWork.value = work
  }

  function clearCreatedWork() {
    createdWork.value = null
  }

  return {
    isOpen,
    createdWork,
    openAddWorkModal,
    notifyWorkCreated,
    clearCreatedWork,
  }
}
