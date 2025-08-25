import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { readBody, setCookie, getRequestURL, createError } from 'h3'

const SECRET = process.env.JWT_SECRET || 'supersecret'
const prisma = new PrismaClient()

// 🔒 Brute-force protection: хранилище попыток по IP
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export default defineEventHandler(async (event) => {
  // 🔒 Brute-force protection: извлечение IP-адреса пользователя
  const ip =
    event.node.req.headers['x-forwarded-for']?.toString() ||
    event.node.req.socket.remoteAddress ||
    'unknown'

  const now = Date.now()
  const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: now }

  // 🔒 Сброс счётчика, если прошло больше 5 минут
  if (now - attempt.lastAttempt > 5 * 60 * 1000) {
    attempt.count = 0
  }

  attempt.count++
  attempt.lastAttempt = now
  loginAttempts.set(ip, attempt)

  // 🔒 Блокировка, если более 5 попыток за 5 минут
  if (attempt.count > 5) {
    throw createError({
      statusCode: 429,
      message: 'Слишком много попыток. Подождите 5 минут.'
    })
  }

  try {
    // Получение и валидация данных из запроса
    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
      throw createError({ statusCode: 400, message: 'Имя пользователя и пароль обязательны' })
    }

    // Проверка на правильность 
    const admin = await prisma.admin.findUnique({ where: { username } })

    if (!admin || !admin.hashed_password) {
      throw createError({ statusCode: 401, message: 'Неверный логин или пароль' })
    }

    const isMatch = await bcrypt.compare(password, admin.hashed_password)
    if (!isMatch) {
      throw createError({ statusCode: 401, message: 'Неверный логин или пароль' })
    }

    // 🔒 Успешный вход — сбросить счётчик попыток
    loginAttempts.delete(ip)

    // Генерация JWT токена для безопасного сохранения сессия
    const token = jwt.sign(
      { username: admin.username }, 
      SECRET,                       
      { expiresIn: '1h' }           
    )

    // Сохранения токена в куки
    setCookie(event, 'auth', token, {
      httpOnly: false, // поменять на проде
      path: '/',
      maxAge: 60 * 60,
      secure: false, // важно для localhost! True потом нужно поставить
      sameSite: 'lax'
    })

    return { message: 'Logged in' }
  } catch (err) {
    console.error('Ошибка логина:', err)
    throw createError({ statusCode: 500, message: 'Неверный логин или пароль' })
  }
})
