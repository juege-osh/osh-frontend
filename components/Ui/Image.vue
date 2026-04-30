<template>
    <img :src="imageSrc" v-bind="$attrs" @error="handleImageError" :style="{ 'object-fit':objectFit }" loading="lazy"/>
</template>
<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    src: String,
    objectFit: {
        type: String,
        default: "cover"
    }
})

// 默认占位图 - 使用本地静态图片或纯色背景
const defaultImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400'%3E%3Crect width='300' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%239ca3af'%3E暂无图片%3C/text%3E%3C/svg%3E"

const hasError = ref(false)

// 计算实际显示的图片地址
const imageSrc = computed(() => {
    if (hasError.value) {
        return defaultImage
    }
    
    if (!props.src || props.src.trim() === '' || props.src === 'null' || props.src === 'undefined') {
        return defaultImage
    }
    
    // 如果是相对路径，不做处理，让浏览器自己解析
    return props.src
})

const handleImageError = (e) => {
    hasError.value = true
    e.target.src = defaultImage
}

// 监听src变化，重置错误状态
watch(() => props.src, () => {
    hasError.value = false
})
</script>