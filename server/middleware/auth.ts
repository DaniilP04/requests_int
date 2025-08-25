// server/middleware/auth.ts
import { getCookie, sendRedirect } from 'h3'
import jwt from 'jsonwebtoken'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  // 🛡 Применяется ТОЛЬКО к /admin и вложенным маршрутам
  if (!/^\/admin(\/|$)/.test(url.pathname)) return

  const token = getCookie(event, 'auth')
  const secret = process.env.JWT_SECRET

  if (!token || !secret) {
    return sendRedirect(event, '/login')
  }

  try {
    const payload = jwt.verify(token, secret)
    event.context.user = payload
  } catch (err) {
    console.warn('Invalid JWT in server middleware:', err)
    return sendRedirect(event, '/login')
  }
})
