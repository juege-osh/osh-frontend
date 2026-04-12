<!-- <template>
  <div class="w-60 h-60 bg-blue-500 text-white flex items-center justify-center text-2xl">
    Windicss 生效测试 ✅
  </div>
</template> -->
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
.btn {
  @apply text-purple-600 border !border-purple-600 px-[20px] py-[10px] !rounded-full hover:( bg-purple-600 !text-white);
}
</style>