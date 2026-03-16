<template>
  <section class="w-full max-w-3xl mx-auto space-y-4">
    <h2 class="text-xl font-bold">Цены товаров</h2>

    <p v-if="error" class="text-red-600">{{ error }}</p>
    <p v-if="success" class="text-green-600">{{ success }}</p>

    <div class="overflow-x-auto">
      <table class="min-w-full text-sm border">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">Код</th>
            <th class="p-2 border">Название</th>
            <th class="p-2 border">Цена (₸)</th>
            <th class="p-2 border">Действия</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="p in products" :key="p.code">
            <td class="p-2 border font-mono">{{ p.code }}</td>
            <td class="p-2 border">{{ p.name }}</td>
            <td class="p-2 border">
              <input
                type="number"
                min="0"
                class="border p-1 rounded w-32"
                v-model.number="prices[p.code]"
              />
            </td>
            <td class="p-2 border">
              <button class="border px-2 py-1 rounded" @click="save(p.code)">
                Сохранить
              </button>
            </td>
          </tr>

          <tr v-if="products.length === 0">
            <td colspan="4" class="p-3 text-center text-gray-500">Нет товаров</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

type Product = { id: number; code: string; name: string; price: number; is_active: boolean }

const products = ref<Product[]>([])
const prices = ref<Record<string, number>>({})
const error = ref('')
const success = ref('')

async function load() {
  error.value = ''
  try {
    const r = await $fetch<{ products: Product[] }>('/api/_super/products')
    products.value = r.products
    prices.value = Object.fromEntries(r.products.map(p => [p.code, p.price]))
  } catch (e: any) {
    error.value = e?.statusMessage || 'Ошибка загрузки'
  }
}

async function save(code: string) {
  error.value = ''
  success.value = ''
  try {
    await $fetch('/api/_super/products.price', {
      method: 'PUT',
      body: { code, price: prices.value[code] }
    })
    success.value = 'Сохранено'
    setTimeout(() => (success.value = ''), 2000)
    await load()
  } catch (e: any) {
    error.value = e?.statusMessage || 'Ошибка сохранения'
  }
}

onMounted(load)
</script>