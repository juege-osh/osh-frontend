<template>
  <div class="pay-component-container">
    <div class="pay-card">
      <section class="pay-section">
        <h3 class="section-title">产品信息</h3>
        <div class="product-item">
          <img :src="data.cover" class="prod-cover" />
          <div class="prod-info">
            <p class="prod-title">{{ data.title }}</p>
          </div>
          <div class="prod-price">
            <span class="currency">¥</span>
            <span class="price-num">{{ data.price }}</span>
          </div>
        </div>
      </section>

      <section class="pay-section">
        <h3 class="section-title">优惠券</h3>
        <div class="coupon-pane">
          <span class="coupon-text">暂无可用优惠券</span>
        </div>
      </section>

      <section class="pay-section">
        <h3 class="section-title">支付方式</h3>
        <div class="method-list">
          <div
            v-for="m in methods"
            :key="m.id"
            class="method-btn"
            :class="{ active: activeMethod === m.id }"
            @click="activeMethod = m.id"
          >
            <n-icon v-if="m.id === 'wechat'" size="18" color="#09bb07">
              <LogoWechat />
            </n-icon>
            <span class="method-name">{{ m.name }}</span>
          </div>
        </div>
      </section>

      <div class="pay-footer">
        <div class="footer-left">
          <span class="warning-tip">请在30分钟内完成支付</span>
        </div>
        <div class="footer-right">
          <div class="final-price-row">
            需支付 <span class="currency">¥</span>
            <span class="price-num">{{ data.price }}</span>
          </div>
          <n-button
            type="primary"
            color="#18a058"
            class="confirm-pay-btn"
            :loading="loading"
            @click="$emit('confirm')"
          >
            确认支付
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { NIcon, NButton } from 'naive-ui';
// 这里需要导入 LogoWechat 图标，如果没有配置图标包，可以注释掉这行
// import { LogoWechat } from '@vicons/ionicons5';

defineProps({
  data: Object,
  loading: Boolean,
});

const activeMethod = ref('wechat');
const methods = [
  { id: 'wechat', name: '微信支付' },
  { id: 'alipay', name: '支付宝' },
  { id: 'union', name: '银联支付' },
];
</script>

<style scoped>
/* 整个组件外层加一个灰色背景和内边距，衬托出白卡片 */
.pay-component-container {
  background-color: #f4f6f8;
  padding: 30px 0;
  min-height: 80vh;
}

/* 核心卡片：限宽、扁平、小内边距 */
.pay-card {
  max-width: 1000px; /* 限制最大宽度，不能通栏 */
  margin: 0 auto;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 2px; /* 小圆角，更显扁平 */
  padding: 20px 25px; /* 紧凑内边距 */
}

/* 区域标题样式 */
.pay-section {
  margin-bottom: 25px;
}
.section-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
  font-weight: normal;
}

/* 产品信息行：去除边框，紧凑布局 */
.product-item {
  display: flex;
  align-items: center;
  gap: 15px;
}
.prod-cover {
  width: 110px; /* 缩小封面图尺寸 */
  height: 65px;
  object-fit: cover;
  border-radius: 2px;
}
.prod-info {
  flex: 1;
}
.prod-title {
  font-size: 14px;
  color: #333;
  margin: 0;
}
.prod-price {
  color: #e63946;
  font-weight: bold;
}
.prod-price .currency {
  font-size: 12px;
  margin-right: 2px;
}
.prod-price .price-num {
  font-size: 16px;
}

/* 优惠券区域：紧凑直角 */
.coupon-pane {
  background: #fdfdfd;
  border: 1px solid #eee;
  padding: 10px 15px;
  width: fit-content;
  border-radius: 2px;
}
.coupon-text {
  font-size: 13px;
  color: #bbb; /* 更淡的灰色 */
}

/* 支付方式按钮：直角、扁平、激活状态明显 */
.method-list {
  display: flex;
  gap: 10px;
}
.method-btn {
  border: 1px solid #eee;
  padding: 8px 18px;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  color: #666;
  font-size: 13px;
  background: #fff;
}
/* 激活状态：绿色边框，浅绿背景 */
.method-btn.active {
  border-color: #18a058;
  color: #18a058;
  background-color: #f6ffed;
}

/* 底部结算区：对齐两边 */
.pay-footer {
  margin-top: 40px;
  border-top: 1px solid #eee;
  padding-top: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.footer-right {
  text-align: right;
}

.warning-tip {
  color: #f44336;
  font-size: 12px;
}

.final-price-row {
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
}
.final-price-row .currency {
  color: #f44336;
  margin: 0 1px;
}
.final-price-row .price-num {
  font-size: 18px;
  color: #f44336;
  font-weight: bold;
}

/* 确认支付按钮：直角，去掉太大太胖的感觉 */
.confirm-pay-btn {
  height: 32px; /* 扁平高度 */
  border-radius: 2px;
  padding: 0 20px;
  font-size: 13px;
}
</style>
