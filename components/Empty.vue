<template>
     <n-empty :description="desc" size="large" class="empty-container"></n-empty>
</template>
<script setup>
import {
    NEmpty
} from "naive-ui"
defineProps({
    desc:{
        type:String,
        default:"暂无数据"
    }
})
</script>

<style scoped>
.empty-container {
  padding: 2.5rem 0;
}
</style>