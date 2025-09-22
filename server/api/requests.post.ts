import { readBody, createError } from 'h3'
import { prisma } from '~/server/utils/db'

interface RecaptchaResponse {
  success: boolean
  score?: number
  action?: string
  challenge_ts?: string
  hostname?: string
  'error-codes'?: string[]
}

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig()
  const body = await readBody(event)

  const token = body?.token as string | undefined
  if (!token) throw createError({ statusCode: 400, statusMessage: 'No reCAPTCHA token' })

  const devBypass = process.env.NODE_ENV === 'development' || process.env.RECAPTCHA_BYPASS === '1'
  let res: RecaptchaResponse = { success: true, score: 1 }

  if (!devBypass) {
    const secret = cfg.RECAPTCHA_SECRET_KEY as string
    if (!secret) throw createError({ statusCode: 500, statusMessage: 'reCAPTCHA secret not set' })

    res = await $fetch<RecaptchaResponse>('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })

  //   console.log('reCAPTCHA verify:', res)
  // } else {
  //   console.log('reCAPTCHA bypass (dev)')
  }

  const minScore = process.env.NODE_ENV === 'production' ? 0.5 : 0.1
  if (!res.success || (res.score ?? 0) < minScore) {
    throw createError({ statusCode: 403, statusMessage: 'reCAPTCHA' })
  }

  // Проверка дубликатов — убедись в едином статусе
  const existing = await prisma.requests.findFirst({
    where: {
      full_name: body.full_name,
      school: body.school,
      device_type: body.device_type,
      status: 'Принято' // или 'В обработке' — выбери единый статус везде
    }
  })
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Заявка уже подана и находится в обработке.'
    })
  }

  const request = await prisma.requests.create({
    data: {
      full_name: body.full_name,
      school: body.school,
      class: body.class,
      device_type: body.device_type,
      source: 'Сайт'
    }
  })

  return { user: request }
})
