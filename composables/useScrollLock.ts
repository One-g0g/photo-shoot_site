let lockCount = 0

let lastTouchY = 0

const SCROLLABLE_SELECTOR = '[data-scroll-lock-scroll], .sidebar-scroll'

const INTERACTIVE_SELECTOR =
  'button, a, [role="button"], input, textarea, select, label, .sidebar-link'

const EDGE_SCROLL_THRESHOLD_PX = 8

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return !!target.closest(INTERACTIVE_SELECTOR)
}

function findScrollable(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null

  const el = target.closest(SCROLLABLE_SELECTOR) as HTMLElement | null
  if (!el) return null

  const { overflowY } = window.getComputedStyle(el)
  if (overflowY !== 'auto' && overflowY !== 'scroll' && overflowY !== 'overlay') return null

  return el
}

function onTouchStart(event: TouchEvent) {
  lastTouchY = event.touches[0]?.clientY ?? 0
}

function onTouchMove(event: TouchEvent) {
  if (isInteractiveTarget(event.target)) {
    return
  }

  const scrollable = findScrollable(event.target)
  const currentY = event.touches[0]?.clientY ?? lastTouchY
  const deltaY = currentY - lastTouchY
  lastTouchY = currentY

  if (Math.abs(deltaY) < EDGE_SCROLL_THRESHOLD_PX) {
    return
  }

  if (!scrollable) {
    event.preventDefault()
    return
  }

  if (scrollable.scrollHeight <= scrollable.clientHeight) {
    return
  }

  const { scrollTop, scrollHeight, clientHeight } = scrollable
  const atTop = scrollTop <= 0
  const atBottom = scrollTop + clientHeight >= scrollHeight - 1

  if (deltaY > 0 && atTop) {
    event.preventDefault()
    return
  }

  if (deltaY < 0 && atBottom) {
    event.preventDefault()
  }
}

function lockBody() {
  document.documentElement.classList.add('scroll-locked')
  document.body.classList.add('scroll-locked')
  document.addEventListener('touchstart', onTouchStart, { passive: true })
  document.addEventListener('touchmove', onTouchMove, { passive: false })
}

function unlockBody() {
  document.documentElement.classList.remove('scroll-locked')
  document.body.classList.remove('scroll-locked')
  document.removeEventListener('touchstart', onTouchStart)
  document.removeEventListener('touchmove', onTouchMove)
}

export function useScrollLock() {
  function lock() {
    if (!import.meta.client) return

    lockCount++
    if (lockCount === 1) {
      lockBody()
    }
  }

  function unlock() {
    if (!import.meta.client) return
    if (lockCount <= 0) return

    lockCount--
    if (lockCount === 0) {
      unlockBody()
    }
  }

  return { lock, unlock }
}
