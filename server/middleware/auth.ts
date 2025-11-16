// server/middleware/auth.ts
import jwt from 'jsonwebtoken'
import { getCookie } from 'h3'

export default defineEventHandler((event) => {
  const { pathname } = getRequestURL(event)
  // нам нужен user для /admin и /api (без редиректов в API)
  if (!/^\/(admin|api)(\/|$)/.test(pathname)) return

  const secret = useRuntimeConfig().JWT_SECRET as string
  const token = getCookie(event, 'auth')
  if (!token || !secret) return

  try {
    const payload = jwt.verify(token, secret)
    ;(event as any).context.user = payload
  } catch {
    // просто не назначаем user — эндпоинты сами вернут 401, где нужно
  }
})
