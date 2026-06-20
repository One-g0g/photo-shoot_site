import { getApiErrorMessage } from '~/api/client'

const MAX_SIZE_BYTES = 2 * 1024 * 1024

export function useAvatarUpload(options?: { onSuccess?: () => void }) {
  const { user, userAvatar, uploadAvatar } = useUser()
  const { $toast } = useNuxtApp()
  const avatarInputRef = ref<HTMLInputElement | null>(null)
  const loading = ref(false)

  function openFilePicker() {
    if (loading.value) return
    avatarInputRef.value?.click()
  }

  async function onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    input.value = ''

    if (!file) return

    if (file.size > MAX_SIZE_BYTES) {
      $toast.error('Файл больше 2 МБ', 'Сожмите изображение или выберите другой файл')
      return
    }

    loading.value = true

    try {
      await uploadAvatar(file)
      $toast.success('Аватар обновлён', 'Фото отображается в шапке и личном кабинете')
      options?.onSuccess?.()
    } catch (error) {
      $toast.error(getApiErrorMessage(error), 'Не удалось загрузить — попробуйте другой файл')
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    userAvatar,
    avatarInputRef,
    loading,
    openFilePicker,
    onFileSelected,
  }
}
