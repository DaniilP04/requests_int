<script setup lang="ts">
type ChatMessage = {
  role: 'user' | 'model'
  text: string
}

type GeminiPart = {
  text: string
}

type GeminiContent = {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
}

const systemPrompt = `You are an assistant consultant at Integro. 
Their office is located in Petropavlovsk: K. Sutyusheva 53, and their phone number is +7 7152 50 09 19.
You manufacture access control devices for schoolchildren and college students. 
You produce three types of devices: a card, a bracelet, and a key fob.
If you don't know how to answer a question, recommend calling +7 7152 50 09 19 during business hours, 9:00 AM–6:00 PM, Monday through Friday.
Be sure to be polite.`;

const isOpen = ref(false)
const message = ref('')
const isLoading = ref(false)
const errorText = ref('')

const messages = ref<ChatMessage[]>([
  {
    role: 'model',
    text: 'Здравствуйте! Я ИИ помощник компании. Могу ответить на часто задаваемые вопросы.',
  },
])

const chatHistory = ref<GeminiContent[]>([
  {
    role: 'model',
    parts: [{ text: systemPrompt }],
  },
])

const canSend = computed(() => message.value.trim().length > 0 && !isLoading.value)

const toggleChat = () => {
  isOpen.value = !isOpen.value
  errorText.value = ''
}

const closeChat = () => {
  isOpen.value = false
}

const formatBotText = (text: string) => {
  return text.replace(/\*\*(.*?)\*\*/g, '$1').trim()
}

const generateBotResponse = async (userMessage: string) => {
  chatHistory.value.push({
    role: 'user',
    parts: [
      {
        text: `Using the company details provided above, please address this query: ${userMessage}`,
      },
    ],
  })

  const data = await $fetch<GeminiResponse>('/api/chat', {
    method: 'POST',
    body: {
      contents: chatHistory.value,
    },
  })

  const apiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!apiResponseText) {
    throw new Error('Бот вернул пустой ответ.')
  }

  const botText = formatBotText(apiResponseText)

  chatHistory.value.push({
    role: 'model',
    parts: [{ text: botText }],
  })

  messages.value.push({
    role: 'model',
    text: botText,
  })
}

const sendMessage = async () => {
  const userMessage = message.value.trim()

  if (!userMessage || isLoading.value) return

  messages.value.push({
    role: 'user',
    text: userMessage,
  })

  message.value = ''
  errorText.value = ''
  isLoading.value = true

  try {
    await generateBotResponse(userMessage)
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : 'Произошла ошибка при отправке сообщения.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <section class="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 max-sm:bottom-4 max-sm:right-4">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-3 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-3 opacity-0"
    >
      <div
        v-if="isOpen"
        class="flex h-[520px] w-[360px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
      >
        <header class="flex items-center justify-between bg-[#1d64d6] px-4 py-3 text-white">
          <div>
            <p class="text-sm font-semibold leading-5">Чат с ассистентом</p>
          </div>

          <button
            type="button"
            class="grid h-8 w-8 place-items-center rounded-full text-xl leading-none text-slate-200 transition hover:bg-white/10 hover:text-white"
            aria-label="Закрыть чат"
            @click="closeChat"
          >
            ×
          </button>
        </header>

        <div class="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
          <div
            v-for="(chatMessage, index) in messages"
            :key="`${chatMessage.role}-${index}`"
            class="flex"
            :class="chatMessage.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <p
              class="max-w-[82%] whitespace-pre-line break-words rounded-lg px-3 py-2 text-sm leading-5 shadow-sm"
              :class="
                chatMessage.role === 'user'
                  ? 'bg-[#3FB1F3] text-white'
                  : 'border border-slate-200 bg-white text-slate-800'
              "
            >
              {{ chatMessage.text }}
            </p>
          </div>

          <div v-if="isLoading" class="flex justify-start">
            <p class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
              Бот печатает...
            </p>
          </div>
        </div>

        <div class="border-t border-slate-200 bg-white p-3">
          <p v-if="errorText" class="mb-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            {{ errorText }}
          </p>

          <form class="flex items-end gap-2" @submit.prevent="sendMessage">
            <textarea
              v-model="message"
              rows="1"
              class="max-h-28 min-h-11 flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#3FB1F3] focus:ring-2 focus:ring-[#3FB1F3]/20"
              placeholder="Напишите вопрос..."
              @keydown.enter.exact.prevent="sendMessage"
            />

            <button
              type="submit"
              class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#3FB1F3] text-white transition hover:bg-[#318fc6] active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:active:scale-100"
              :disabled="!canSend"
              aria-label="Отправить сообщение"
            >
              <span class="text-lg leading-none">➤</span>
            </button>
          </form>
        </div>
      </div>
    </Transition>

    <button
      type="button"
      class="grid h-14 w-14 place-items-center rounded-full bg-[#3FB1F3] text-white shadow-xl transition hover:bg-[#318fc6] active:scale-95"
      :aria-label="isOpen ? 'Закрыть чат' : 'Открыть чат'"
      @click="toggleChat"
    >
      <span v-if="!isOpen" class="text-2xl leading-none">?</span>
      <span v-else class="text-3xl leading-none">×</span>
    </button>
  </section>
</template>
