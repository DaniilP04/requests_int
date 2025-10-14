<template>
    <main class='bg_custom min-h-screen items-center z-10 flex flex-col justify-center'>
      <div class="div_request m-5 h-2/6 max-sm:h-5/6">
        <p class="mt-5 font-bold text-gray-900 mb-5">Проверить статус заявки</p>
        <form @submit.prevent='trackRequest'>
          <div class="mb-5">
            <input  type="text" id="track_id" placeholder='Введите трек-номер (12 символов)' 
            class="input_request" v-model="track" maxlength="12">
          </div>
          <div class="mb-5">
            <input type="text" id="password" placeholder='Введите пароль (8 символов)' 
            class="input_request" v-model="password" maxlength="8">
          </div>
          <button class="button" type="submit">Отследить</button>
        </form>
          <p :class="statusResult === 'выполнен' ? 'text-green-500 font-semibold' : statusResult?.toLowerCase().includes('отклонен') ? 'text-center text-red-500 font-semibold mb-5' : 'text-gray-900 mb-5'">
            Ваш заказ {{ statusResult }}
          </p>
          <p v-if="statusResult === 'выполнен'" class="text-center text-green-500 text-sm mt-1 mb-5">Забрать его можно по адресу ул. Карима Сутюшева 53 в будние дни с 09:00 до 18:00</p>
      </div>
    </main>
</template>

<script setup lang='ts'>

import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from '#imports'

// Инициализация reCAPTCHA
const recaptchaLoaded = ref(false)
const recaptchaToken = ref('')
const siteKey = useRuntimeConfig().public.recaptchaSiteKey

// Загрузка reCAPTCHA
const loadRecaptcha = async () => {
  return new Promise<void>((resolve) => {
    if (window.grecaptcha) {
      recaptchaLoaded.value = true
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.defer = true
    script.onload = () => {
      recaptchaLoaded.value = true
      resolve()
    }
    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script')
      resolve()
    }
    document.head.appendChild(script)
  })
}

// Получение токена
const executeRecaptcha = async (action: string) => {
  try {
    if (!recaptchaLoaded.value) {
      await loadRecaptcha()
    }
    
    return new Promise<string>((resolve, reject) => {
      if (!window.grecaptcha) {
        reject(new Error('reCAPTCHA not loaded'))
        return
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha.execute(siteKey, { action })
          .then(token => {
            recaptchaToken.value = token
            resolve(token)
          })
          .catch(reject)
      })
    })
  } catch (error) {
    console.error('reCAPTCHA error:', error)
    throw error
  }
}

// Инициализация при загрузке
onMounted(async () => {
  await loadRecaptcha()
})


// Механизм проверки по трек номеру 
const track = ref<string>('')
const statusResult = ref<string | null>(null)
const trackRequest = async () => {
  // Проверка заполнения данных
  if (!track.value || !password.value) {
    alert('Введите трек-номер и пароль')
    return
  }

  if (track.value.length !== 12 || password.value.length !== 8) {
    alert('Некорректная длина трек-номера или пароля')
    return
  }

  // Механизм проверки
  try {
    // Токен для капчи
    const token = await executeRecaptcha('track_request')

    // Обращение к эндпоинту
    const res = await $fetch('/api/track-status', {
      method: 'POST',
      body: {
        track_id: track.value,
        password: password.value,
        token
      }
    })

    statusResult.value = res.status
  } catch (error) {
    statusResult.value = 'Заявка не найдена'
  }
}


</script>