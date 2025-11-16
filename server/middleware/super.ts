// server/middleware/super.ts
export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)

  // запускаем проверку ТОЛЬКО для супер-роутов
  if (!pathname.startsWith('/api/_super')) return

  const user = (event as any).context.user
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  if (!user.is_super) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: super admin only' })
  }
})
