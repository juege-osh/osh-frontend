<template>
    <ClientOnly>
        <n-popover :width="450" trigger="click" placement="right">
            <template #trigger>
                <n-button strong secondary type="warning" size="tiny">
                    领取优惠券
                </n-button>
            </template>
            <div class="coupon-modal-content">
                <h4 class="coupon-modal-title">可用优惠券({{ data.length }})</h4>
                <n-scrollbar style="height: 300px;">
                    <CouponList v-for="(item,index) in data" :key="index" :item="item"/>
                </n-scrollbar>
            </div>
        </n-popover>
    </ClientOnly>
</template>
<script setup>
    import {
        NPopover,
        NButton,
        NScrollbar
    } from "naive-ui"
    
    // 临时注释优惠券API调用
    // const {
    //     data
    // } = await useCouponListApi()
    
    // 使用空数据代替
    const data = ref([])
</script>

<style scoped>
.coupon-modal-content {
    padding: 0.5rem;
}

.coupon-modal-title {
    font-size: 1.125rem;
    font-weight: bold;
    margin-bottom: 0.75rem;
}
</style>