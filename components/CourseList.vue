<template>
    <n-card class="course-card" footer-style="padding:0;" @click="open">
        <template #cover>
            <UiImage :src="item.cover" class="card-cover"/>
        </template>
        <div class="card-title">
            <span class="title-text">{{ item.title }}</span>
        </div>
        <div class="card-price">
            <Price :value="item.price"/>
            <Price :value="item.t_price" through class="price-through"/>
        </div>
        <template #footer v-if="item.group_id || item.flashsale_id">
            <ClientOnly>
                <div class="activity-tag">
                    {{ item.group_id ? '拼团中' : '秒杀中' }}
                    <div class="countdown-wrapper">
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
const props = defineProps({
    item:Object
})

const open = ()=>{
    let path = ""
    // 课程详情
    if(["course","media","audio","video"].includes(props.item.type)){
        path = `/detail/course/${props.item.id}`
    }
    // 专栏详情
    else if(props.item.type == "column"){
        path = `/detail/column/${props.item.id}`
    }
    // 直播详情
    else if(props.item.type == "live"){
        path = `/detail/live/${props.item.id}`
    }

    // 秒杀和拼团
    if(props.item.group_id){
        path = `${path}?group_id=${props.item.group_id}`
    }
    if(props.item.flashsale_id){
        path = `${path}?flashsale_id=${props.item.flashsale_id}`
    }

    navigateTo(path)
}
</script>
<style scoped>
.course-card {
    cursor: pointer;
    margin-bottom: 1.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: none !important;
}

.card-cover {
    width: 100%;
    height: 150px;
}

.card-title {
    padding-top: 0.5rem;
}

.title-text {
    font-weight: 700;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.card-price {
    display: flex;
    align-items: flex-end;
    margin-top: 0.5rem;
}

.price-through {
    margin-left: 0.5rem;
}

.activity-tag {
    background-color: #f59e0b;
    color: white;
    padding: 0.75rem;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    border-bottom-right-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
}

.countdown-wrapper {
    margin-left: auto;
    display: flex;
    align-items: center;
}
</style>