export default defineNuxtPlugin(async () => {
  const { restoreSession } = useUser()
  await restoreSession()
})
