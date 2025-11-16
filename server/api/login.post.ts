import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { readBody, setCookie, createError } from 'h3'
import { prisma } from '~/server/utils/db'

// 🔒 Brute-force защита
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  if (!config.JWT_SECRET as string) throw createError({ statusCode: 500, message: 'JWT secret is not set' })

  // IP
  const ip =
    event.node.req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
    event.node.req.socket.remoteAddress ||
    'unknown'

  const now = Date.now()
  const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: now }

  if (now - attempt.lastAttempt > 5 * 60 * 1000) {
    attempt.count = 0
  }
  attempt.count++
  attempt.lastAttempt = now
  loginAttempts.set(ip, attempt)

  if (attempt.count > 5) {
    throw createError({ statusCode: 429, message: 'Слишком много попыток. Подождите 5 минут.' })
  }

  // Проверка логина/пароля
  const body = await readBody(event)
  const { username, password } = body || {}
  if (!username || !password) {
    throw createError({ statusCode: 400, message: 'Имя пользователя и пароль обязательны' })
  }

  const admin = await prisma.admin.findUnique({ where: { username }, select: { id: true, username: true, hashed_password: true, is_super: true } })
  if (!admin || !admin.hashed_password) {
    throw createError({ statusCode: 401, message: 'Неверный логин или пароль' })
  }

  const isMatch = await bcrypt.compare(password, admin.hashed_password)
  if (!isMatch) {
    throw createError({ statusCode: 401, message: 'Неверный логин или пароль' })
  }

  loginAttempts.delete(ip)

  const token = jwt.sign({ username: admin.username, is_super: admin.is_super}, config.JWT_SECRET as string, { expiresIn: '7d' })

  // Куки
  const isProd = process.env.NODE_ENV === 'production'
  setCookie(event, 'auth', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: isProd,
    sameSite: 'lax'
  })

  return { message: 'Logged in' }
})
