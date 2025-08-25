import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { track_id, password, token } = body

  // Валидация ввода
  if (!track_id || !password || !token) {
    throw createError({ statusCode: 400, statusMessage: 'Missing data' })
  }

  // Проверка капчи
  const secretKey = useRuntimeConfig().recaptchaSecretKey

  const recaptchaRes = await $fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: secretKey,
      response: token
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  // Лог для проверки капчи
  console.log('Ответ от reCAPTCHA API:', {
      success: recaptchaRes.success,
      score: recaptchaRes.score,
      action: recaptchaRes.action,
      hostname: recaptchaRes.hostname,
      challenge_ts: recaptchaRes.challenge_ts,
      errorCodes: recaptchaRes['error-codes'] || []
    })

    if (!recaptchaRes.success || recaptchaRes.score < 0.7) { 
      throw createError({ statusCode: 403, statusMessage: 'Не прошел reCAPTCHA' })
    }

    if (recaptchaRes.action !== 'track_request') { 
      throw createError({ statusCode: 403, statusMessage: 'Invalid action' })
    }

  // Поиск заявки
  const request = await prisma.requests.findFirst({
    where: {
      track_id,
      password
    }
  })

  if (!request) {
    throw createError({ statusCode: 404, statusMessage: 'Request not found' })
  }

  return {
    status: request.status
  }
})
