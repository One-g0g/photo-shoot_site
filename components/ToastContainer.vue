<template>
    <div class="fixed inset-0 pointer-events-none z-[9990]" aria-live="polite" aria-atomic="true">
        <transition-group
            tag="div"
            class="absolute top-2 right-2 left-2 md:right-4 md:bottom-4 md:top-auto md:left-auto flex flex-col gap-3 w-auto md:w-[520px]"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            enter-active-class="transition-all duration-200"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
            leave-active-class="transition-all duration-150"
        >
            <div
                v-for="toast in toasts"
                :key="toast.id"
                class="pointer-events-auto shadow-md bg-[white] rounded-[12px] max-sm:rounded-[8px] py-[26px] px-[23px] max-sm:py-[16px] max-sm:px-[16px] flex items-center gap-6 max-md:gap-3 relative overflow-hidden"
                role="status"
            >
                <div class="z-[9990] w-24 h-24 rounded-full absolute -top-8 -left-8 blur-[120px]" :style="{ backgroundColor: toast.color }">

                </div>
                <div class="z-[9999] max-md:p-1 p-1.5 rounded-full border border-black/10 bg-white ">
                    <div class="text-current flex-shrink-0" :style="{ color: toast.color }">
                        <img
                            v-if="typeof toast.iconComponent === 'string'"
                            :src="toast.iconComponent"
                            alt=""
                            class="w-6 h-6 max-md:w-5 max-md:h-5"
                        >
                        <component
                            v-else-if="toast.iconComponent"
                            :is="toast.iconComponent"
                            class="w-6 h-6 max-md:w-5 max-md:h-5"
                        />
                    </div>
                </div>

                <div class="flex flex-col gap-1 flex-1 z-[9999]">
                    <div class="font-semibold leading-[1.2] text-[16px] max-sm:text-[14px]" :style="{ color: toast.color }">
                        {{ toast.message }}
                    </div>
                    <div v-if="toast.subtext" class="text-gray-600 text-[14px] max-sm:text-[14px] leading-[1.2]">
                        {{ toast.subtext }}
                    </div>
                </div>
                <button class="text-gray-400 text-[22px] bg-transparent border-0 cursor-pointer mb-auto" @click="remove(toast.id)">
                    <X class="w-4 h-4"/>
                </button>
                
                <!-- Progress bar -->
                <div 
                    class="absolute bottom-0 left-0 right-0 h-1.5 rounded-[16px] max-sm:rounded-[12px] dark:bg-[#131313] bg-[#ffffff] z-[9999]"
                >
                    <div 
                        class="h-full rounded-[16px] max-sm:rounded-[12px] transition-all duration-100 ease-linear"
                        :style="{ 
                            backgroundColor: toast.color || '#22C55E',
                            width: `${toast.progress || 100}%`,
                            minWidth: '1px'
                        }"
                    ></div>
                </div>
            </div>
        </transition-group>
    </div>
    
    
    
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import { onMounted, onUnmounted } from 'vue'
import { X } from '@lucide/vue'

const { toasts, remove } = useToast()

// Интервал для обновления прогресса
let progressInterval: ReturnType<typeof setInterval> | null = null

// Функция для обновления прогресса всех тостов
const updateProgress = () => {
    const now = Date.now()
    
    toasts.value.forEach((toast, index) => {
        if (!toast.startTime || toast.timeout <= 0) return

        const elapsed = now - toast.startTime
        const remaining = Math.max(0, toast.timeout - elapsed)
        const progress = (remaining / toast.timeout) * 100

        if (toasts.value[index]) {
            toasts.value[index].progress = Math.max(0, progress)
        }

        if (remaining <= 0) {
            remove(toast.id)
        }
    })
}

onMounted(() => {
    // Обновляем прогресс каждые 50ms для плавности
    progressInterval = setInterval(updateProgress, 50)
})

onUnmounted(() => {
    if (progressInterval) {
        clearInterval(progressInterval)
    }
})

// Примеры использования
// $toast.show({
//   message: 'Покупка 27 билетов',
//   subtext: 'за 27 000 SC',
//   color: '#22C55E',
//   iconComponent: TicketIcon,
//   timeout: 5000
// })

// Обычные тосты с прогресс-баром (5 секунд)
// $toast.error('Недостаточно фишек')                 // red
// $toast.success('Успех!')                           // green
// $toast.warning('Проверьте введенные данные')       // yellow
// $toast.info('Инфо')

// Постоянные тосты без прогресс-бара
// $toast.successPersistent('Сохранено успешно', 'Ваши изменения сохранены')
// $toast.errorPersistent('Ошибка', 'Что-то пошло не так') 
</script>

<style scoped>
/* Прогресс-бар управляется через setInterval */
</style>
 
