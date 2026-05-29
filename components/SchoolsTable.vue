<script setup lang="ts">
// Базовое объявление и импорты
import { ref, onMounted } from "vue";

interface Schools {
  id: number;
  name: string;
  type: string;
}

const props = defineProps<{
  schools: Schools[];
}>();

// Локальная копия для моментального обновления
const localSchools = ref<Schools[]>([...props.schools]);

watch(
  () => props.schools,
  (newVal) => {
    localSchools.value = [...newVal];
  },
);

// Поиск
const searchFilter = ref("");
const filtereSchools = computed(() => {
  const query = searchFilter.value.toLowerCase();

  if (!query) return localSchools.value;

  return localSchools.value.filter((school) =>
    Object.values(school).some((value) =>
      String(value).toLowerCase().includes(query),
    ),
  );
});

const handleSearch = (search) => {
  searchFilter.value = search;
};

// Модальное окно для добавления новых заведений
const isModalOpen = ref(false);

const form = ref({
  name: "",
  type: "",
});

const submitForm = async () => {
  try {
    await $fetch("/api/add-school", {
      method: "POST",
      body: form.value,
    });
    isModalOpen.value = false;
    form.value = { name: "", type: "" };
  } catch (error) {
    console.error("Ошибка при добавлении школы:", error);
  }
};

// Модальное окно для редактуры и удаления
const isEditModalOpen = ref(false);
const editableSchool = ref<Schools | null>(null);

const openEditModal = (school: Schools) => {
  editableSchool.value = { ...school };
  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  editableSchool.value = null;
  isEditModalOpen.value = false;
};

// Обновление школы
const updateSchool = async () => {
  try {
    const response = await $fetch("/api/update-school", {
      method: "PUT",
      body: editableSchool.value,
    });

    const updated = response.school;
    const index = localSchools.value.findIndex((s) => s.id === updated.id);
    if (index !== -1) {
      localSchools.value[index] = updated;
    }

    closeEditModal();
  } catch (error) {
    console.error("Ошибка обновления школы:", error);
  }
};

// Удаление школы
const deleteSchool = async () => {
  if (!editableSchool.value) return;
  try {
    await $fetch(`/api/schools?id=${editableSchool.value.id}`, {
      method: "DELETE",
    });

    localSchools.value = localSchools.value.filter(
      (s) => s.id !== editableSchool.value?.id,
    );
    closeEditModal();
  } catch (error) {
    console.error("Ошибка при удалении школы:", error);
  }
};
</script>

<template>
  <div class="bg_custom relative w-full overflow-hidden rounded-xl border bg-white shadow-sm">
    <div
      class="flex flex-col gap-3 border-b border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="w-full sm:w-auto sm:flex-1 sm:max-w-md">
        <SearchForm @search="handleSearch" />
      </div>

      <button
        @click="isModalOpen = true"
        class="flex w-full shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100 active:scale-95 sm:w-auto"
      >
        Добавить
      </button>
    </div>

    <!-- Таблица для планшета-->
    <div class="hidden sm:block overflow-x-auto">
    <table class="w-full table-fixed text-xs">
      <colgroup>
        <col class="w-[58%]" />
        <col class="w-[22%]" />
        <col class="w-[20%]" />
      </colgroup>
      <thead class="bg-gray-50 text-[11px] uppercase text-gray-900">
        <tr>
          <th class="border px-2 py-2 text-left">Название</th>
          <th class="border px-2 py-2 text-left">Тип</th>
          <th class="border px-2 py-2 text-center">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="school in filtereSchools" :key="school.id" class="align-top hover:bg-slate-50">
          <td class="break-words border px-2 py-2 leading-snug">
            {{ school.name }}
          </td>
          <td class="break-words border px-2 py-2 leading-snug">
            {{ school.type }}
          </td>
          <td class="border px-2 py-2 text-center">
            <button
              @click="openEditModal(school)"
              class="rounded-md border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-900 transition hover:bg-gray-100 active:scale-95"
            >
              Редактировать
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    </div>

    <!-- Мобильная версия -->
    <div class="sm:hidden space-y-4 p-4 pt-0">
      <div
        v-for="school in filtereSchools"
        :key="'mobile-' + school.id"
        class="rounded-lg border bg-white p-4 shadow-sm"
      >
        <div class="mb-2 break-words">
          <strong>Название:</strong> {{ school.name }}
        </div>

        <div class="mb-3"><strong>Тип:</strong> {{ school.type }}</div>

        <button
          @click="openEditModal(school)"
          class="w-full rounded-md border border-gray-300 bg-gray-50 p-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100 active:scale-95"
        >
          Редактировать
        </button>
      </div>
    </div>
  </div>

  <!-- Модальное окно добавления -->
  <div
    v-if="isModalOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3"
  >
    <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md">
      <h2 class="text-lg font-semibold mb-4">Добавить учебное заведение</h2>

      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm text-gray-700"
            >Название</label
          >
          <input
            v-model="form.name"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm text-gray-700"
            >Тип</label
          >
          <select
            v-model="form.type"
            class="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="" disabled>Выберите тип</option>
            <option value="интернат">интернат</option>
            <option value="школа">школа</option>
            <option value="гимназия">гимназия</option>
            <option value="колледж">колледж</option>
          </select>
        </div>

        <div class="flex flex-col sm:flex-row justify-end gap-2">
          <button
            type="button"
            @click="isModalOpen = false"
            class="w-full sm:w-auto bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap"
          >
            Отмена
          </button>
          <button
            type="submit"
            class="w-full sm:w-auto bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Модальное окно редактирования -->
  <div
    v-if="isEditModalOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3"
  >
    <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md">
      <h2 class="text-lg font-semibold mb-4">
        Редактировать учебное заведение
      </h2>

      <form @submit.prevent="updateSchool">
        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm text-gray-700"
            >Название</label
          >
          <input
            v-model="editableSchool.name"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm text-gray-700"
            >Тип</label
          >
          <select
            v-model="editableSchool.type"
            class="w-full border border-gray-300 rounded px-3 py-2"
            required
          >
            <option value="интернат">интернат</option>
            <option value="школа">школа</option>
            <option value="гимназия">гимназия</option>
            <option value="колледж">колледж</option>
          </select>
        </div>

        <div
          class="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0"
        >
          <button
            type="button"
            @click="deleteSchool"
            class="w-full sm:w-auto bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap"
          >
            Удалить
          </button>

          <div class="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              @click="closeEditModal"
              class="w-full sm:w-auto bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="w-full sm:w-auto bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 rounded-lg active:scale-95 transition-transform p-2 text-nowrap"
            >
              Сохранить
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
