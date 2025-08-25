export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = body.token
  const secretKey = useRuntimeConfig().recaptchaSecretKey

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
    },
    })

  console.log('Google reCAPTCHA verification response:', res)

    if (!res || !res.success || res.score < 0.5) {
  throw createError({
    statusCode: 403,
    statusMessage: 'Не прошел reCAPTCHA'
  })
    }

  return { success: true }
})