# 拼团支付接口优化总结

## 优化目标
将拼团支付接口从通用的 `/api/order/wxpay` 改为拼团专用的 `/api/group/work/pay` 接口，实现更清晰的接口分离和更好的业务逻辑。

## 修改内容

### 1. 支付页面 (pages/pay.vue)

#### 1.1 支付接口调用优化
**修改前：**
```javascript
const { no } = route.query
const { data, error } = await useWxpayApi(no)
```

**修改后：**
```javascript
const { no, type, name, price, activityId } = route.query
const { data, error } = await (type === 'group' 
    ? useJoinGroupPaymentApi({ 
        orderNo: no, 
        payMethod: 'wechat', 
        name: name || '拼团支付' 
    })
    : useWxpayApi(no))
```

**优势：**
- 根据 `type` 参数自动选择支付接口
- 拼团订单使用 `useJoinGroupPaymentApi`（调用 `/group/work/pay`）
- 普通订单继续使用 `useWxpayApi`（调用 `/order/wxpay`）

#### 1.2 订单状态轮询优化
**修改前：**
```javascript
useGetWxpayStatusApi(no).then(res=>{
    if(!res.error.value && res.data.value.trade_state == "SUCCESS"){
        handleSuccess()
    }
})
```

**修改后：**
```javascript
const checkApi = type === 'group' 
    ? useGetOrderStatusApi(no) 
    : useGetWxpayStatusApi(no)

checkApi.then(res=>{
    const isPaid = type === 'group' 
        ? (!res.error.value && res.data.value?.status === 1)
        : (!res.error.value && res.data.value?.trade_state === "SUCCESS")
    
    if(isPaid){
        handleSuccess()
    }
})
```

**优势：**
- 拼团订单使用 `useGetOrderStatusApi`（调用 `/group/order/status`）
- 拼团订单状态判断：`status === 1` 表示已支付
- 普通订单使用 `useGetWxpayStatusApi`，状态判断：`trade_state === "SUCCESS"`

#### 1.3 支付成功后跳转优化
**修改前：**
```javascript
navigateTo("/user/buy/1", { replace: true })
```

**修改后：**
```javascript
if (type === 'group' && activityId) {
    navigateTo(`/group/work/${activityId}?refresh=true`, { replace: true })
} else {
    navigateTo("/user/buy/1", { replace: true })
}
```

**优势：**
- 拼团支付成功后跳转回拼团详情页
- 带上 `refresh=true` 参数，触发页面刷新和成功提示
- 普通订单仍跳转到购买记录页面

### 2. 拼团工作台页面 (pages/group/work/[id].vue)

#### 2.1 支付跳转参数传递
**现有代码（第743行）：**
```javascript
navigateTo(`/pay?no=${orderNo}&name=${encodeURIComponent(data.value?.activity?.title || '拼团支付')}&price=${price}&type=group&activityId=${route.params.id}`)
```

**参数说明：**
- `no`: 订单号（orderNo）
- `name`: 商品名称（拼团活动标题）
- `price`: 价格
- `type`: 订单类型（`group` 表示拼团订单）
- `activityId`: 活动ID（用于支付成功后跳转回详情页）

## 接口映射关系

### 前端接口路径 → 后端接口路径

| 前端路径 | 后端路径 | 用途 |
|---------|---------|------|
| `/api/group/work/pay` | `http://localhost:8081/pc/group/work/pay` | 拼团支付（生成微信支付二维码） |
| `/api/group/order/status` | `http://localhost:8081/pc/group/order/status` | 查询拼团订单支付状态 |
| `/api/order/wxpay` | `http://localhost:8081/pc/order/wxpay` | 普通订单微信支付 |
| `/api/order/iswxpay` | `http://localhost:8081/pc/order/iswxpay` | 查询普通订单支付状态 |

## 业务流程

### 拼团支付完整流程

1. **用户点击"立即参团"** (pages/group/work/[id].vue)
   - 调用 `useJoinGroupWorkApi` 接口
   - 接口返回：`{ orderNo, needPay, price }`

2. **判断是否需要支付**
   - 如果 `needPay === true` 且有 `orderNo`：跳转到支付页面
   - 如果 `needPay === false`：直接显示参团成功

3. **跳转到支付页面** (pages/pay.vue)
   - URL: `/pay?no={orderNo}&name={活动名称}&price={价格}&type=group&activityId={活动ID}`

4. **支付页面调用支付接口**
   - 识别 `type=group`，调用 `useJoinGroupPaymentApi`
   - 实际请求：`POST /api/group/work/pay?orderNo={no}&payMethod=wechat&name={name}`
   - 返回微信支付二维码 URL

5. **轮询支付状态**
   - 每 2 秒调用 `useGetOrderStatusApi(no)`
   - 实际请求：`GET /api/group/order/status?orderNo={no}`
   - 判断 `status === 1` 表示已支付

6. **支付成功处理**
   - 停止轮询
   - 显示"支付成功"提示
   - 2 秒后跳转回拼团详情页：`/group/work/{activityId}?refresh=true`

7. **详情页刷新**
   - 检测到 `refresh=true` 参数
   - 刷新拼团数据
   - 显示"支付成功，您已参与拼团！"提示

## 优势总结

1. **接口分离清晰**
   - 拼团订单和普通订单使用不同的支付接口
   - 便于后续独立维护和优化

2. **业务逻辑更合理**
   - 拼团支付成功后直接返回拼团详情页
   - 用户体验更流畅

3. **状态判断更准确**
   - 拼团订单使用专用的状态查询接口
   - 状态码语义更明确（status: 0-待支付, 1-已支付, 2-已取消, 3-已退款）

4. **兼容性好**
   - 保留了普通订单的支付逻辑
   - 通过 `type` 参数自动路由，不影响现有功能

## 测试建议

1. **拼团支付流程测试**
   - 发起拼团 → 参团 → 支付 → 查看状态 → 返回详情页
   - 验证支付二维码生成
   - 验证支付状态轮询
   - 验证支付成功后的跳转

2. **普通订单支付测试**
   - 确保课程、电子书等普通订单的支付流程不受影响

3. **边界情况测试**
   - 免费拼团（price=0）
   - 支付超时
   - 重复支付
   - 网络异常

## 相关文件

- `/pages/pay.vue` - 支付页面（主要修改）
- `/pages/group/work/[id].vue` - 拼团工作台页面（已有跳转逻辑）
- `/composables/group.js` - 拼团 API（useJoinGroupPaymentApi, useGetOrderStatusApi）
- `/composables/order.js` - 订单 API（useWxpayApi, useGetWxpayStatusApi）
- `/nuxt.config.ts` - 代理配置（/api → http://localhost:8081/pc）
