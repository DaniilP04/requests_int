<template>
  <section class="w-full max-w-4xl mx-auto space-y-4">
    <h2 class="text-xl font-bold">Отчёт по выданным товарам</h2>

    <div class="flex flex-wrap gap-2 items-end">
      <div>
        <label class="block text-sm">С</label>
        <input type="date" v-model="from" class="border p-2 rounded" />
      </div>
      <div>
        <label class="block text-sm">По</label>
        <input type="date" v-model="to" class="border p-2 rounded" />
      </div>

      <button class="border px-3 py-2 rounded" @click="setToday">Сегодня</button>
      <button class="border px-3 py-2 rounded" @click="setLast7">Последние 7 дней</button>
      <button class="border px-3 py-2 rounded font-semibold" @click="load">Посчитать</button>
    </div>

    <p v-if="error" class="text-red-600">{{ error }}</p>

    <div class="overflow-x-auto" v-if="items.length">
      <table class="min-w-full text-sm border">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">Товар</th>
            <th class="p-2 border">Цена</th>
            <th class="p-2 border">Кол-во (Выдан)</th>
            <th class="p-2 border">Сумма</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in items" :key="i.product">
            <td class="p-2 border">{{ i.product }}</td>
            <td class="p-2 border">{{ i.price }} ₸</td>
            <td class="p-2 border">{{ i.count }}</td>
            <td class="p-2 border font-semibold">{{ i.sum }} ₸</td>
          </tr>
          <tr>
            <td class="p-2 border font-bold" colspan="3">Итого</td>
            <td class="p-2 border font-bold">{{ total }} ₸</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-gray-600">Нет выданных товаров за выбранный период.</p>
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