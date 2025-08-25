<script setup>
const emit = defineEmits(['search']);

const search = (e) => {
    emit('search', e.target.value);
};
</script>

<template>
    <main class='w-auto'>
    <form class='py-3 px-4 flex items-center'>
        <label class='sr-only'>Поиск</label>
        <div class='relative w-full'>
            <input type='text' @input="search" placeholder='Поиск' class='bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2'>
        </div>
    </form>
    </main>
</template>