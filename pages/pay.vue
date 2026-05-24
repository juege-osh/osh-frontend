<template>
    <div class="pay-page-container">
        <n-card class="card-container">
            <ClientOnly>
                <n-alert v-if="ispay" title="支付成功" type="success" class="alert-success">
                    正在跳转...
                </n-alert>
                <n-alert v-else-if="isTimeOut" title="支付已超时" type="error" class="alert-error">
                    请刷新页面重新支付
                </n-alert>
                <h4 class="title-large">微信支付</h4>
                <p class="text-sm text-gray-500 flex time-info">
                    距离二维码过期还剩 <TimeBox 
                    class="text-rose-500 time-text" 
                    :expire="30" 
                    @end="handleTimeOut"/> ，过期后请刷新页面重新获取
                </p>
                <h5 class="flex justify-center py-5 payment-amount">
                    支付总额：
                    <Price :value="displayPrice"/>
                </h5>
                <!-- 二维码组件 -->
                <QrCode :data="data.qrcode" v-if="data.qrcode"/>
                <div class="flex justify-center items-center py-4 text-green-500 scan-instructions">
                    <n-icon :size="35">
                        <ScanCircleOutline/>
                    </n-icon>
                    <div class="ml-3 text-gray-500 text-sm instruction-text">
                        <p>请使用微信扫一扫</p>
                        <p>扫描二维码支付</p>
                    </div>
                </div>
            </ClientOnly>
        </n-card>
    </div>
</template>
<script setup>
    import {
        NCard,
        NAlert,
        NIcon
    } from "naive-ui"

    import {
        ScanCircleOutline
    } from "@vicons/ionicons5"

    // // 模拟响应结果
    // const data = {
    //     "price": "10.00", 
    //     "code_url": "weixin://wxpay/bizpayurl?pr=QdPmZtyzz" 
    // }

    const route = useRoute()
    const { no, type, name, price, activityId } = route.query

    // 计算显示价格：优先使用接口返回的 price，其次使用 URL 参数
    const displayPrice = computed(() => {
        // 拼团支付：接口返回的数据结构是 data.data，需要取内层
        if (type === 'group') {
            return data.value?.data?.price || data.value?.price || price || 0
        }
        // 普通支付：直接取 data.price
        return data.value?.price || price || 0
    })

    // 支付超时
    const isTimeOut = ref(false)
    function handleTimeOut(){
        isTimeOut.value = true
    }

    // 开始轮询订单状态
    const ispay = ref(false)
    const timer = ref(null)
    
    // 发起微信支付（根据类型调用不同接口）
    const {
        data,
        error
    } = await (type === 'group' 
        ? useJoinGroupPaymentApi({ 
            orderNo: no, 
            payMethod: 'wechat', 
            name: name || '拼团支付' 
        })
        : useWxpayApi(no))
    
    function checkIspay(){
        if(timer.value) clearInterval(timer.value)
        timer.value = setInterval(() => {
            // 根据类型调用不同的状态查询接口
            const checkApi = type === 'group' 
                ? useGetOrderStatusApi(no) 
                : useGetWxpayStatusApi(no)
            
            checkApi.then(res=>{
                // 拼团订单：payStatus === true 表示已支付成功
                // 普通订单：trade_state === "SUCCESS" 表示已支付
                const isPaid = type === 'group' 
                    ? (!res.error.value && res.data.value?.payStatus === true)
                    : (!res.error.value && res.data.value?.trade_state === "SUCCESS")
                
                if(isPaid){
                    handleSuccess()
                }
            })
        }, 2000);
    }

    if(!error.value){
        checkIspay()
    }

// 支付成功处理
function handleSuccess(){
    ispay.value = true
    if(timer.value) clearInterval(timer.value)
    setTimeout(() => {
        // 拼团支付成功后跳转回拼团详情页，并带上 refresh 参数
        if (type === 'group' && activityId) {
            navigateTo(`/group/work/${activityId}?refresh=true`, { replace: true })
        } else {
            navigateTo("/user/buy/1", { replace: true })
        }
    }, 2000);
}
</script>
<style>
.pay-page-container {
  display: flex;
  justify-content: center;
}

.card-container {
  width: 450px;
  margin-bottom: 2.5rem;
}

.alert-success {
  margin-bottom: 0.5rem;
}

.alert-error {
  margin-bottom: 0.5rem;
}

.title-large {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-500 {
  color: #6b7280;
}

.flex {
  display: flex;
}

.text-rose-500 {
  color: #f43f5e;
}

.py-5 {
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
}

.justify-center {
  justify-content: center;
}

.payment-amount {
  display: flex;
  justify-content: center;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
}

.text-green-500 {
  color: #22c55e;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.items-center {
  align-items: center;
}

.scan-instructions {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 1rem;
  padding-bottom: 1rem;
  color: #22c55e;
}

.ml-3 {
  margin-left: 0.75rem;
}

.instruction-text {
  margin-left: 0.75rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.time-info {
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
}

.time-text {
  color: #f43f5e;
}
</style>