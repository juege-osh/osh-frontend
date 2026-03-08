<template>
    <n-card class="course-card" footer-style="padding:0;">
        <template #cover>
            <UiImage :src="item.cover" class="course-cover"/>
        </template>
        <div class="course-content">
            <span class="course-title">{{ item.title }}</span>
        </div>
        <div class="course-price-container">
            <Price :value="item.price"/>
            <Price :value="item.t_price" through class="original-price"/>
        </div>
        <template #footer v-if="item.group_id || item.flashsale_id">
            <ClientOnly>
                <div class="promotion-banner">
                    {{ item.group_id ? '拼团中' : '秒杀中' }}
                    <div class="countdown-container">
                        倒计时
                        <CountDown :time="item.end_time"/>
                    </div>
                </div>
            </ClientOnly>
        </template>
    </n-card>
</template>
<script setup>
import {
    NCard
} from "naive-ui"
defineProps({
    item:Object
})
</script>

<style scoped>
.course-card {
    cursor: pointer;
    margin-bottom: 1.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: none;
}

.course-cover {
    width: 100%;
    height: 150px;
}

.course-content {
    padding-top: 0.5rem;
}

.course-title {
    font-weight: bold;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 600;
}

.course-price-container {
    margin-top: 0.5rem;
    display: flex;
    align-items: flex-end;
}

.original-price {
    margin-left: 0.5rem;
}

.promotion-banner {
    background-color: #f59e0b;
    color: white;
    padding: 0.75rem;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    border-bottom-left-radius: 0.25rem;
    border-bottom-right-radius: 0.25rem;
}

.countdown-container {
    margin-left: auto;
    display: flex;
    align-items: center;
}
</style>