<template>
    <UiCard>
        <UiCardHeader class="order-header">
            <span>订单时间：{{ item.created_time }}</span>
            <span>订单号：{{ item.no }}</span>
        </UiCardHeader>
        <UiCardBody class="order-body">{{ item.goods }}</UiCardBody>
        <UiCardFooter class="order-footer">
            <span v-if="item.type != 'default'" class="order-type">[{{ t[item.type] }}]</span>
            <Price :value="item.price"/>
            <span class="order-status ml-auto" :class="{ 'status-success':(item.status === 'success') }">
                {{ s[item.status] }}
            </span>
            <n-button type="primary" size="small" class="pay-button" v-if="item.status === 'pendding'" @click="pay">
                立即支付
            </n-button>
        </UiCardFooter>
    </UiCard>
</template>

<script setup>
import {
    NButton
} from "naive-ui"
const props = defineProps({
    item:Object
})

const s = {
    closed:"已关闭",
    success:"支付成功",
    pendding:"等待支付",
    grouping:"拼团中"
}

const t = {
    group:"拼团",
    flashsale:"秒杀"
}

const pay = ()=>{
    navigateTo(`/pay?no=${props.item.no}`)
}

</script>

<style scoped>
.order-header {
  display: flex;
  justify-content: space-between;
}

.order-body {
  
}

.order-footer {
  display: flex;
  justify-content: flex-start;
}

.ml-auto {
  margin-left: auto;
}

.order-status {
  /* Default color for order status */
}

.status-success {
  color: #10b981; /* equivalent to text-green-600 */
}

.pay-button {
  margin-left: 0.75rem; /* equivalent to ml-3 */
}

.order-type {
  
}
</style>