<template>
  <section
    class="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6"
  >
    <div
      class="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 sm:items-end"
    >
      <div class="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
        <label
          class="group flex min-h-[54px] w-full cursor-pointer flex-col justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm transition focus-within:border-[#1d64d6] focus-within:ring-2 focus-within:ring-blue-100 sm:w-44"
        >
          <span class="mb-0.5 text-[11px] font-semibold uppercase text-gray-500">
            С
          </span>
          <input
            type="date"
            v-model="from"
            aria-label="Дата начала"
            class="w-full border-0 bg-transparent p-0 text-sm font-semibold text-gray-900 outline-none"
          />
        </label>

        <label
          class="group flex min-h-[54px] w-full cursor-pointer flex-col justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm transition focus-within:border-[#1d64d6] focus-within:ring-2 focus-within:ring-blue-100 sm:w-44"
        >
          <span class="mb-0.5 text-[11px] font-semibold uppercase text-gray-500 group-focus-within:text-[#1d64d6]">
            По
          </span>
          <input
            type="date"
            v-model="to"
            aria-label="Дата окончания"
            class="w-full border-0 bg-transparent p-0 text-sm font-semibold text-gray-900 outline-none"
          />
        </label>
      </div>
      <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:min-h-[54px] sm:items-center">
        <button
          type="button"
          :class="presetButtonClass('today')"
          @click="setToday"
        >
          Сегодня
        </button>
        <button
          type="button"
          :class="presetButtonClass('last7')"
          @click="setLast7"
        >
          Последние 7 дней
        </button>
        <button
          type="button"
          :class="presetButtonClass('month')"
          @click="setThisMonth"
        >
          Текущий месяц
        </button>
      </div>
    </div>

    <p v-if="error" class="text-red-600 text-sm sm:text-base break-words">
      {{ error }}
    </p>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3"
      v-if="hasData"
    >
      <article
        v-for="card in summaryCards"
        :key="card.label"
        class="rounded-xl border bg-white p-4 shadow-sm"
      >
        <p class="text-xs uppercase tracking-wide text-gray-500">
          {{ card.label }}
        </p>
        <p class="mt-2 text-2xl font-bold text-gray-900">{{ card.value }}</p>
        <p class="mt-1 text-xs text-gray-500">{{ card.hint }}</p>
      </article>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4" v-if="hasData">
      <article class="rounded-xl border bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h3 class="text-base font-semibold text-gray-900">
            Выданные устройства и выручка
          </h3>
          <span class="text-xs text-gray-500">по дате выдачи</span>
        </div>

        <div class="overflow-x-auto" v-if="items.length">
          <table class="min-w-full text-xs sm:text-sm border-collapse">
            <thead class="bg-gray-50">
              <tr>
                <th class="p-2 sm:p-3 border text-left">Устройство</th>
                <th class="p-2 sm:p-3 border text-left whitespace-nowrap">
                  Цена
                </th>
                <th class="p-2 sm:p-3 border text-left whitespace-nowrap">
                  Выдано
                </th>
                <th class="p-2 sm:p-3 border text-left whitespace-nowrap">
                  Сумма
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.product">
                <td class="p-2 sm:p-3 border">{{ item.product }}</td>
                <td class="p-2 sm:p-3 border whitespace-nowrap">
                  {{ formatMoney(item.price) }}
                </td>
                <td class="p-2 sm:p-3 border">{{ item.count }}</td>
                <td class="p-2 sm:p-3 border font-semibold whitespace-nowrap">
                  {{ formatMoney(item.sum) }}
                </td>
              </tr>
              <tr>
                <td class="p-2 sm:p-3 border font-bold" colspan="3">Итого</td>
                <td class="p-2 sm:p-3 border font-bold whitespace-nowrap">
                  {{ formatMoney(total) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-else class="text-sm text-gray-500">
          Нет выданных устройств за выбранный период.
        </p>
      </article>

      <article class="rounded-xl border bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h3 class="text-base font-semibold text-gray-900">Статусы заявок</h3>
          <span class="text-xs text-gray-500">по созданным заявкам</span>
        </div>

        <div v-if="statusItems.length" class="space-y-3">
          <div v-for="item in statusItems" :key="item.status" class="space-y-1">
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="text-gray-700 break-words">{{ item.status }}</span>
              <span class="font-semibold text-gray-900">{{ item.count }}</span>
            </div>
            <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                class="h-full rounded-full bg-gray-900"
                :style="{ width: `${statusShare(item.count)}%` }"
              />
            </div>
          </div>
        </div>

        <p v-else class="text-sm text-gray-500">
          Нет заявок по статусам за выбранный период.
        </p>
      </article>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4" v-if="hasData">
      <article class="rounded-xl border bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between gap-3 mb-4">
          <h3 class="text-base font-semibold text-gray-900">
            Источники заявок
          </h3>
          <span class="text-xs text-gray-500">по созданным заявкам</span>
        </div>

        <div v-if="sourceItems.length" class="space-y-3">
          <div v-for="item in sourceItems" :key="item.source" class="space-y-1">
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="text-gray-700 break-words">{{ item.source }}</span>
              <span class="font-semibold text-gray-900">{{ item.count }}</span>
            </div>
            <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                class="h-full rounded-full bg-sky-500"
                :style="{ width: `${sourceShare(item.count)}%` }"
              />
            </div>
          </div>
        </div>

        <p v-else class="text-sm text-gray-500">
          Нет данных по источникам за выбранный период.
        </p>
      </article>
    </div>

    <article class="rounded-xl border bg-white p-4 shadow-sm" v-if="hasData">
      <div class="flex items-center justify-between gap-3 mb-4">
        <h3 class="text-base font-semibold text-gray-900">Динамика по дням</h3>
        <span class="text-xs text-gray-500">создано и выдано</span>
      </div>

      <div class="overflow-x-auto" v-if="dailyItems.length">
        <table class="min-w-full text-xs sm:text-sm border-collapse">
          <thead class="bg-gray-50">
            <tr>
              <th class="p-2 sm:p-3 border text-left whitespace-nowrap">
                Дата
              </th>
              <th class="p-2 sm:p-3 border text-left whitespace-nowrap">
                Создано
              </th>
              <th class="p-2 sm:p-3 border text-left whitespace-nowrap">
                Выдано
              </th>
              <th class="p-2 sm:p-3 border text-left">Активность</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in dailyItems" :key="item.date">
              <td class="p-2 sm:p-3 border whitespace-nowrap">
                {{ formatDate(item.date) }}
              </td>
              <td class="p-2 sm:p-3 border">{{ item.created }}</td>
              <td class="p-2 sm:p-3 border">{{ item.issued }}</td>
              <td class="p-2 sm:p-3 border min-w-[180px]">
                <div class="space-y-2">
                  <div>
                    <div
                      class="flex items-center justify-between text-[11px] text-gray-500 mb-1"
                    >
                      <span>Создано</span>
                      <span>{{ item.created }}</span>
                    </div>
                    <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        class="h-full rounded-full bg-gray-900"
                        :style="{ width: `${dailyShare(item.created)}%` }"
                      />
                    </div>
                  </div>

                  <div>
                    <div
                      class="flex items-center justify-between text-[11px] text-gray-500 mb-1"
                    >
                      <span>Выдано</span>
                      <span>{{ item.issued }}</span>
                    </div>
                    <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        class="h-full rounded-full bg-sky-500"
                        :style="{ width: `${dailyShare(item.issued)}%` }"
                      />
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </article>

    <p v-if="!hasData && !error" class="text-gray-600 text-sm sm:text-base">
      Нет данных за выбранный период.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

type ProductItem = {
  product: string;
  price: number;
  count: number;
  sum: number;
};

type StatusItem = {
  status: string;
  count: number;
};

type SchoolItem = {
  school: string;
  count: number;
};

type SourceItem = {
  source: string;
  count: number;
};

type DailyItem = {
  date: string;
  created: number;
  issued: number;
};

type Summary = {
  createdCount: number;
  issuedCount: number;
  totalRevenue: number;
  conversionRate: number;
  activeProducts: number;
};

type DashboardResponse = {
  items: ProductItem[];
  total: number;
  summary: Summary;
  statusItems: StatusItem[];
  schoolItems: SchoolItem[];
  sourceItems: SourceItem[];
  dailyItems: DailyItem[];
};

type Preset = "today" | "last7" | "month";

const from = ref("");
const to = ref("");
const items = ref<ProductItem[]>([]);
const total = ref(0);
const error = ref("");
const summary = ref<Summary>({
  createdCount: 0,
  issuedCount: 0,
  totalRevenue: 0,
  conversionRate: 0,
  activeProducts: 0,
});
const statusItems = ref<StatusItem[]>([]);
const schoolItems = ref<SchoolItem[]>([]);
const sourceItems = ref<SourceItem[]>([]);
const dailyItems = ref<DailyItem[]>([]);

const hasData = computed(
  () =>
    summary.value.createdCount > 0 ||
    summary.value.issuedCount > 0 ||
    items.value.length > 0,
);

const maxStatusCount = computed(() =>
  Math.max(...statusItems.value.map((item) => item.count), 0),
);
const maxSchoolCount = computed(() =>
  Math.max(...schoolItems.value.map((item) => item.count), 0),
);
const maxSourceCount = computed(() =>
  Math.max(...sourceItems.value.map((item) => item.count), 0),
);
const maxDailyCount = computed(() =>
  Math.max(
    ...dailyItems.value.flatMap((item) => [item.created, item.issued]),
    0,
  ),
);

const activePreset = computed<Preset | null>(() => {
  const ranges = getPresetRanges();
  const current = `${from.value}:${to.value}`;

  if (current === `${ranges.today.from}:${ranges.today.to}`) return "today";
  if (current === `${ranges.last7.from}:${ranges.last7.to}`) return "last7";
  if (current === `${ranges.month.from}:${ranges.month.to}`) return "month";

  return null;
});

const summaryCards = computed(() => [
  {
    label: "Новые заявки",
    value: summary.value.createdCount.toLocaleString("ru-RU"),
    hint: "создано за выбранный период",
  },
  {
    label: "Выдано",
    value: summary.value.issuedCount.toLocaleString("ru-RU"),
    hint: 'статус "Выдан" за период',
  },
  {
    label: "Выручка",
    value: formatMoney(summary.value.totalRevenue),
    hint: "сумма по выданным устройствам",
  },
  {
    label: "Конверсия в выдачу",
    value: `${summary.value.conversionRate}%`,
    hint: "выдано от числа новых заявок",
  },
  {
    label: "Активные устройства",
    value: summary.value.activeProducts.toLocaleString("ru-RU"),
    hint: "видов устройств было выдано",
  },
]);

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getPresetRanges() {
  const today = new Date();
  const last7Start = new Date();
  last7Start.setDate(last7Start.getDate() - 6);
  const monthStart = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1),
  );

  return {
    today: {
      from: toISODate(today),
      to: toISODate(today),
    },
    last7: {
      from: toISODate(last7Start),
      to: toISODate(today),
    },
    month: {
      from: toISODate(monthStart),
      to: toISODate(today),
    },
  };
}

function presetButtonClass(preset: Preset) {
  const isActive = activePreset.value === preset;

  return [
    "border px-3 py-2 rounded text-sm w-full sm:w-auto transition-colors",
    isActive
      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
      : "border-gray-300 bg-white text-gray-700 hover:border-gray-500 hover:bg-gray-50",
  ];
}

function setToday() {
  const range = getPresetRanges().today;
  from.value = range.from;
  to.value = range.to;
}

function setLast7() {
  const range = getPresetRanges().last7;
  from.value = range.from;
  to.value = range.to;
}

function setThisMonth() {
  const range = getPresetRanges().month;
  from.value = range.from;
  to.value = range.to;
}

function formatMoney(value: number) {
  return `${value.toLocaleString("ru-RU")} ₸`;
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function calcShare(count: number, max: number) {
  if (!max) return 0;
  return Number(((count / max) * 100).toFixed(1));
}

function statusShare(count: number) {
  return calcShare(count, maxStatusCount.value);
}

function schoolShare(count: number) {
  return calcShare(count, maxSchoolCount.value);
}

function sourceShare(count: number) {
  return calcShare(count, maxSourceCount.value);
}

function dailyShare(count: number) {
  return calcShare(count, maxDailyCount.value);
}

async function load() {
  error.value = "";

  if (!from.value || !to.value) {
    error.value = "Выберите даты";
    return;
  }

  try {
    const response = await $fetch<DashboardResponse>(
      `/api/sales-report?from=${from.value}&to=${to.value}`,
    );
    items.value = response.items;
    total.value = response.total;
    summary.value = response.summary;
    statusItems.value = response.statusItems;
    schoolItems.value = response.schoolItems;
    sourceItems.value = response.sourceItems;
    dailyItems.value = response.dailyItems;
  } catch (e: any) {
    error.value = e?.statusMessage || "Ошибка расчёта";
  }
}

let loadTimer: ReturnType<typeof setTimeout> | undefined;

watch([from, to], () => {
  if (loadTimer) clearTimeout(loadTimer);
  loadTimer = setTimeout(load, 200);
});

onMounted(() => {
  setLast7();
});

onBeforeUnmount(() => {
  if (loadTimer) clearTimeout(loadTimer);
});
</script>
