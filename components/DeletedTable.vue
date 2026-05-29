<script setup lang='ts'>
// Определение события 'restored' для передачи информации об удалённой заявке родительскому компоненту
const emit = defineEmits(['restored'])

// Базовое объявление и импорты
import { ref, onMounted } from 'vue'

interface Request {
  id: number
  full_name: string
  school: string
  class: string
  phone: string | null
  device_type: string
  source: string | null
  track_id: string
  status: string | null
  created_at: Date | null
  status_modified_at: Date | null
  deleted: boolean
};

const props = defineProps<{
  requests: Request[]
}>()

// Локальная копия для моментального обновления 
const localRequests = ref<Request[]>([...props.requests])

watch(() => props.requests, (newVal) => {
  localRequests.value = [...newVal]
})

// Поиск
const searchFilter = ref('');
const filteredRequests = computed(() => {
  const query = searchFilter.value.toLowerCase()

  if (!query) return localRequests.value

  return localRequests.value.filter(request =>
    Object.values(request).some(value =>
      String(value).toLowerCase().includes(query)
    )
  )
})

const handleSearch = (search) => {
    searchFilter.value = search;
}

// Восстановление заявки

const restoreRequest = async (track_id: string) => {
  try {
    const res = await $fetch('/api/restore', {
      method: 'POST',
      body: { track_id },
    })

    if (res.success) {
      const restored = localRequests.value.find(r => r.track_id === track_id)
      localRequests.value = localRequests.value.filter(r => r.track_id !== track_id)

      if (restored) {
        emit('restored', restored) // отправляем восстановленную заявку в родитель
      }

      console.log('Запись успешно восстановлена')
    } else {
      console.log(res.message || 'Не удалось восстановить')
    }
  } catch (error) {
    console.error('Ошибка при восстановлении:', error)
    alert('Ошибка при восстановлении')
  }
}





</script>

<template>
    <div class="bg_custom relative w-full overflow-hidden rounded-xl border bg-white shadow-sm">
        <div class="flex items-center justify-between">
            <SearchForm @search="handleSearch" />
        </div>
<!-- Таблица -->
<div class="hidden sm:block overflow-x-auto">
<table class="w-full table-fixed text-xs">
  <colgroup>
    <col class="w-[15%]" />
    <col class="w-[15%]" />
    <col class="w-[5%]" />
    <col class="w-[10%]" />
    <col class="w-[10%]" />
    <col class="w-[8%]" />
    <col class="w-[11%]" />
    <col class="w-[9%]" />
    <col class="w-[9%]" />
    <col class="w-[8%]" />
  </colgroup>
  <thead class="bg-gray-50 text-[11px] uppercase text-gray-900">
    <tr>
      <th class="border px-2 py-2 text-left">ФИО</th>
      <th class="border px-2 py-2 text-left">Уч. заведение</th>
      <th class="border px-2 py-2 text-center">Класс</th>
      <th class="border px-2 py-2 text-left">Телефон</th>
      <th class="border px-2 py-2 text-left">Устройство</th>
      <th class="border px-2 py-2 text-left">Источник</th>
      <th class="border px-2 py-2 text-left">Статус</th>
      <th class="border px-2 py-2 text-left">Дата</th>
      <th class="border px-2 py-2 text-left">Изменено</th>
      <th class="border px-2 py-2 text-center">Действия</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="request in filteredRequests" :key="request.id" class="align-top hover:bg-slate-50">
      <td class="break-words border px-2 py-2 leading-snug">{{ request.full_name }}</td>
      <td class="break-words border px-2 py-2 leading-snug">{{ request.school }}</td>
      <td class="border px-2 py-2 text-center">{{ request.class }}</td>
      <td class="break-words border px-2 py-2">{{ request.phone ?? 'Не указан' }}</td>
      <td class="break-words border px-2 py-2 leading-snug">{{ request.device_type }}</td>
      <td class="break-words border px-2 py-2">{{ request.source ?? '—' }}</td>
      <td class="break-words border px-2 py-2 leading-snug">{{ request.status }}</td>
      <td class="border px-2 py-2 leading-snug">
        {{ new Date(request.created_at!).toLocaleDateString('ru-RU') }}
      </td>
      <td class="border px-2 py-2 leading-snug">
        {{ request.status_modified_at
          ? new Date(request.status_modified_at).toLocaleString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Нет'
        }}
      </td>
      <td class="border px-2 py-2 text-center">
        <div class="flex justify-center gap-1">
          <button class="rounded-md border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-900 transition hover:bg-gray-100 active:scale-95" @click="restoreRequest(request.track_id)">
            Восстановить
          </button>
        </div>
      </td>
    </tr>
  </tbody>
</table>
</div>

<!-- Вариант для мобильных устройств -->
<div class="sm:hidden space-y-4 mt-4">
  <div
    v-for="request in filteredRequests"
    :key="'mobile-' + request.id"
    class="bg-white shadow border rounded-lg p-4"
  >
    <div class="mb-1"><strong>ФИО:</strong> {{ request.full_name }}</div>
    <div class="mb-1"><strong>Уч. Заведение:</strong> {{ request.school }}</div>
    <div class="mb-1"><strong>Класс:</strong> {{ request.class }}</div>
    <div class="mb-1"><strong>Телефон:</strong> {{ request.phone ?? 'Не указан' }}</div>
    <div class="mb-1"><strong>Тип устройства:</strong> {{ request.device_type }}</div>
    <div class="mb-1"><strong>Источник:</strong> {{ request.source ?? '—' }}</div>
    <div class="mb-1"><strong>Статус:</strong> {{ request.status }}</div>
    <div class="mb-1"><strong>Дата подачи:</strong> {{ new Date(request.created_at!).toLocaleDateString('ru-RU') }}</div>
    <div class="mb-2"><strong>Модифицировано:</strong>
      {{ request.status_modified_at
        ? new Date(request.status_modified_at).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Нет'
      }}
    </div>
    <div class="flex justify-center gap-2 mt-5">
          <button class="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap" @click="restoreRequest(request.track_id)">
            Восстановить
          </button>
    </div>
  </div>
</div>
    </div>
</template>
