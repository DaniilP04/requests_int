<script setup lang='ts'>
// Определение события 'deleted' для передачи информации об удалённой заявке родительскому компоненту
const emit = defineEmits(['deleted'])
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

// Принять отклонить
const updateStatus = async (track_id: string, newStatus: string) => {
  try {
    await $fetch('/api/update', {
      method: 'POST',
      body: { track_id, status: newStatus, reason: reason.value }
    })

    const req = localRequests.value.find(r => r.track_id === track_id)
    if (req) {
      req.status = newStatus
      req.status_modified_at = new Date()
    }
  } catch (error) {
    console.error('Ошибка при обновлении статуса:', error)
  }
}// Кнопка удаления
const deleteRequest = async (track_id) => {
  try {
    await $fetch('/api/delete', {
      method: 'POST',
      body: { track_id }
    })

    const deletedItem = localRequests.value.find(req => req.track_id === track_id)
    localRequests.value = localRequests.value.filter(req => req.track_id !== track_id)

    if (deletedItem) {
      emit('deleted', deletedItem) // отправляем удалённую заявку в родитель
    }

  } catch (error) {
    console.error('Ошибка при удалении заявки', error)
  }
}

// Логика модального окна с причиной удаления
const reason = ref<string | null>(null)
const currentTrackId = ref<string | null>(null)
const isModalOpen = ref(false)


const openRejectModal = (track_id: string) => {
  currentTrackId.value = track_id
  isModalOpen.value = true
}

const submitRejection = async () => {
  if (!currentTrackId.value || !reason.value) return

  const statusWithReason = `отклонен (${reason.value})`
  await updateStatus(currentTrackId.value, statusWithReason)
  closeModal()
}

const closeModal = () => {
  reason.value = null
  isModalOpen.value = false
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
        {{ new Date(request.created_at!).toLocaleString('ru-RU', {
            timeZone: 'Asia/Aqtobe',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        }}
      </td>
      <td class="px-4 py-3 text-center border">
        {{ request.status_modified_at
          ? new Date(request.status_modified_at).toLocaleString('ru-RU', {
              timeZone: 'Asia/Aqtobe',
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
          <button class="button_admin bg-green-400 hover:bg-green-500 w-10"
            @click="updateStatus(request.track_id, 'выполнен')">
            <img src="/img/check.svg" alt="Принять" />
          </button>
          <button class="button_admin bg-red-400 hover:bg-red-500 w-10"
            @click="openRejectModal(request.track_id)">
            <img src="/img/cross.svg" alt="Отклонить" />
          </button>
          <button class="button_admin bg-gray-300 hover:bg-gray-400 w-10"
            @click="deleteRequest(request.track_id)">
            <img src="/img/bin.svg" alt="Удалить" />
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
      <button @click="updateStatus(request.track_id, 'выполнен')" class="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap">
        Выполнено
      </button>
      <button @click="openRejectModal(request.track_id)" class="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap">
        Отклонить
      </button>
      <button @click="deleteRequest(request.track_id)" class="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap">
        Удалить
      </button>
    </div>
  </div>
</div>
    </div>
<!-- Модальное окно отказа -->
 <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-semibold mb-4">Укажите причину отказа (её увидит заказчик)</h2>

        <form @submit.prevent="updateSchool">
          <div class="mb-4">
            <input v-model="reason" type="text" class="w-full border border-gray-300 rounded px-3 py-2" required />
          </div>
          <div class="flex justify-center items-center">
            <div class="space-x-2">
              <button type="button" @click="closeModal" class="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap">
                Отмена
              </button>
              <button type="submit" @click.prevent="submitRejection" class="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap">
                Отказать
              </button>
            </div>
          </div>
        </form>
      </div>
 </div>
</template>