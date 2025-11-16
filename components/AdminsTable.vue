<template>
  <section class="w-full max-w-3xl mx-auto space-y-6">
    <h2 class="text-xl font-bold">Пользователи (админы)</h2>

    <!-- Добавить -->
    <form class="flex flex-wrap gap-2 items-end" @submit.prevent="createAdmin">
      <div class="grow">
        <label class="block text-sm">Логин</label>
        <input v-model="form.username" class="w-full border p-2 rounded" required />
      </div>
      <div class="grow">
        <label class="block text-sm">Пароль</label>
        <input v-model="form.password" type="password" class="w-full border p-2 rounded" required />
      </div>
      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="form.is_super" />
        <span class="text-sm">Супер</span>
      </label>
      <button class="border px-3 py-2 rounded font-semibold">Добавить</button>
    </form>

    <!-- Таблица -->
    <div class="overflow-x-auto">
      <table class="min-w-full text-sm border">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">ID</th>
            <th class="p-2 border">Логин</th>
            <th class="p-2 border">Супер</th>
            <th class="p-2 border">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in admins" :key="a.id">
            <td class="p-2 border">{{ a.id }}</td>
            <td class="p-2 border">{{ a.username }}</td>
            <td class="p-2 border">{{ a.is_super ? 'да' : 'нет' }}</td>
            <td class="p-2 border">
              <div class="flex gap-2 items-center">
                <input v-model="passwordEdits[a.id]" type="password" placeholder="Новый пароль" class="border p-1 rounded" />
                <button @click="changePassword(a.id)" class="border px-2 py-1 rounded">Сменить пароль</button>
                <button @click="toggleSuper(a.id)" class="border px-2 py-1 rounded">Перекл. супер</button>
                <button @click="deleteAdmin(a.id)" class="border px-2 py-1 rounded text-red-700" :disabled="me && me.id === a.id"
                :title="me && me.id === a.id ? 'Нельзя удалить самого себя' : 'Удалить пользователя'">Удалить</button>
              </div>
            </td>
          </tr>
          <tr v-if="admins.length===0">
            <td colspan="4" class="p-3 text-center text-gray-500">Нет пользователей</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="error" class="text-red-600">{{ error }}</p>
    <p v-if="success" class="text-green-600">{{ success }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

type AdminRow = { id: number; username: string; is_super: boolean; createdAt?: string }

const admins = ref<AdminRow[]>([])
const error = ref('')
const success = ref('')
const passwordEdits = ref<Record<number, string>>({})
const form = ref({ username: '', password: '', is_super: false })

async function load() {
  try {
    const r = await $fetch<{ admins: AdminRow[] }>('/api/_super/admins')
    admins.value = r.admins
  } catch (e: any) { error.value = e?.statusMessage || 'Ошибка загрузки' }
}

async function createAdmin() {
  try {
    await $fetch('/api/_super/admins', { method: 'POST', body: { ...form.value } })
    form.value = { username: '', password: '', is_super: false }
    await load()
  } catch (e: any) { error.value = e?.statusMessage || 'Ошибка создания' }
}


async function changePassword(id: number) {
  const newPassword = passwordEdits.value[id]
  if (!newPassword) return
  try {
    await $fetch('/api/_super/admins.password', {
      method: 'PUT',
      body: { id, newPassword }
    })
    passwordEdits.value[id] = ''
    error.value = ''
    success.value = `Пароль пользователя #${id} обновлён`
    setTimeout(() => (success.value = ''), 6000) 
  } catch (e: any) {
    success.value = ''
    error.value = e?.statusMessage || 'Ошибка смены пароля'
  }
}


async function toggleSuper(id: number) {
  try {
    await $fetch('/api/_super/admins.toggle-super', {
      method: 'PUT',
      body: { id }
    })
    await load()
  } catch (e: any) {
    error.value = e?.statusMessage || 'Ошибка переключения'
  }
}
const me = ref<{ id: number; username: string; is_super: boolean } | null>(null)

async function deleteAdmin(id: number) {
  if (!confirm(`Удалить пользователя #${id}?`)) return
  try {
    await $fetch('/api/_super/admins.remove', {
      method: 'DELETE',
      body: { id }
    })
    success.value = `Пользователь #${id} удалён`
    error.value = ''
    setTimeout(() => (success.value = ''), 3000)
    await load()
  } catch (e: any) {
    success.value = ''
    error.value = e?.statusMessage || 'Ошибка удаления'
  }
}

onMounted(async () => {
  try { me.value = (await $fetch('/api/me')).user } catch {}
  await load()
})

</script>
