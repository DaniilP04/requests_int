<template>
  <div class="h-2 bg-slate-800"></div>

  <header class="bg-white shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.08)]">
    <div class="relative mx-auto max-w-7xl px-4 py-3 flex items-center">

      <NuxtLink to="/" class="flex items-center py-2">
        <img
          src="/img/logo.jpg"
          alt="Лого"
          class="h-10 w-auto object-contain"
        />
      </NuxtLink>

      <div class="absolute left-1/2 transform -translate-x-1/2">
        <NuxtLink
          to="/"
          class="select-none uppercase tracking-[0.1em] font-semibold text-slate-800 hover:text-gray-500 transition-colors max-sm:hidden"
        >
          На главную
        </NuxtLink>
      </div>

      <div class="ml-auto"></div>
    </div>
  </header>

  <main class="bg-white">
    <slot />
  </main>
</template>