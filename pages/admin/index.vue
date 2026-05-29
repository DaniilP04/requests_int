<template>
  <main class="bg_custom min-h-screen w-full text-slate-900 lg:flex">
    <div
      v-if="mobileSidebarOpen"
      class="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
      @click="mobileSidebarOpen = false"
    />

    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-white shadow-xl shadow-slate-200/60 transition-all duration-300 lg:sticky lg:top-0 lg:z-30 lg:shadow-none',
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-72',
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        'w-72'
      ]"
    >
      <div class="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
        <button
          v-if="sidebarCollapsed"
          type="button"
          class="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1d64d6] text-sm font-bold text-white transition hover:bg-[#1554b8]"
          aria-label="Открыть боковую панель"
          @click="sidebarCollapsed = false"
        >
          <span class="group-hover:hidden">A</span>
          <svg class="hidden h-4 w-4 group-hover:block" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span
            class="pointer-events-none absolute left-full top-1/2 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition group-hover:opacity-100 lg:block"
          >
            Открыть боковую панель
          </span>
        </button>

        <div
          v-else
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1d64d6] text-sm font-bold text-white"
        >
          A
        </div>

        <div class="min-w-0 flex-1" :class="sidebarCollapsed ? 'lg:hidden' : ''">
          <p class="truncate text-sm font-semibold leading-5">Админ панель</p>
          <p class="truncate text-xs text-slate-500">{{ me?.username || 'Пользователь' }}</p>
        </div>

        <button
          v-if="!sidebarCollapsed"
          type="button"
          class="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-[#1d64d6] hover:text-[#1d64d6] lg:flex"
          aria-label="Свернуть меню"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              :d="sidebarCollapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <button
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 lg:hidden"
          aria-label="Закрыть меню"
          @click="mobileSidebarOpen = false"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <nav class="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div class="space-y-1">
          <button
            v-for="item in tableItems"
            :key="item.value"
            type="button"
            :title="sidebarCollapsed ? item.label : undefined"
            :class="[
              'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition',
              selectus === item.value
                ? 'bg-blue-50 text-[#1d64d6] shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950',
              sidebarCollapsed ? 'lg:justify-center' : ''
            ]"
            @click="selectus = item.value; mobileSidebarOpen = false"
          >
            <span
              :class="[
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition',
                selectus === item.value
                  ? 'bg-[#1d64d6] text-white'
                  : 'bg-slate-100 text-slate-500 group-hover:bg-[#1d64d6] group-hover:text-white'
              ]"
            >
              {{ item.short }}
            </span>
            <span class="truncate" :class="sidebarCollapsed ? 'lg:hidden' : ''">{{ item.label }}</span>
          </button>
        </div>
      </nav>

      <div class="shrink-0 border-t border-slate-200 p-3">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-orange-50 hover:text-[#F26C4F]"
          :class="sidebarCollapsed ? 'lg:justify-center' : ''"
          :title="sidebarCollapsed ? 'Выйти' : undefined"
          @click="logout"
        >
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M10 17l5-5-5-5M15 12H3M21 4v16"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span :class="sidebarCollapsed ? 'lg:hidden' : ''">Выйти</span>
        </button>
      </div>
    </aside>

    <section class="flex min-h-screen min-w-0 flex-1 flex-col bg-slate-50">
      <div class="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
          aria-label="Открыть меню"
          @click="mobileSidebarOpen = true"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
        <p class="truncate px-4 text-sm font-semibold">{{ activeTableLabel }}</p>
        <div class="h-10 w-10" />
      </div>

      <div class="min-w-0 flex-1 overflow-x-auto p-3 sm:p-4 lg:p-6">
        <div class="mb-4 hidden items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 lg:flex">
          <div>
            <p class="text-xs font-semibold uppercase text-slate-400">Раздел</p>
            <h1 class="text-xl font-semibold text-slate-950">{{ activeTableLabel }}</h1>
          </div>
        </div>

        <div class="flex w-full" v-if="selectus === 'DataTable'">
          <DataTable :requests="requests" @deleted="handleDeletedRequest" />
        </div>

        <div class="flex w-full" v-if="selectus === 'SchoolsTable'">
          <SchoolsTable :schools="schools" />
        </div>

        <div class="flex w-full" v-if="selectus === 'DeletedTable'">
          <DeletedTable :requests="deletedRequests" @restored="handleRestoreRequest" />
        </div>

        <div class="flex min-w-max" v-if="selectus === 'SalesReportTable'">
          <SalesReportTable />
        </div>

        <div class="flex min-w-max" v-if="selectus === 'AdminsTable' && me?.is_super">
          <AdminsTable />
        </div>

        <div class="flex min-w-max w-full" v-if="selectus === 'ProductsPricesTable' && me?.is_super">
          <ProductsPricesTable />
        </div>

        <div class="flex min-w-max w-full" v-if="selectus === 'StockTable' && me?.is_super">
          <StockTable />
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
const sidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)

const tableItems = computed(() => {
  const items = [
    { value: 'DataTable', label: 'Заявки', short: 'З' },
    { value: 'SchoolsTable', label: 'Учебные заведения', short: 'УЗ' },
    { value: 'DeletedTable', label: 'Удалённые заявки', short: 'УД' },
    { value: 'SalesReportTable', label: 'Аналитика', short: 'АН' },
  ]

  if (me.value?.is_super) {
    items.push(
      { value: 'AdminsTable', label: 'Пользователи', short: 'П' },
      { value: 'ProductsPricesTable', label: 'Цены устройств', short: 'Ц' },
      { value: 'StockTable', label: 'Склад', short: 'С' },
    )
  }

  return items
})

const activeTableLabel = computed(() => (
  tableItems.value.find((item) => item.value === selectus.value)?.label || 'Админ панель'
))

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
