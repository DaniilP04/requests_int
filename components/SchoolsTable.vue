<script setup lang='ts'>
// Базовое объявление и импорты
import { ref, onMounted } from 'vue'

interface Schools {
  id: number
  name: string
  type: string
};

const props = defineProps<{
  schools: Schools[]
}>()


// Локальная копия для моментального обновления 
const localSchools = ref<Schools[]>([...props.schools])

watch(() => props.schools, (newVal) => {
  localSchools.value = [...newVal]
})

// Поиск
const searchFilter = ref('');
const filtereSchools = computed(() => {
  const query = searchFilter.value.toLowerCase()

  if (!query) return localSchools.value

  return localSchools.value.filter(school =>
    Object.values(school).some(value =>
      String(value).toLowerCase().includes(query)
    )
  )
})

const handleSearch = (search) => {
    searchFilter.value = search;
}

// Модальное окно для добавления новых заведений
const isModalOpen = ref(false)

const form = ref({
  name: '',
  type: ''
})

const submitForm = async () => {
  try {
    await $fetch('/api/add-school', {
      method: 'POST',
      body: form.value
    })
    isModalOpen.value = false
    form.value = { name: '', type: '' }
  } catch (error) {
    console.error('Ошибка при добавлении школы:', error)
  }
}

// Модальное окно для редактуры и удаления
const isEditModalOpen = ref(false)
const editableSchool = ref<Schools | null>(null)

const openEditModal = (school: Schools) => {
  editableSchool.value = { ...school } 
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  editableSchool.value = null
  isEditModalOpen.value = false
}

// Обновление школы
const updateSchool = async () => {
  try {
    const response = await $fetch('/api/update-school', {
      method: 'PUT',
      body: editableSchool.value
    })

    const updated = response.school
    const index = localSchools.value.findIndex(s => s.id === updated.id)
    if (index !== -1) {
      localSchools.value[index] = updated
    }

    closeEditModal()
  } catch (error) {
    console.error('Ошибка обновления школы:', error)
  }
}

// Удаление школы
const deleteSchool = async () => {
  if (!editableSchool.value) return
  try {
    await $fetch(`/api/schools.delete?id=${editableSchool.value.id}`, {
      method: 'DELETE'
    })

    localSchools.value = localSchools.value.filter(s => s.id !== editableSchool.value?.id)
    closeEditModal()
  } catch (error) {
    console.error('Ошибка при удалении школы:', error)
  }
}

</script>

<template>
      <!-- Основная таблица -->
    <div class="bg_custom relative border border-gray-900 rounded-lg">
        <div class="flex items-start gap-2 p-4">
            <div class='w-auto'>
            <SearchForm @search="handleSearch" />
            </div>
            <button @click="isModalOpen = true" class='bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg flex justify-center active:scale-95 mt-3 transition-transform p-2 text-nowrap'>Добавить</button>
        </div>
        <table>
            <thead class='text-xs text-gray-900 uppercase bg-gray-50'>
                <tr>
                    <th class='px-4 py-3 border-2 border-gray-60'>Название</th>
                    <th class='px-4 py-3 border-2 border-gray-60'>Тип</th>
                    <th class='px-4 py-3 border-2 border-gray-60'>Действия</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for='school in filtereSchools' :key='school.id'>
                    <td class="px-4 py-3 text-center border-2 border-gray-60">{{school.name}}</td>
                    <td class="px-4 py-3 text-center border-2 border-gray-60">{{school.type}}</td>
                    <td class="px-4 py-3 text-center border-2 border-gray-60">
                        <button @click="openEditModal(school)" class="text-blue-600 hover:underline">
                          Редактировать
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

      <!-- Модальное окно добавления -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-semibold mb-4">Добавить учебное заведение</h2>

        <form @submit.prevent="submitForm">
          <div class="mb-4">
            <label class="block mb-1 font-medium text-sm text-gray-700">Название</label>
            <input v-model="form.name" type="text" class="w-full border border-gray-300 rounded px-3 py-2" required />
          </div>
          <div class="mb-4">
            <label class="block mb-1 font-medium text-sm text-gray-700">Тип</label>
            <select v-model="form.type" class="w-full border border-gray-300 rounded px-3 py-2" required>
              <option value="" disabled>Выберите тип</option>
              <option value="интернат">интернат</option>
              <option value="школа">школа</option>
              <option value="гимназия">гимназия</option>
              <option value="колледж">колледж</option>
            </select>
          </div>
          <div class="flex justify-end space-x-2">
            <button type="button" @click="isModalOpen = false" class="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg flex justify-center active:scale-95 mt-3 transition-transform p-2 text-nowrap">
              Отмена
            </button>
            <button type="submit" class="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg flex justify-center active:scale-95 mt-3 transition-transform p-2 text-nowrap">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>

      <!-- Модальное окно редактирования -->
    <div v-if="isEditModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-semibold mb-4">Редактировать учебное заведение</h2>

        <form @submit.prevent="updateSchool">
          <div class="mb-4">
            <label class="block mb-1 font-medium text-sm text-gray-700">Название</label>
            <input v-model="editableSchool.name" type="text" class="w-full border border-gray-300 rounded px-3 py-2" required />
          </div>
          <div class="mb-4">
            <label class="block mb-1 font-medium text-sm text-gray-700">Тип</label>
            <select v-model="editableSchool.type" class="w-full border border-gray-300 rounded px-3 py-2" required>
              <option value="интернат">интернат</option>
              <option value="школа">школа</option>
              <option value="гимназия">гимназия</option>
              <option value="колледж">колледж</option>
            </select>
          </div>

          <div class="flex justify-between items-center">
            <button type="button" @click="deleteSchool" class="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap">
              Удалить
            </button>

            <div class="space-x-2">
              <button type="button" @click="closeEditModal" class="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap">
                Отмена
              </button>
              <button type="submit" class="bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap">
                Сохранить
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
</template>