<template>
    <!-- 保留原有组件逻辑，仅调整样式类名 -->
    <n-carousel 
        show-arrow 
        class="banner-carousel mb-6"
        trigger="hover"
        autoplay
        autoplay-interval="3000"
        dots-placement="bottom"
    >
        <img 
            v-for="(item,index) in data" 
            :key="index"
            class="carousel-img rounded-lg cursor-pointer"
            :src="item.src"
            @click="open(item)"
        >
    </n-carousel>
</template>

<script setup>
import { NCarousel } from "naive-ui"

// 保留原有 props 定义
defineProps({
    data: Array
})

// 保留原有点击逻辑
const open = (item)=>{
    if(item.type == "webview"){
        window.open(item.url)
    }
}
</script>

<style scoped>
/* 优化轮播图容器样式 */
.banner-carousel {
  width: 100%;
  max-width: 1280px; /* 限制最大宽度，避免拉伸过宽 */
  margin: 0 auto 24px; /* 居中+合理的底部间距，替换 mb-6 的 1.5rem */
  border-radius: 12px; /* 更圆润的圆角 */
  overflow: hidden; /* 防止图片溢出圆角 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* 轻微阴影，提升质感 */
}

/* 优化轮播图图片样式 */
.carousel-img {
  width: 100%;
  height: 420px; /* 适度加高，视觉更协调 */
  object-fit: cover; /* 保留原有图片裁剪逻辑 */
  transition: transform 0.3s ease; /* 鼠标悬浮轻微放大效果 */
}

/* 鼠标悬浮图片轻微放大，提升交互感 */
.carousel-img:hover {
  transform: scale(1.01);
}

/* 优化箭头按钮样式（覆盖 naive-ui 默认样式） */
:deep(.n-carousel-arrow) {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  color: #333;
  opacity: 0.7;
  transition: all 0.2s ease;
}

/* 箭头 hover 效果 */
:deep(.n-carousel-arrow:hover) {
  opacity: 1;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 优化指示器样式 */
:deep(.n-carousel-dot) {
  width: 12px;
  height: 12px;
  margin: 0 6px;
  background-color: rgba(255, 255, 255, 0.5);
}

:deep(.n-carousel-dot-active) {
  background-color: #ffffff;
  width: 24px;
  border-radius: 6px; /* 激活态改为椭圆，更美观 */
}
</style>