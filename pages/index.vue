<template>
  <main class="bg_custom min-h-screen items-center z-10 flex flex-col justify-center">
    <div class="max-sm:h-5/6 h-4/6 border-gray-900 border-2 rounded-lg flex flex-col justify-center items-center w-96 max-sm:mr-10 max-sm:ml-10">
      <p class="font-bold m-4">Выберите что вы хотите сделать</p>
      <div class="flex flex-row gap-4 mb-5 mr-10 ml-10 items-center justify-center text-nowrap">
      <NuxtLink to="form" class="rounded-xl border-2 p-2 border-gray-900 ml-10 hover:underline transition-transform active:scale-95">Заказать товар</NuxtLink>
      <NuxtLink to="check" class="rounded-xl border-2 p-2 border-gray-900 mr-10 hover:underline transition-transform active:scale-95">Проверить заявку</NuxtLink>
      </div>
    </div>
  </main>
</template>