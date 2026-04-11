<template>
  <n-message-provider>
    <NConfigProvider inline-theme-disabled>
          <NuxtLayout>
            <NuxtPage/>
          </NuxtLayout>
    </NConfigProvider>
  </n-message-provider>
</template>
<script setup>
import {
  NConfigProvider,
  NMessageProvider
} from "naive-ui"
</script>

<style>
</style>