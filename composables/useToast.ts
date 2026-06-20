import type { Component } from 'vue'
import { markRaw } from 'vue'

export type ToastKind = 'success' | 'error' | 'warning' | 'info'

export interface AppToast {
    id: number
    message: string
    subtext?: string
    color?: string
    timeout: number
    progress: number
    startTime: number
    iconComponent?: Component
}

export interface ShowToastOptions {
    message: string
    subtext?: string
    color?: string
    timeout?: number
    iconComponent?: Component
}

// Default icons for convenience
import SuccessIcon from '@/assets/icons/toast/ToastSuccess.svg?component'
import ErrorIcon from '@/assets/icons/toast/ToastError.svg?component'
import WarningIcon from '@/assets/icons/toast/ToastWarning.svg?component'
import InfoIcon from '@/assets/icons/toast/ToastInfo.svg?component'

export function useToast() {
    const toasts = useState<AppToast[]>('app_toasts', () => [])

    function remove(id: number) {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    function clear() {
        toasts.value = []
    }

    function show(options: ShowToastOptions): number {
        const id = Date.now() + Math.floor(Math.random() * 1000)
        const now = Date.now()
        const toast: AppToast = {
            id,
            message: options.message,
            subtext: options.subtext,
            color: options.color ?? '#FFFFFF',
            timeout: options.timeout ?? 5000,
            progress: 100,
            startTime: now,
            iconComponent: options.iconComponent,
        }
        toasts.value = [toast, ...toasts.value]
        return id
    }

    function success(message: string, subtext?: string, timeout = 5000) {
        return show({ message, subtext, timeout, color: 'var(--success-text)', iconComponent: markRaw(SuccessIcon) as Component })
    }

    function error(message: string, subtext?: string, timeout = 5000) {
        return show({ message, subtext, timeout, color: 'var(--error-text)', iconComponent: markRaw(ErrorIcon) as Component })
    }

    function warning(message: string, subtext?: string, timeout = 5000) {
        return show({ message, subtext, timeout, color: 'var(--warning-color)', iconComponent: markRaw(WarningIcon) as Component })
    }

    function info(message: string, subtext?: string, timeout = 5000) {
        return show({ message, subtext, timeout, color: 'var(--accent-color)', iconComponent: markRaw(InfoIcon) as Component })
    }

    // Функции для постоянных тостов (без таймаута)
    function successPersistent(message: string, subtext?: string) {
        return show({ message, subtext, timeout: 0, color: 'var(--success-text)', iconComponent: markRaw(SuccessIcon) as Component })
    }

    function errorPersistent(message: string, subtext?: string) {
        return show({ message, subtext, timeout: 0, color: 'var(--error-text)', iconComponent: markRaw(ErrorIcon) as Component })
    }

    function warningPersistent(message: string, subtext?: string) {
        return show({ message, subtext, timeout: 0, color: 'var(--warning-color)', iconComponent: markRaw(WarningIcon) as Component })
    }

    function infoPersistent(message: string, subtext?: string) {
        return show({ message, subtext, timeout: 0, color: 'var(--accent-color)', iconComponent: markRaw(InfoIcon) as Component })
    }

    return { toasts, show, success, error, warning, info, successPersistent, errorPersistent, warningPersistent, infoPersistent, remove, clear }
}

export type UseToastReturn = ReturnType<typeof useToast>


