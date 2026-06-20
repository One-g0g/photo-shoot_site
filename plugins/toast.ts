import { useToast } from '~/composables/useToast'

export default defineNuxtPlugin(() => {
    const api = useToast()
    return {
        provide: {
            toast: api
        }
    }
})

declare module '#app' {
    interface NuxtApp {
        $toast: ReturnType<typeof useToast>
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $toast: ReturnType<typeof useToast>
    }
}


