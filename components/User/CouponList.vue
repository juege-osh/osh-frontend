<template>
    <n-card class="coupon" :class="{ 'coupon-disabled': (btn != '立即使用')}">
        <h4 class="coupon-price">￥{{ item.price }}</h4>
        <p class="coupon-info">适用{{ o[item.type] }}：{{ item.title }}</p>
        <p class="coupon-date">有效期：{{ item.start_time }} ~ {{ item.end_time }}</p>
        <template #footer>
            <div class="coupon-footer">
                <n-button :type="btn != '立即使用' ? '' : 'warning'"
                :disabled="btn != '立即使用'"
                @click="open">
                    {{ btn }}
                </n-button>
            </div>
        </template>
    </n-card>
</template>
<script setup>
import {
    NCard,
    NButton
} from "naive-ui"

const o = {
    course:"课程",
    column:"专栏"
}

const props = defineProps({
    item:Object
})

const btn = computed(()=>{
    const v = props.item
    v.expired = (new Date(v.end_time)).getTime() < (new Date()).getTime()
    return v.used ? '已使用' : (v.expired ? '已过期' : '立即使用')
})

const open = ()=>{
    const { item } = props
    navigateTo(`/createorder?id=${item.goods_id}&type=${item.type}`)
}

</script>
<style>
.coupon {
    margin-bottom: 1.25rem;
    background-color: #f97316;
    border: none !important;
}
.coupon h4 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    font-weight: bold;
    color: white;
}
.coupon p{
    font-size: 0.875rem;
    color: #d1d5db;
}
.coupon .coupon-date {
    font-size: 0.75rem;
    margin-top: 0.75rem;
}
.coupon .coupon-footer {
    display: flex;
    justify-content: flex-end;
}
.coupon-disabled {
    background-color: #d1d5db !important;
}
</style>