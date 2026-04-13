<template>
  <NConfigProvider inline-theme-disabled>
    <NMessageProvider>
      <NDialogProvider>
        <NuxtLayout>
          <NuxtPage/>
        </NuxtLayout>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
<script setup>
import { NMessageProvider, NDialogProvider } from 'naive-ui'
</script>

<style>
</style>