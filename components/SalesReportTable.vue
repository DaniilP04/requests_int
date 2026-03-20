<template>
  <section class="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
    <h2 class="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
      Отчёт по выданным товарам
    </h2>

    <div class="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-end">
      <div class="w-full sm:w-auto">
        <label class="block text-sm mb-1">С</label>
        <input
          type="date"
          v-model="from"
          class="w-full sm:w-auto border rounded px-3 py-2 text-sm"
        />
      </div>

      <div class="w-full sm:w-auto">
        <label class="block text-sm mb-1">По</label>
        <input
          type="date"
          v-model="to"
          class="w-full sm:w-auto border rounded px-3 py-2 text-sm"
        />
      </div>

      <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <button
          class="border px-3 py-2 rounded text-sm w-full sm:w-auto"
          @click="setToday"
        >
          Сегодня
        </button>
        <button
          class="border px-3 py-2 rounded text-sm w-full sm:w-auto"
          @click="setLast7"
        >
          Последние 7 дней
        </button>
        <button
          class="border px-3 py-2 rounded font-semibold text-sm w-full sm:w-auto"
          @click="load"
        >
          Посчитать
        </button>
      </div>
    </div>

    <p v-if="error" class="text-red-600 text-sm sm:text-base break-words">
      {{ error }}
    </p>

    <div class="overflow-x-auto rounded-lg border" v-if="items.length">
      <table class="min-w-full text-xs sm:text-sm border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 sm:p-3 border text-left">Товар</th>
            <th class="p-2 sm:p-3 border text-left whitespace-nowrap">Цена</th>
            <th class="p-2 sm:p-3 border text-left whitespace-nowrap">Кол-во (Выдан)</th>
            <th class="p-2 sm:p-3 border text-left whitespace-nowrap">Сумма</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in items" :key="i.product">
            <td class="p-2 sm:p-3 border">{{ i.product }}</td>
            <td class="p-2 sm:p-3 border whitespace-nowrap">{{ i.price }} ₸</td>
            <td class="p-2 sm:p-3 border">{{ i.count }}</td>
            <td class="p-2 sm:p-3 border font-semibold whitespace-nowrap">{{ i.sum }} ₸</td>
          </tr>
          <tr>
            <td class="p-2 sm:p-3 border font-bold" colspan="3">Итого</td>
            <td class="p-2 sm:p-3 border font-bold whitespace-nowrap">{{ total }} ₸</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-gray-600 text-sm sm:text-base">
      Нет выданных товаров за выбранный период.
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Item = { product: string; price: number; count: number; sum: number }

const from = ref('')
const to = ref('')
const items = ref<Item[]>([])
const total = ref(0)
const error = ref('')

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10)
}

function setToday() {
  const d = new Date()
  from.value = toISODate(d)
  to.value = toISODate(d)
}

function setLast7() {
  const d2 = new Date()
  const d1 = new Date()
  d1.setDate(d1.getDate() - 6)
  from.value = toISODate(d1)
  to.value = toISODate(d2)
}

async function load() {
  error.value = ''
  if (!from.value || !to.value) {
    error.value = 'Выберите даты'
    return
  }
  try {
    const r = await $fetch<{ items: Item[]; total: number }>(`/api/sales-report?from=${from.value}&to=${to.value}`)
    items.value = r.items
    total.value = r.total
  } catch (e: any) {
    error.value = e?.statusMessage || 'Ошибка расчёта'
  }
}

onMounted(() => {
  setLast7()
  load()
})
</script>