<template>
  <header class="bg_custom header_custom">
    <div class="max-w-7xl mx-auto flex justify-between items-center px-4 py-8">
      <nav class="transition-all duration-300 sm:flex sm:items-center sm:space-x-8">
        <button @click="logout" class="text-gray-900">Выйти</button>
      </nav>
    </div>
  </header>

  <main class="bg_custom min-h-screen items-center z-10 h-full w-full flex flex-col justify-center">
    <form class="max-w-sm mx-auto mb-5 mt-20">
      <label for="tables" class="block mb-2 text-sm font-medium text-gray-900 text-center">Выберите таблицу</label>
      <select
        id="tables"
        v-model="selectus"
        class="bg-gray-50 border border-gray-900 text-gray-900 text-sm rounded-lg block w-full p-2.5"
      >
        <option value="DataTable">Заявки</option>
        <option value="SchoolsTable">Учебные заведения</option>
        <option value="DeletedTable">Удалённые заявки</option>
        <option value="SalesReportTable">Отчёт (Выдано)</option>
        <option value="AdminsTable" v-if="me?.is_super">Пользователи (супер)</option>
        <option value="ProductsPricesTable" v-if="me?.is_super">Цены устройств</option>
        <option value="StockTable" v-if="me?.is_super">Склад</option>
      </select>
    </form>

    <div class="flex" v-if="selectus === 'DataTable'">
      <DataTable :requests="requests" @deleted="handleDeletedRequest" />
    </div>

    <div class="flex" v-if="selectus === 'SchoolsTable'">
      <SchoolsTable :schools="schools" />
    </div>

    <div class="flex" v-if="selectus === 'DeletedTable'">
      <DeletedTable :requests="deletedRequests" @restored="handleRestoreRequest" />
    </div>

    <div class="flex" v-if="selectus === 'SalesReportTable'">
      <SalesReportTable />
    </div>

    <div class="flex" v-if="selectus === 'AdminsTable' && me?.is_super">
      <AdminsTable />
    </div>

    <div class="flex w-full" v-if="selectus === 'ProductsPricesTable' && me?.is_super">
      <ProductsPricesTable />
    </div>

    <div class="flex w-full" v-if="selectus === 'StockTable' && me?.is_super">
      <StockTable />
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AdminsTable from '~/components/AdminsTable.vue'
import DataTable from '~/components/DataTable.vue'
import DeletedTable from '~/components/DeletedTable.vue'
import ProductsPricesTable from '~/components/ProductsPricesTable.vue'
import SalesReportTable from '~/components/SalesReportTable.vue'
import SchoolsTable from '~/components/SchoolsTable.vue'
import StockTable from '~/components/StockTable.vue'

const requests = ref<any[]>([])
const deletedRequests = ref<any[]>([])
const schools = ref<any[]>([])
const selectus = ref('DataTable')
const me = ref<{ id: number; username: string; is_super: boolean } | null>(null)

async function logout() {
  await $fetch('/api/logout', { method: 'POST' })
  await navigateTo('/')
}

async function fetchRequests() {
  try {
    const response = await $fetch<{ requests: any[] }>('/api/all-requests')
    requests.value = response.requests
  } catch (error) {
    console.error('Ошибка загрузки заявок:', error)
  }
}

async function fetchSchools() {
  try {
    const response = await $fetch<{ schools: any[] }>('/api/all-schools')
    schools.value = response.schools
  } catch (error) {
    console.error('Ошибка загрузки школ:', error)
  }
}

async function fetchDeletedRequests() {
  try {
    const response = await $fetch<{ requests: any[] }>('/api/deleted-requests')
    deletedRequests.value = response.requests
  } catch (error) {
    console.error('Ошибка загрузки удалённых заявок:', error)
  }
}

function handleDeletedRequest(deletedRequest: any) {
  requests.value = requests.value.filter((request) => request.track_id !== deletedRequest.track_id)

  const exists = deletedRequests.value.some((request) => request.track_id === deletedRequest.track_id)
  if (!exists) {
    deletedRequests.value.unshift(deletedRequest)
  }
}

function handleRestoreRequest(restoredRequest: any) {
  deletedRequests.value = deletedRequests.value.filter((request) => request.track_id !== restoredRequest.track_id)

  const exists = requests.value.some((request) => request.track_id === restoredRequest.track_id)
  if (!exists) {
    requests.value.unshift(restoredRequest)
  }
}

onMounted(async () => {
  try {
    me.value = (await $fetch('/api/me')).user
  } catch {}

  fetchRequests()
  fetchSchools()
  fetchDeletedRequests()
})
</script>
