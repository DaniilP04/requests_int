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
    <div class="bg_custom relative border border-gray-900 rounded-lg">
        <div class="flex items-center justify-between">
            <SearchForm @search="handleSearch" />
        </div>
<!-- Таблица -->
<table class="hidden sm:table w-full">
  <thead class="text-xs text-gray-900 uppercase bg-gray-50">
    <tr>
      <th class="px-4 py-3 border">ФИО</th>
      <th class="px-4 py-3 border">Уч. Заведение</th>
      <th class="px-4 py-3 border">Класс</th>
      <th class="px-4 py-3 border">Телефон</th>
      <th class="px-4 py-3 border">Тип устройства</th>
      <th class="px-4 py-3 border">Источник</th>
      <th class="px-4 py-3 border">Статус</th>
      <th class="px-4 py-3 border">Дата подачи</th>
      <th class="px-4 py-3 border">Модифицировано</th>
      <th class="px-4 py-3 border">Действия</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="request in filteredRequests" :key="request.id">
      <td class="px-4 py-3 text-center border">{{ request.full_name }}</td>
      <td class="px-4 py-3 text-center border">{{ request.school }}</td>
      <td class="px-4 py-3 text-center border">{{ request.class }}</td>
      <td class="px-4 py-3 text-center border">{{ request.phone ?? 'Не указан' }}</td>
      <td class="px-4 py-3 text-center border">{{ request.device_type }}</td>
      <td class="px-4 py-3 text-center border">{{ request.source ?? '—' }}</td>
      <td class="px-4 py-3 text-center border">{{ request.status }}</td>
      <td class="px-4 py-3 text-center border">
        {{ new Date(request.created_at!).toLocaleDateString('ru-RU') }}
      </td>
      <td class="px-4 py-3 text-center border">
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
      <td class="px-4 py-3 text-center border">
        <div class="flex justify-center gap-1">
          <button class="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap" @click="restoreRequest(request.track_id)">
            Восстановить
          </button>
        </div>
      </td>
    </tr>
  </tbody>
</table>

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
