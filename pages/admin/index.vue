<template>
    <header class="bg_custom header_custom">
    <div class="max-w-7xl mx-auto flex justify-between items-center px-4 py-8">
      <nav class="transition-all duration-300 sm:flex sm:items-center sm:space-x-8">
        <button @click="logout" class="text-gray-900 font-bold">Выйти</button>
      </nav> 
    </div>
  </header>
  <main class="bg_custom min-h-screen items-center z-10 h-full w-full flex flex-col justify-center">
    <form class="max-w-sm mx-auto mb-5 mt-20">
      <label for="tables" class="block mb-2 text-sm font-medium text-gray-900 text-center">Выберите таблицу</label>
      <select id="tables" v-model="selectus" class="bg-gray-50 border border-gray-900 text-gray-900 text-sm rounded-lg block w-full p-2.5">
        <option value="DataTable" selected>Заявки</option>
        <option value="SchoolsTable">Учебные заведения</option>
        <option value="DeletedTable">Удалённые заявки</option>
        <option value="AdminsTable" v-if="me?.is_super">Пользователи (супер)</option>
      </select>
    </form>


    <div class="flex" v-if = "selectus == 'DataTable'">
    <DataTable :requests="requests" @deleted="handleDeletedRequest" />
    </div>

    <div class="flex" v-if = "selectus == 'SchoolsTable'">
    <SchoolsTable :schools="schools"/>
    </div>

    <div class="flex" v-if = "selectus == 'DeletedTable'">
    <DeletedTable :requests="deletedRequests" @restored="handleRestoreRequest" />
    </div>

    <div class="flex" v-if="selectus === 'AdminsTable' && me?.is_super">
    <AdminsTable />
    </div>


  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const router = useRouter()

async function logout() {
  await $fetch('/api/logout', { method: 'POST' })
  await navigateTo('/') 
} 

const requests = ref([])
const deletedRequests = ref([])
const schools = ref([])

async function fetchRequests() {
  try {
    const response = await $fetch('/api/all-requests')
    requests.value = response.requests
  } catch (error) {
    console.error('Ошибка загрузки заявок:', error)
  }
}

async function fetchSchools() {
  try {
    const response = await $fetch('/api/all-schools')
    schools.value = response.schools
  } catch (error) {
    console.error('Ошибка загрузки школ:', error)
  }
}

async function fetchDeletedRequests() {
  try {
    const response = await $fetch('/api/deleted-requests')
    deletedRequests.value = response.requests
  } catch (error) {
    console.error('Ошибка загрузки удалённых заявок:', error)
  }
}

onMounted(() => {
  fetchRequests()
  fetchSchools()
  fetchDeletedRequests()
})

const selectus = ref<string>('DataTable')
//Обработчики синхронизации между списками заявок и удалённых заявок
// Удаление: перенос из обычных заявок в удалённые
function handleDeletedRequest(deletedRequest) {
  // Удаляем из активных заявок
  requests.value = requests.value.filter(r => r.track_id !== deletedRequest.track_id)

  // Добавляем в удалённые, если ещё нет
  const exists = deletedRequests.value.some(r => r.track_id === deletedRequest.track_id)
  if (!exists) {
    deletedRequests.value.unshift(deletedRequest)
  }
}

// Восстановление: перенос обратно в активные заявки
function handleRestoreRequest(restoredRequest) {
  // Удаляем из удалённых
  deletedRequests.value = deletedRequests.value.filter(r => r.track_id !== restoredRequest.track_id)

  // Добавляем в активные, если ещё нет
  const exists = requests.value.some(r => r.track_id === restoredRequest.track_id)
  if (!exists) {
    requests.value.unshift(restoredRequest)
  }
}

import AdminsTable from '~/components/AdminsTable.vue'
const me = ref<{ id:number; username:string; is_super:boolean } | null>(null)

onMounted(async () => {
  try { me.value = (await $fetch('/api/me')).user } catch {}
  fetchRequests()
  fetchSchools()
  fetchDeletedRequests()
})



</script>
