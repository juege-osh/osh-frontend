<template>
  <div class="tool-page-redirect" />
</template>

<script setup>
const route = useRoute();

definePageMeta({
  name: 'tool-page',
});

const page = Number(route.params.page || 1);
const normalizedPage = Number.isFinite(page) && page > 0 ? page : 1;

navigateTo({
  path: '/tool',
  query: normalizedPage > 1 ? { page: String(normalizedPage) } : {},
}, { replace: true });
</script>

<style scoped>
.tool-page-redirect {
  display: none;
}
</style>
