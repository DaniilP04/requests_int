<template>
  <section class="w-full max-w-4xl mx-auto px-3 sm:px-4 space-y-4">
    <p v-if="error" class="text-red-600 text-sm sm:text-base break-words">
      {{ error }}
    </p>
    <p v-if="success" class="text-green-600 text-sm sm:text-base break-words">
      {{ success }}
    </p>

    <div class="flex justify-end">
      <button
        @click="isModalOpen = true"
        class="flex w-full shrink-0 items-center justify-center rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100 active:scale-95 sm:w-auto"
      >
        Добавить
      </button>
    </div>

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
              <div class="flex gap-2">
                <button class="border px-2 py-1 rounded" @click="save(product.code)">
                  Сохранить
                </button>
                <button class="border px-2 py-1 rounded" @click="remove(product.code)">
                  Удалить
                </button>
              </div>
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

        <div class="flex gap-2">
          <button
            class="flex-1 border px-3 py-2 rounded"
            @click="save(product.code)"
          >
            Сохранить
          </button>
          <button
            class="flex-1 border px-3 py-2 rounded"
            @click="remove(product.code)"
          >
            Удалить
          </button>
        </div>
      </div>

      <div
        v-if="products.length === 0"
        class="p-4 text-center text-gray-500 border rounded-lg bg-white"
      >
        Нет устройств
      </div>
    </div>
  </section>

  <!-- Модальное окно добавления устройства -->
  <div
    v-if="isModalOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3"
  >
    <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md">
      <h2 class="text-lg font-semibold mb-4">Добавить устройство</h2>

      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm text-gray-700">Код</label>
          <input
            v-model="form.code"
            @input="form.code = sanitizeCode(form.code)"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="lowercase-latin"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm text-gray-700">Название</label>
          <input
            v-model="form.name"
            @input="form.name = sanitizeCyrillic(form.name)"
            @blur="form.name = capitalize(form.name)"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm text-gray-700">Цвет (необязательно)</label>
          <input
            v-model="form.color"
            @input="form.color = sanitizeCyrillic(form.color)"
            @blur="form.color = capitalize(form.color)"
            type="text"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div class="mb-4">
          <label class="block mb-1 font-medium text-sm text-gray-700">Цена (₸)</label>
          <input
            v-model.number="form.price"
            type="number"
            min="0"
            class="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div class="mb-4" v-if="form.isAvailable">
          <label class="block mb-1 font-medium text-sm text-gray-700">Количество</label>
          <input
            v-model.number="form.quantity"
            type="number"
            min="0"
            class="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div class="mb-4">
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" class="h-4 w-4" v-model="form.isAvailable" />
            <span class="text-sm text-gray-700">В наличии</span>
          </label>
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

// Модальное окно добавления устройства
const isModalOpen = ref(false)

const form = ref({
  code: '',
  name: '',
  color: '',
  price: 0,
  quantity: 0,
  isAvailable: true
})

// Только русские/казахские буквы и пробелы — используется для Названия и Цвета
function sanitizeCyrillic(value: string) {
  return value.replace(/[^а-яёА-ЯЁәғқңөұүһіӘҒҚҢӨҰҮҺІ\s]/g, '')
}

// Только строчные латинские буквы и дефисы — используется для Кода
function sanitizeCode(value: string) {
  return value.toLowerCase().replace(/[^a-z-]/g, '')
}

// Первая буква заглавная, остальные строчные
function capitalize(value: string) {
  const trimmed = value.trim().replace(/\s+/g, ' ')
  if (!trimmed) return trimmed
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

async function submitForm() {
  error.value = ''
  try {
    await $fetch('/api/_super/products', {
      method: 'POST',
      body: {
        code: form.value.code,
        name: form.value.name,
        color: form.value.color || null,
        price: form.value.price,
        quantity: form.value.isAvailable ? form.value.quantity : 0,
        isAvailable: form.value.isAvailable
      }
    })
    isModalOpen.value = false
    form.value = { code: '', name: '', color: '', price: 0, quantity: 0, isAvailable: true }
    success.value = 'Устройство добавлено'
    setTimeout(() => (success.value = ''), 2000)
    await load()
  } catch (e: any) {
    error.value = e?.statusMessage || e?.data?.statusMessage || 'Ошибка при добавлении устройства'
  }
}

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

async function remove(code: string) {
  const product = products.value.find((p) => p.code === code)
  if (!confirm(`Удалить устройство «${product?.name || code}»? Это действие необратимо.`)) return

  error.value = ''
  success.value = ''
  try {
    await $fetch(`/api/_super/products?code=${encodeURIComponent(code)}`, {
      method: 'DELETE'
    })
    success.value = 'Устройство удалено'
    setTimeout(() => (success.value = ''), 2000)
    await load()
  } catch (e: any) {
    error.value = e?.statusMessage || e?.data?.statusMessage || 'Ошибка при удалении устройства'
  }
}

onMounted(load)
</script>
