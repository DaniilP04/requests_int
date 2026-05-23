type GeminiPart = {
  text?: string
}

type GeminiContent = {
  role?: 'user' | 'model'
  parts?: GeminiPart[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<{ contents?: GeminiContent[] }>(event)

  if (!config.GEMINI_API_KEY) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Gemini API key is not configured.',
    })
  }

  if (!Array.isArray(body.contents) || body.contents.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Chat history is required.',
    })
  }

  const contents = body.contents.map((content) => ({
    role: content.role,
    parts: content.parts?.map((part) => ({
      text: part.text,
    })),
  }))

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${config.GEMINI_API_KEY}`

  return await $fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { contents },
  })
})
