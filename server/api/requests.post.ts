import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = body.token
  const secretKey = useRuntimeConfig().recaptchaSecretKey

  //reCAPTCHA
  interface RecaptchaResponse {
    success: boolean
    score: number
    action: string
    challenge_ts: string
    hostname: string
  }

  const res = await $fetch<RecaptchaResponse>('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: new URLSearchParams({
      secret: secretKey,
      response: token
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

  console.log('Google reCAPTCHA verification response:', res)

  if (!res.success || res.score < 0.5) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Не прошел reCAPTCHA'
    })
  }

  console.log('reCAPTCHA verification:', {
  success: res.success,
  score: res.score,
  action: res.action,
  hostname: res.hostname
})

  // Проверка на дубликат
  const existingRequest = await prisma.requests.findFirst({
    where: {
      full_name: body.full_name,
      school: body.school,
      device_type: body.device_type,
      status: 'В обработке',
    }
  })

  if (existingRequest) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Ваша заявка уже подана и находится в обработке. Если забыли трек-номер и пароль - обратитесь в поддержку.'
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

  return {
    user: request
  }
})