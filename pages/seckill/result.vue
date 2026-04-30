<template>
  <div class="result-page">
    <div class="result-card">
      <!-- 成功状态 -->
      <template v-if="status === 'success'">
        <div class="result-icon success-icon">✅</div>
        <h2 class="result-title">抢购成功！</h2>
        <div class="result-info">
          <div class="info-row">
            <span class="info-label">商品</span>
            <span class="info-value">{{ title }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">实付</span>
            <span class="info-value price-text">¥{{ price }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">有效期</span>
            <span class="info-value">{{ expire || '永久有效' }}</span>
          </div>
          <div class="info-row" v-if="orderNo">
            <span class="info-label">订单号</span>
            <span class="info-value order-no">{{ orderNo }}</span>
          </div>
        </div>
        <div class="result-actions">
          <button class="btn-primary" @click="goStudy">立即去学习</button>
          <button class="btn-secondary" @click="goOrder">查看订单</button>
        </div>
      </template>

      <!-- 失败状态 -->
      <template v-else>
        <div class="result-icon fail-icon">😔</div>
        <h2 class="result-title">很遗憾，名额已被抢完</h2>
        <p class="result-desc">本场次优惠名额已售罄，可以查看其他优惠课程或等待下次活动</p>
        <div class="result-actions">
          <button class="btn-primary" @click="goSeckill">查看其他优惠课程</button>
          <button class="btn-secondary" @click="handleRemind">加入下次提醒</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { createDiscreteApi } from 'naive-ui'

const route = useRoute()
const { status, title, price, expire, order_no: orderNo } = route.query

function goStudy() {
  navigateTo('/user/buy/1')
}

function goOrder() {
  navigateTo('/user/buy/1')
}

function goSeckill() {
  navigateTo('/seckill')
}

function handleRemind() {
  const { message } = createDiscreteApi(['message'])
  message.success('已设置提醒，活动开始时将通知您')
}
</script>

<style scoped>
.result-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 40px 16px;
}
.result-card {
  background: #fff;
  border-radius: 16px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  width: 100%;
  max-width: 440px;
}
.result-icon {
  font-size: 56px;
  margin-bottom: 16px;
  line-height: 1;
}
.result-title {
  font-size: 22px;
  font-weight: 700;
  color: #111;
  margin: 0 0 24px;
}
.result-desc {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 28px;
  line-height: 1.6;
}

/* 订单信息 */
.result-info {
  background: #f9fafb;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 28px;
  text-align: left;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}
.info-row:last-child { border-bottom: none; }
.info-label { color: #6b7280; }
.info-value { color: #111; font-weight: 500; max-width: 240px; text-align: right; }
.price-text { color: #f43f5e; font-weight: 700; font-size: 16px; }
.order-no { font-size: 12px; color: #9ca3af; }

/* 按钮 */
.result-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.btn-primary {
  width: 100%;
  padding: 13px 0;
  background: linear-gradient(135deg, #ff6b35, #f43f5e);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.9; }
.btn-secondary {
  width: 100%;
  padding: 12px 0;
  background: #fff;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover { border-color: #f43f5e; color: #f43f5e; }
</style>
