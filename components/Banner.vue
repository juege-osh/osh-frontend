<template>
    <div class="banner-wrapper">
        <n-carousel 
            show-arrow 
            class="banner-carousel"
            trigger="hover"
            autoplay
            :autoplay-interval="4000"
            dots-placement="bottom"
        >
            <div 
                v-for="(item,index) in data" 
                :key="index"
                class="banner-slide"
                @click="open(item)"
            >
                <img :src="item.src" alt="" class="banner-image">
            </div>
        </n-carousel>
    </div>
</template>

<script setup>
import { NCarousel } from "naive-ui"

defineProps({
    data: Array
})

const open = (item) => {
    if(item.type == "webview"){
        window.open(item.url)
    }
}
</script>

<style scoped>
.banner-wrapper {
    margin-bottom: var(--space-2xl);
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-md);
}

.banner-carousel {
    width: 100%;
    height: 400px;
}

.banner-slide {
    width: 100%;
    height: 400px;
    cursor: pointer;
    overflow: hidden;
}

.banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.banner-slide:hover .banner-image {
    transform: scale(1.02);
}

:deep(.n-carousel-arrow) {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    color: var(--color-text-primary);
    opacity: 0;
    transition: all 0.2s ease;
}

.banner-wrapper:hover :deep(.n-carousel-arrow) {
    opacity: 1;
}

:deep(.n-carousel-arrow:hover) {
    background: white;
    box-shadow: var(--shadow-md);
}

:deep(.n-carousel-dot) {
    width: 8px;
    height: 8px;
    margin: 0 4px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    transition: all 0.3s ease;
}

:deep(.n-carousel-dot-active) {
    width: 24px;
    background: white;
}

@media (max-width: 992px) {
    .banner-carousel,
    .banner-slide {
        height: 300px;
    }
}

@media (max-width: 640px) {
    .banner-carousel,
    .banner-slide {
        height: 200px;
    }
}
</style>
