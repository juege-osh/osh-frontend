<template>
    <div class="pay-page-container">
        <n-card class="card-container">
            <ClientOnly>
                <!-- 支付成功提示 -->
                <div v-if="ispay" class="success-container">
                    <div class="success-animation">
                        <n-icon :size="80" color="#52c41a" class="success-icon">
                            <CheckmarkCircleOutline />
                        </n-icon>
                        <h3 class="success-title">支付成功！</h3>
                        <p class="success-text">正在返回拼团详情...</p>
                    </div>
                </div>
                
                <!-- 支付超时提示 -->
                <div v-else-if="isTimeOut" class="timeout-container">
                    <n-alert title="支付已超时" type="error" class="alert-error">
                        <p>订单已超时，请返回重新参团</p>
                        <n-button type="primary" @click="handleRetry" class="mt-3">
                            返回拼团详情
                        </n-button>
                    </n-alert>
                </div>
                
                <template v-else>
                    <!-- 订单信息 -->
                    <div class="order-info-section">
                        <h4 class="order-title">订单信息</h4>
                        <div class="order-details">
                            <div class="order-row">
                                <span class="order-label">订单号：</span>
                                <span class="order-value">{{ outTradeNo || '加载中...' }}</span>
                            </div>
                            <div class="order-row" v-if="route.query.name">
                                <span class="order-label">活动名称：</span>
                                <span class="order-value">{{ route.query.name }}</span>
                            </div>
                            <div class="order-row">
                                <span class="order-label">支付金额：</span>
                                <span class="order-price">
                                    <Price :value="parseFloat(route.query.price) || money || priceFromApi || 0" />
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 支付标题和倒计时 -->
                    <div class="payment-header">
                        <h4 class="title-large">微信支付</h4>
                        <p class="time-info">
                            <n-icon :size="16" color="#ff4d4f">
                                <TimeOutline />
                            </n-icon>
                            距离二维码过期还剩 
                            <TimeBox 
                                class="time-text" 
                                :expire="30" 
                                @end="handleTimeOut"/>
                            ，过期后请刷新页面重新获取
                        </p>
                    </div>
                    
                    <!-- 二维码组件 -->
                    <div class="qrcode-section">
                        <QrCode :data="qrcodeUrl" v-if="qrcodeUrl" class="qrcode-component"/>
                        
                        <!-- 二维码加载提示 -->
                        <div v-if="!qrcodeUrl && !error" class="qrcode-loading">
                            <n-spin size="large" description="正在生成支付二维码..." />
                        </div>
                    </div>
                    
                    <!-- 扫码提示 -->
                    <div class="scan-instructions">
                        <n-icon :size="40" color="#07c160">
                            <ScanCircleOutline/>
                        </n-icon>
                        <div class="instruction-text">
                            <p>请使用微信扫一扫</p>
                            <p>扫描二维码完成支付</p>
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
        NSpin,
        NButton,
        createDiscreteApi
    } from "naive-ui"

    import {
        ScanCircleOutline,
        CheckmarkCircleOutline,
        TimeOutline
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
                
            // 调试：打印完整的响应数据
            if (process.client) {
                console.log('=== 支付接口响应调试 ===')
                console.log('result:', result)
                console.log('result.data.value:', result.data.value)
                console.log('result.error.value:', result.error.value)
            }
                
            // 获取响应数据
            const data = result.data.value
                
            // 检查1：是否有网络错误或HTTP错误
            if (result.error.value) {
                const errorMsg = result.error.value?.data?.msg || result.error.value?.message || ''
                const errorCode = result.error.value?.data?.code
                    
                console.log('支付接口返回HTTP错误:', errorMsg, 'code:', errorCode)
                    
                // 检查是否是"已完成支付"的错误
                if (errorMsg.includes('已完成支付') || errorMsg.includes('请勿重复')) {
                    console.log('订单已完成支付，直接跳转到拼团详情页')
                        
                    // 显示成功提示
                    const { message } = createDiscreteApi(["message"])
                    message.success('订单已完成支付，正在返回拼团详情...')
                        
                    // 延迟跳转
                    setTimeout(() => {
                        const activityId = route.query.activityId
                        console.log('跳转到拼团详情页，activityId:', activityId)
                            
                        if (activityId) {
                            navigateTo(`/group/work/${activityId}?refresh=true`, { replace: true })
                                .then(() => console.log('跳转成功'))
                                .catch(err => console.error('跳转失败:', err))
                        } else {
                            console.warn('未找到 activityId，跳转到拼团列表页')
                            navigateTo('/group/index', { replace: true })
                        }
                    }, 1500)
                    return  // 重要：阻止后续代码执行
                }
                    
                // 其他错误，显示错误信息
                error.value = result.error.value
                const { message } = createDiscreteApi(["message"])
                message.error(errorMsg || '获取支付二维码失败')
                return  // 阻止后续代码执行
            }
                
            // 检查2：data 是否为 null（后端可能返回 {code: 500, data: null}）
            // 注意：useHttp.js 已经修改为：当 data为null 且存在code时，返回整个res
            // 所以这里 data 可能是 {code: 500, msg: "...", data: null}
            if (!data) {
                console.error('支付接口返回的 data 为 null，继续处理')
                // 不阻断，让后面的检查3处理
            }
                        
            // 检查3：检查业务错误码（后端返回 code: 500 但HTTP状态是200）
            // data 可能是 {code: 500, msg: "...", data: null} 或正常的业务数据
            if (data && (data.code === 500 || data.code === 400)) {
                const errorMsg = data.msg || data.message || '业务处理失败'
                console.log('支付接口返回业务错误:', errorMsg, 'code:', data.code)
                            
                // 检查是否是"已完成支付"的错误
                if (errorMsg.includes('已完成支付') || errorMsg.includes('请勿重复')) {
                    console.log('订单已完成支付，直接跳转到拼团详情页')
                                
                    // 显示成功提示
                    const { message } = createDiscreteApi(["message"])
                    message.success('订单已完成支付，正在返回拼团详情...')
                                
                    // 延迟跳转
                    setTimeout(() => {
                        const activityId = route.query.activityId
                        console.log('跳转到拼团详情页，activityId:', activityId)
                                    
                        if (activityId) {
                            navigateTo(`/group/work/${activityId}?refresh=true`, { replace: true })
                                .then(() => console.log('跳转成功'))
                                .catch(err => console.error('跳转失败:', err))
                        } else {
                            console.warn('未找到 activityId，跳转到拼团列表页')
                            navigateTo('/group/index', { replace: true })
                        }
                    }, 1500)
                    return  // 重要：阻止后续代码执行
                }
                            
                // 其他业务错误，显示错误信息
                const { message } = createDiscreteApi(["message"])
                message.error(errorMsg)
                return  // 阻止后续代码执行
            }
                
            // 检查4：data 中是否有 payUrl 或 qrcode 字段（成功的响应）
            if (!data.payUrl && !data.qrcode && !data.code_url) {
                console.warn('支付接口响应中没有二维码信息:', data)
                // 这可能是正常情况，继续处理
            }
                
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
            const { message } = createDiscreteApi(["message"])
            message.error('获取支付二维码失败，请重试')
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

    // 2. 开始轮询支付状态（智能轮询策略）
    function startPollingPaymentStatus() {
        if (timer.value) clearInterval(timer.value)
        
        let pollInterval = 3000  // 初始间隔3秒
        let pollCount = 0
        let consecutiveErrors = 0  // 连续错误计数
        
        // 定义轮询函数（使用具名函数避免 arguments.callee）
        const pollFunction = async () => {
            if (!outTradeNo.value) return
            
            // 页面不可见时跳过查询
            if (process.client && document.hidden) {
                return
            }

            try {
                pollCount++
                
                // 智能调整轮询间隔
                if (pollCount > 6 && pollCount <= 9) {
                    pollInterval = 5000  // 5秒
                    clearInterval(timer.value)
                    timer.value = setInterval(pollFunction, pollInterval)
                } else if (pollCount > 9) {
                    pollInterval = 10000  // 10秒
                    clearInterval(timer.value)
                    timer.value = setInterval(pollFunction, pollInterval)
                }
                
                const result = await useGetPaymentStatusApi(outTradeNo.value)
                
                // 调试：打印完整的响应数据
                if (process.client) {
                    console.log('=== 支付状态查询调试 ===')
                    console.log('result:', result)
                    console.log('result.data.value:', result.data.value)
                    console.log('result.error.value:', result.error.value)
                }
                
                if (!result.error.value && result.data.value) {
                    // 重置连续错误计数
                    consecutiveErrors = 0
                    
                    const responseData = result.data.value
                    
                    // 兼容不同的响应格式：
                    // 格式1: { payStatus: true } - 直接返回
                    // 格式2: { code: 200, data: { payStatus: true } } - 经过 transform 提取后
                    // 格式3: { code: 200, data: { trade_status: 'TRADE_SUCCESS' } } - 传统格式
                    const payStatus = responseData.payStatus 
                        || (responseData.data && responseData.data.payStatus)
                        || (responseData.trade_status === 'TRADE_SUCCESS')
                    
                    console.log('解析后的 payStatus:', payStatus)
                    
                    // payStatus === true 表示已支付
                    if (payStatus === true || payStatus === 'true') {
                        console.log('检测到支付成功，准备跳转')
                        handleSuccess()
                    }
                    // payStatus === false 继续等待
                } else {
                    // 查询失败，增加连续错误计数
                    consecutiveErrors++
                    
                    // 连续失败3次以上，显示提示
                    if (consecutiveErrors > 3 && consecutiveErrors <= 5) {
                        console.warn('支付状态查询连续失败，正在重试...')
                    } else if (consecutiveErrors > 5) {
                        console.error('支付状态查询多次失败，请检查网络连接')
                        // 不停止轮询，继续尝试
                    }
                }
            } catch (err) {
                console.error('查询支付状态失败:', err)
                consecutiveErrors++
                
                // 网络异常处理
                if (err?.message?.includes('Network Error') || err?.message?.includes('Failed to fetch')) {
                    if (consecutiveErrors > 3) {
                        console.error('网络异常，请检查网络连接')
                    }
                }
                // 网络异常时继续轮询，不中断
            }
        }
        
        // 启动轮询
        timer.value = setInterval(pollFunction, pollInterval)
    }

    // 3. 支付超时处理
    function handleTimeOut() {
        isTimeOut.value = true
        stopPolling()
    }

    // 超时重试：返回拼团详情
    function handleRetry() {
        const activityId = route.query.activityId
        if (activityId) {
            navigateTo(`/group/work/${activityId}`, { replace: true })
        } else {
            navigateTo('/group/index', { replace: true })
        }
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
        message.success('支付成功！正在返回拼团详情...')
        
        console.log('=== 支付成功处理调试 ===')
        console.log('outTradeNo.value:', outTradeNo.value)
        console.log('route.query:', route.query)
        console.log('route.query.activityId:', route.query.activityId)
        console.log('route.query.type:', route.query.type)
        
        // 2秒后跳转
        setTimeout(() => {
            // 判断是否为拼团订单
            const isGroupOrder = outTradeNo.value.startsWith('GP') || route.query.type === 'group'
            
            console.log('isGroupOrder:', isGroupOrder)
            
            if (isGroupOrder) {
                // 拼团订单：跳转到拼团详情页，并添加 refresh 参数提示刷新
                const activityId = route.query.activityId
                console.log('准备跳转到拼团详情页，activityId:', activityId)
                
                if (activityId) {
                    const targetUrl = `/group/work/${activityId}?refresh=true`
                    console.log('目标URL:', targetUrl)
                    
                    navigateTo(targetUrl, { replace: true })
                        .then(() => {
                            console.log('跳转成功')
                        })
                        .catch(err => {
                            console.error('跳转失败:', err)
                        })
                } else {
                    console.warn('未找到 activityId，跳转到拼团列表页')
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
  padding-top: 1.5rem;
  padding-bottom: 1rem;
  gap: 1rem;
}

.instruction-text {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.6;
}

/* 新增样式 */
.success-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.success-animation {
  text-align: center;
  animation: fadeInUp 0.5s ease-out;
}

.success-icon {
  animation: scaleIn 0.5s ease-out;
  margin-bottom: 1rem;
}

.success-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #52c41a;
  margin-bottom: 0.5rem;
}

.success-text {
  color: #6b7280;
  font-size: 0.875rem;
}

.timeout-container {
  padding: 2rem;
}

.order-info-section {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.order-title {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.75rem;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.order-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.order-value {
  color: #333;
  font-size: 0.875rem;
  font-weight: 500;
}

.order-price {
  color: #f43f5e;
  font-size: 1.25rem;
  font-weight: bold;
}

.payment-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.title-large {
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.75rem;
}

.time-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.time-text {
  color: #ff4d4f;
  font-weight: bold;
}

.qrcode-section {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0;
}

.qrcode-component {
  max-width: 280px;
}

.qrcode-loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
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