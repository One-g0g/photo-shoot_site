export function useSidebar() {
  const isOpen = useState('mobile-sidebar-open', () => false)
  const { lock, unlock } = useScrollLock()

  function open() {
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  function toggle() {
    isOpen.value = !isOpen.value
  }

  if (import.meta.client) {
    watch(isOpen, (open) => {
      if (open) {
        lock()
      } else {
        unlock()
      }
    })
  }

  return { isOpen, open, close, toggle }
}
