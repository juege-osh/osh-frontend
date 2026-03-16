<template>
    <LoadingGroup :pending="pending" :error="error">
        <n-card class="createorder">
            <h4 class="product-info-title">产品信息</h4>
            <div class="product-flex-container mb-5">
                <n-image :src="data.cover"
                    class="rounded flex-shrink-0 " 
                    :class="type == 'book' ? 'book-cover-dimensions' : 'other-cover-dimensions'"/>
                <div class="info-flex-container ml-4">
                    <h5 class="info-flex text-gray-600 text-xl">
                        {{ data.title }}
                        <Price :value="data.price" class="ml-auto" />
                    </h5>
                    <div class="mt-auto" v-if="type == 'course'">
                        <n-tag :bordered="false" size="small">
                            {{ t[data.type] }}
                        </n-tag>
                    </div>
                </div>
            </div>
            <h4 class="coupon-title">优惠券</h4>
            <n-grid :x-gap="20" :cols="4" class="mb-3">
                <n-grid-item v-for="(item,index) in couponData.rows" :key="index">
                    <n-button strong secondary 
                    :type="user_coupon_id == item.id ? 'warning' : 'tertiary'"
                    @click="chooseCoupon(item)">
                    ￥{{ item.price }} 优惠券
                    </n-button>
                </n-grid-item>
            </n-grid>
            <div v-if="couponData.count == 0" class="no-coupon-text mb-5">
                暂无优惠券
            </div>
            <h4 class="payment-method-title">支付方式</h4>
            <div class="payment-flex-container mb-5">
                <span class="wxpay">
                    <n-icon>
                        <LogoWechat />
                    </n-icon>
                    <b>微信支付</b>
                </span>
            </div>

            <div class="payment-info-flex mb-5">
                <small class="time-warning mr-auto">请在30分钟内完成支付</small>
                <span v-if="user_coupon_id">优惠券已抵扣 <b class="text-red-500">{{ coupon_price }}</b>元，</span>
                需支付<Price :value="price" />
            </div>

            <div class="submit-btn-container">
                <n-button type="primary" @click="submit" :loading="loading">确认支付</n-button>
            </div>

        </n-card>
    </LoadingGroup>
</template>
<script setup>
import {
    NCard,
    NTag,
    NImage,
    NIcon,
    NButton,
    NGrid,
    NGridItem
} from "naive-ui"
import {
    LogoWechat
} from "@vicons/ionicons5"

const t = {
    media:"图文",
    audio:"音频",
    video:"视频",
    column:"专栏",
    book:"电子书",
    course:"课程"
}

const route = useRoute()
const { id, type } = route.query

// 获取产品信息
const {
    data,
    pending,
    error
} = await useGetGoodsInfoApi(id, type)

// 获取可用优惠券
const {
    data: couponData
} = await useGetUseableUserCouponApi(id, type)

// 选中优惠券
const user_coupon_id = ref(0)
const chooseCoupon = (item)=>{
    user_coupon_id.value = user_coupon_id.value == item.id ? 0 : item.id
}

// 优惠券价格
const coupon_price = computed(()=>{
    if(user_coupon_id.value == 0) return 0
    let c = couponData.value.rows.find(o=>o.id == user_coupon_id.value)
    return c ? c.price : 0
})

// 最终价格
const price = computed(()=>{
    let p = ((data.value.price * 1000 - coupon_price.value * 1000) / 1000).toFixed(2)
    return p <= 0 ? 0 : p
})


// 创建订单并发起支付
const loading = ref(false)
async function submit(){
    loading.value = true

    let d = {}

    if(type == "course" || type == "column" || type == "book"){
        d = {
            goods_id:data.value.id,
            type
        }
        if(user_coupon_id.value){
            d.user_coupon_id = user_coupon_id.value
        }
    }

    let {
        data:createOrderResult,
        error:createOrderError
    } = await useCreateOrderApi(d)

    loading.value = false

    if(createOrderError.value) return

    navigateTo(`/pay?no=${createOrderResult.value.no}`,{ replace:true })

}

definePageMeta({
    middleware:["auth","createorder"]
})

</script>
<style>
.mb-5 {
  margin-bottom: 1.25rem;
}

.ml-auto {
  margin-left: auto;
}

.mt-auto {
  margin-top: auto;
}

.ml-4 {
  margin-left: 1rem;
}

.mr-auto {
  margin-right: auto;
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.w-\[100px\] {
  width: 100px;
}

.h-\[140px\] {
  height: 140px;
}

.w-\[180px\] {
  width: 180px;
}

.h-\[100px\] {
  height: 100px;
}

.flex {
  display: flex;
}

.flex-1 {
  flex: 1 1 0%;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

.items-center {
  align-items: center;
}

.justify-end {
  justify-content: flex-end;
}

.rounded {
  border-radius: 0.25rem;
}

.border {
  border-width: 1px;
}

.text-gray-600 {
  --tw-text-opacity: 1;
  color: rgba(75, 85, 99, var(--tw-text-opacity));
}

.text-red-500 {
  --tw-text-opacity: 1;
  color: rgba(239, 68, 68, var(--tw-text-opacity));
}

.text-gray-400 {
  --tw-text-opacity: 1;
  color: rgba(156, 163, 175, var(--tw-text-opacity));
}

/* Custom styles for elements that had Tailwind classes */
.product-flex-container {
  display: flex;
  margin-bottom: 1.25rem;
}

.info-flex-container {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.info-flex {
  display: flex;
  color: #4b5563;
  font-size: 1.25rem;
  line-height: 1.75rem;
}

.product-info-title {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #4b5563;
}

.coupon-title {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #4b5563;
}

.payment-method-title {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #4b5563;
}

.book-cover-dimensions {
  width: 100px;
  height: 140px;
}

.other-cover-dimensions {
  width: 180px;
  height: 100px;
}

.payment-flex-container {
  display: flex;
  margin-bottom: 1.25rem;
}

.wxpay {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #10b981;
  border-radius: 0.25rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #047857;
  width: 120px;
}

.payment-info-flex {
  display: flex;
  align-items: center;
  margin-bottom: 1.25rem;
}

.time-warning {
  color: #ef4444;
  margin-right: auto;
}

.no-coupon-text {
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 1.25rem;
}

.submit-btn-container {
  display: flex;
  justify-content: flex-end;
}

.createorder {
  margin-bottom: 1.25rem;
}

.createorder h4 {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #4b5563;
}

.createorder .wxpay {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #10b981;
  border-radius: 0.25rem;
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #047857;
  width: 120px;
}
</style>