<template>
    <header class="bg_custom header_custom">
    <div class="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
      <nav class="transition-all duration-300 sm:flex sm:items-center sm:space-x-8">
        <NuxtLink to="/" class="text-gray-900 font-bold hover:underline">На главную</NuxtLink>
      </nav> 
    </div>
  </header>
    <main class='bg_custom'>
        <slot />
    </main>
    <footer>
    </footer>
</template>

<script setup lang="ts">
</script>