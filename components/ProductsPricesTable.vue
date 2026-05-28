<template>
  <section class="w-full max-w-4xl mx-auto px-3 sm:px-4 space-y-4">
    <div class="space-y-1 text-center">
      <h2 class="text-xl font-bold">Цены устройств</h2>
      <p class="text-sm text-gray-600">
        Здесь настраиваются цены и публичная доступность устройств.
      </p>
    </div>

    <p v-if="error" class="text-red-600 text-sm sm:text-base break-words">
      {{ error }}
    </p>
    <p v-if="success" class="text-green-600 text-sm sm:text-base break-words">
      {{ success }}
    </p>

    <div class="hidden sm:block overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table class="min-w-full text-sm border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border text-left">Устройство</th>
            <th class="p-2 border text-left">Цена (₸)</th>
            <th class="p-2 border text-left">В наличии</th>
            <th class="p-2 border text-left"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="product in products" :key="product.code">
            <td class="p-2 border">{{ product.name }}</td>
            <td class="p-2 border">
              <input
                type="number"
                min="0"
                class="border p-1 rounded w-36"
                v-model.number="prices[product.code]"
              />
            </td>
            <td class="p-2 border">
              <label class="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  class="h-4 w-4"
                  v-model="availability[product.code]"
                />
                <span>{{ availability[product.code] ? 'Да' : 'Нет' }}</span>
              </label>
            </td>
            <td class="p-2 border">
              <button class="border px-2 py-1 rounded" @click="save(product.code)">
                Сохранить
              </button>
            </td>
          </tr>

          <tr v-if="products.length === 0">
            <td colspan="4" class="p-3 text-center text-gray-500">
              Нет устройств
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="sm:hidden space-y-4">
      <div
        v-for="product in products"
        :key="'mobile-' + product.code"
        class="border rounded-lg p-4 bg-white shadow"
      >
        <div class="mb-2 break-words">
          <strong>Устройство:</strong> {{ product.name }}
        </div>

        <div class="mb-3">
          <label class="block text-sm font-semibold mb-1">Цена (₸)</label>
          <input
            type="number"
            min="0"
            class="w-full border p-2 rounded"
            v-model.number="prices[product.code]"
          />
        </div>

        <label class="flex items-center gap-2 text-sm mb-3">
          <input
            type="checkbox"
            class="h-4 w-4"
            v-model="availability[product.code]"
          />
          <span>В наличии: {{ availability[product.code] ? 'Да' : 'Нет' }}</span>
        </label>

        <button
          class="w-full border px-3 py-2 rounded"
          @click="save(product.code)"
        >
          Сохранить
        </button>
      </div>

      <div
        v-if="products.length === 0"
        class="p-4 text-center text-gray-500 border rounded-lg bg-white"
      >
        Нет устройств
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

type PriceProduct = {
  code: string
  name: string
  price: number
  isAvailable: boolean
}

const products = ref<PriceProduct[]>([])
const prices = ref<Record<string, number>>({})
const availability = ref<Record<string, boolean>>({})
const error = ref('')
const success = ref('')

async function load() {
  error.value = ''
  try {
    const response = await $fetch<{ products: PriceProduct[] }>('/api/_super/products')
    products.value = response.products
    prices.value = Object.fromEntries(response.products.map((product) => [product.code, product.price]))
    availability.value = Object.fromEntries(response.products.map((product) => [product.code, product.isAvailable]))
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
      body: {
        code,
        price: prices.value[code],
        isAvailable: Boolean(availability.value[code])
      }
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
