// server/middleware/auth.ts
import jwt from 'jsonwebtoken'
import { getCookie, sendRedirect } from 'h3'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const secret = config.JWT_SECRET as string

  // Применяем только к /admin
  const url = getRequestURL(event)
  if (!/^\/admin(\/|$)/.test(url.pathname)) return

  const token = getCookie(event, 'auth')
  if (!token || !secret) return sendRedirect(event, '/login')

  try {
    const payload = jwt.verify(token, secret)
    event.context.user = payload
  } catch {
    return sendRedirect(event, '/login')
  }
})
