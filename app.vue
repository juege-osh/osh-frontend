<template>
    <NConfigProvider inline-theme-disabled>
      <NMessageProvider>
          <NuxtLayout>
            <NuxtPage/>
          </NuxtLayout>
      </NMessageProvider>
    </NConfigProvider>
</template>
<script setup>
import {
  NConfigProvider,
  NMessageProvider,
} from "naive-ui"
</script>

<style>
</style>