export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig()

  // /login всегда открыт
  if (to.path === '/login') return

  // 🛡️ Применять только к маршрутам, начинающимся с /admin
  if (!to.path.startsWith('/admin')) return

  // Серверная проверка токена
  if (process.server) {
    const event = useRequestEvent()
    const { getCookie } = await import('h3')
    const { verify } = await import('jsonwebtoken')

    const token = getCookie(event, 'auth')
    if (!token) {
      console.warn('[middleware] SSR: Токен отсутствует')
      return navigateTo('/login')
    }

    try {
      verify(token, config.JWT_SECRET)
    } catch (err) {
      console.warn('[middleware] SSR: Невалидный JWT:', err)
      return navigateTo('/login')
    }
  }

  // ⚠️ клиентская проверка не нужна
})
