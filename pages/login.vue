<template>
  <main>
  <div class="min-h-screen flex flex-col items-center justify-center">
    <h1 class="text-2xl font-bold mb-4">Войдите в админ-панель</h1>
    <form @submit.prevent="login" class=" p-4 rounded  w-80">
  <input v-model="username" type="text" placeholder="Username" class="input mb-2 w-full border px-2 py-1" />
  <input v-model="password" type="password" placeholder="Password" class="input mb-2 w-full border px-2 py-1" />
  <button type="submit" class="bg-gray-800 rounded-xl active:scale-95 transition-transform hover:bg-gray-700 text-white w-full px-4 py-2">Войти</button>
  <p v-if="error" class="text-red-600 text-sm mt-2 text-center">
  {{ error }}
</p>
</form>
  </div>
  </main>
</template>

<script setup lang="ts">
const username = ref('')
const password = ref('')
const error = ref('')

async function login() {
  error.value = ''
  try {
    await $fetch('/api/login', {
      method: 'POST',
      body: {
        username: username.value,
        password: password.value
      }
    })

    // ⚠️ Критично — нужна полная перезагрузка, чтобы SSR "увидел" куку
    window.location.href = '/admin'
  } catch (err: any) {
    if (err?.status === 429) {
      error.value = 'Слишком много попыток входа. Подождите 5 минут.'
    } else {
      error.value = err?.data?.message || 'Login failed'
    }
  }
}

</script>