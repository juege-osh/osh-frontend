<template>
    <div class="pay-page-container">
        <n-card class="card-container">
            <ClientOnly>
                <!-- 支付成功提示 -->
                <n-alert v-if="ispay" title="支付成功" type="success" class="alert-success">
                    正在跳转...
                </n-alert>
                
                <!-- 支付超时提示 -->
                <n-alert v-else-if="isTimeOut" title="支付已超时" type="error" class="alert-error">
                    请刷新页面重新支付
                </n-alert>
                
                <template v-else>
                    <h4 class="title-large">微信支付</h4>
                    <p class="text-sm text-gray-500 flex time-info">
                        距离二维码过期还剩 <TimeBox 
                        class="text-rose-500 time-text" 
                        :expire="30" 
                        @end="handleTimeOut"/> ，过期后请刷新页面重新获取
                    </p>
                    <h5 class="flex justify-center py-5 payment-amount">
                        支付总额：
                        <Price :value="money || priceFromApi || 0"/>
                    </h5>
                    
                    <!-- 二维码组件 -->
                    <QrCode :data="qrcodeUrl" v-if="qrcodeUrl"/>
                    
                    <!-- 二维码加载提示 -->
                    <div v-if="!qrcodeUrl && !error" class="flex justify-center py-5">
                        <n-spin size="large" description="正在生成支付二维码..." />
                    </div>
                    
                    <div class="flex justify-center items-center py-4 text-green-500 scan-instructions">
                        <n-icon :size="35">
                            <ScanCircleOutline/>
                        </n-icon>
                        <div class="ml-3 text-gray-500 text-sm instruction-text">
                            <p>请使用微信扫一扫</p>
                            <p>扫描二维码支付</p>
                        </div>
                    </div>
                </template>
            </ClientOnly>
        </n-card>
    </div>
</template>
<script setup>
    import {
        NCard,
        NAlert,
        NIcon,
        NSpin
    } from "naive-ui"

    import {
        ScanCircleOutline
    } from "@vicons/ionicons5"

    const route = useRoute()
    const { no, name, money } = route.query

    // 支付相关状态
    const ispay = ref(false)
    const isTimeOut = ref(false)
    const qrcodeUrl = ref('')
    const outTradeNo = ref('')
    const timer = ref(null)
    const error = ref(null)
    const priceFromApi = ref(0) // 从 API 获取的价格

    // 1. 处理订单号（拼团订单已创建，直接使用）
    async function handleExistingOrder() {
        // 如果URL中已经有订单号 no（拼团参团时传入的order_no）
        if (no) {
            console.log('使用已有订单号:', no)
            outTradeNo.value = no
            // 直接使用已有订单号获取支付二维码
            await getPaymentQrcode(no)
            return
        }
        
        // 否则创建新订单（课程购买等场景）
        await createPaymentOrder()
    }

    // 2. 获取支付二维码（使用已有订单号）
    async function getPaymentQrcode(orderNo) {
        try {
            // 判断是否为拼团订单（根据订单号前缀或URL参数）
            const isGroupOrder = orderNo.startsWith('GP') || route.query.type === 'group'
            
            let result
            if (isGroupOrder) {
                // 拼团订单使用专用支付接口，必须传递 name 参数
                console.log('使用拼团支付接口:', orderNo)
                result = await useJoinGroupPaymentApi({
                    orderNo: orderNo,
                    payMethod: 'wechat',
                    name: name || '拼团支付'  // 使用URL中的name参数
                })
            } else {
                // 普通订单使用通用支付接口
                console.log('使用通用支付接口:', orderNo)
                result = await useWxpayApi(orderNo)
            }
            
            if (result.error.value) {
                error.value = result.error.value
                return
            }
            
            const data = result.data.value
            
            // 拼团支付接口返回的 payUrl 是 JSON 字符串，需要解析提取 qrcode 字段
            let payUrl = ''
            
            if (data.payUrl) {
                // payUrl 是 JSON 字符串，需要解析
                if (typeof data.payUrl === 'string') {
                    try {
                        const parsed = JSON.parse(data.payUrl)
                        console.log('解析 payUrl JSON:', parsed)
                        
                        // 提取 qrcode 字段（这才是真正的支付链接）
                        if (parsed.qrcode) {
                            payUrl = parsed.qrcode
                            console.log('从 payUrl 中提取到 qrcode:', payUrl)
                        } else if (parsed.code_url || parsed.codeUrl) {
                            payUrl = parsed.code_url || parsed.codeUrl
                        } else {
                            // 如果没有 qrcode，使用整个 payUrl
                            payUrl = data.payUrl
                            console.warn('payUrl 中没有 qrcode 字段，使用原始值')
                        }
                    } catch (e) {
                        // 解析失败，直接使用 payUrl
                        payUrl = data.payUrl
                        console.warn('payUrl 不是有效的 JSON，直接使用:', payUrl)
                    }
                } else {
                    // payUrl 不是字符串，直接使用
                    payUrl = data.payUrl
                }
            }
            
            // 如果没有 payUrl，尝试其他字段
            if (!payUrl) {
                payUrl = data.qrcode || data.code_url || data.codeUrl || ''
            }
            
            // 保存二维码URL
            qrcodeUrl.value = payUrl
            
            // 如果有返回价格，保存下来
            if (data.price || data.amount || data.money) {
                priceFromApi.value = data.price || data.amount || data.money
            }
            
            // 调试：打印最终使用的二维码URL
            if (process.client) {
                console.log('=== 支付二维码调试 ===')
                console.log('原始 data:', data)
                console.log('最终 payUrl:', payUrl)
                console.log('qrcodeUrl:', qrcodeUrl.value)
            }
            
            // 开始轮询支付状态
            if (outTradeNo.value) {
                startPollingPaymentStatus()
            }
        } catch (err) {
            console.error('获取支付二维码失败:', err)
            error.value = err
        }
    }

    // 3. 创建支付订单，获取二维码（用于课程购买等场景）
    async function createPaymentOrder() {
        try {
            const result = await useCreatePaymentApi(
                name || '课程支付',
                money || '0.00'
            )

            if (result.error.value) {
                error.value = result.error.value
                return
            }

            const data = result.data.value
            
            // 保存二维码URL和订单号
            qrcodeUrl.value = data.qrcode || data.code_url || ''
            outTradeNo.value = data.out_trade_no || data.trade_no || ''

            // 如果成功获取到订单号，开始轮询支付状态
            if (outTradeNo.value) {
                startPollingPaymentStatus()
            }
        } catch (err) {
            console.error('创建支付订单失败:', err)
            error.value = err
        }
    }

    // 2. 开始轮询支付状态（每3秒查询一次）
    function startPollingPaymentStatus() {
        if (timer.value) clearInterval(timer.value)
        
        timer.value = setInterval(async () => {
            if (!outTradeNo.value) return

            try {
                const result = await useGetPaymentStatusApi(outTradeNo.value)
                
                if (!result.error.value && result.data.value) {
                    // payStatus === true 表示已支付
                    if (result.data.value.payStatus === true) {
                        handleSuccess()
                    }
                    // payStatus === false 继续等待
                }
            } catch (err) {
                console.error('查询支付状态失败:', err)
            }
        }, 3000) // 每3秒轮询一次
    }

    // 3. 支付超时处理
    function handleTimeOut() {
        isTimeOut.value = true
        stopPolling()
    }

    // 4. 停止轮询
    function stopPolling() {
        if (timer.value) {
            clearInterval(timer.value)
            timer.value = null
        }
    }

    // 5. 支付成功处理
    function handleSuccess() {
        ispay.value = true
        stopPolling()
        
        // 显示成功提示
        const { message } = createDiscreteApi(["message"])
        message.success('支付成功！正在跳转...')
        
        // 2秒后跳转
        setTimeout(() => {
            // 判断是否为拼团订单
            const isGroupOrder = outTradeNo.value.startsWith('GP') || route.query.type === 'group'
            
            if (isGroupOrder) {
                // 拼团订单：跳转到拼团详情页（服务器配置页面）
                const activityId = route.query.activityId
                if (activityId) {
                    navigateTo(`/group/work/${activityId}`, { replace: true })
                } else {
                    // 如果没有 activityId，跳转到拼团列表页
                    navigateTo('/group/index', { replace: true })
                }
            } else {
                // 普通订单：跳转到购买记录页面
                navigateTo("/user/buy/1", { replace: true })
            }
        }, 2000)
    }

    // 页面加载时处理订单
    if (process.client) {
        handleExistingOrder()
    }

    // 页面销毁时清理定时器
    onUnmounted(() => {
        stopPolling()
    })
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