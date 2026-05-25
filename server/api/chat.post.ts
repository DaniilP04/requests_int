type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

type LegacyContent = {
  role?: string
  parts?: { text?: string }[]
}

type ChatBody = {
  messages?: Message[]
  contents?: LegacyContent[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<ChatBody>(event)

  if (!config.GROQ_API_KEY) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Groq API key is not configured.',
    })
  }

  const messages = Array.isArray(body.messages)
    ? body.messages
    : body.contents?.map((content) => ({
        role: content.role === 'model' ? 'assistant' : (content.role as Message['role']),
        content: content.parts?.map((part) => part.text ?? '').join('') ?? '',
      }))

  const validMessages = messages?.filter((message): message is Message => {
    return (
      ['user', 'assistant', 'system'].includes(message.role) &&
      typeof message.content === 'string' &&
      message.content.trim().length > 0
    )
  })

  if (!validMessages?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Chat history is required.',
    })
  }

  try {
    return await $fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.GROQ_API_KEY}`,
      },
      body: {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: validMessages,
        temperature: 0.4,
        max_completion_tokens: 700,
      },
    })
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode ?? 502,
      statusMessage: error?.data?.error?.message ?? error?.message ?? 'Groq request failed.',
    })
  }
})
