<!-- <template>
  <div class="w-60 h-60 bg-blue-500 text-white flex items-center justify-center text-2xl">
    Windicss 生效测试 ✅
  </div>
</template> -->
<template>
  <NConfigProvider inline-theme-disabled>
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </NConfigProvider>
</template>
<script setup>
import {
 NConfigProvider
} from "naive-ui"

//测试故全局错误界面
// throwError("故意报错")

</script>
<style>
.btn {
  @apply text-purple-600 border !border-purple-600 px-[20px] py-[10px] !rounded-full hover:( bg-purple-600 !text-white);
}
</style>