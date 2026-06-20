export default defineNuxtRouteMiddleware(() => {
  const { isLoggedIn } = useUser()

  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})
