<template>
  <div class="marketing-layout">
    <div class="breadcrumb">首页 / 课程列表 / {{ data.title }}</div>

    <div class="hero-section">
      <div class="preview-player">
        <div class="video-container">
          <div class="video-mask">
            <n-tag type="warning" size="small" class="free-badge"
              >免费试听</n-tag
            >
            <div class="video-info">
              <h3>第1章 {{ data.title }} 介绍</h3>
              <div style="margin: 10px 0">
                <n-tag
                  v-for="tag in data.tags"
                  :key="tag.id"
                  type="success"
                  size="small"
                  style="margin-right: 6px"
                >
                  {{ tag.name }}
                </n-tag>
              </div>
              <p>限时免费，点击预览核心价值</p>
            </div>
            <div class="play-trigger">
              <n-icon size="60" color="#fff"><PlayCircleOutline /></n-icon>
            </div>
          </div>
          <img
            :src="
              data.cover || 'https://api.dicebear.com/7.x/shapes/svg?seed=1'
            "
            class="video-poster"
          />
        </div>

        <div class="detail-tabs-card">
          <div class="tabs-nav">
            <span class="active">详情</span>
            <span>大纲</span>
            <div class="rating-box">
              好评数: <span>{{ data.goodCount }}</span> 中评数:
              <span>{{ data.midCount }}</span> 差评数:
              <span>{{ data.badCount }}</span>
            </div>
          </div>
          <div class="tabs-body">
            <section>
              <h4>课程介绍</h4>
              <p>{{ data.intro || '暂无课程介绍' }}</p>
            </section>
            <section>
              <h4>服务周期 ({{ data.afterServiceDays || 0 }} 天)</h4>
              <p>加入后立即可见全部更新内容。</p>
            </section>
            <section>
              <h4>
                具体包含服务 ({{ data.serviceContent || '答疑+资料+复盘' }})
              </h4>
              <p>包含核心代码解析、实时技术答疑、项目实战课件等。</p>
            </section>
          </div>
        </div>
      </div>

      <div class="purchase-sidebar">
        <div class="sales-card">
          <div class="price-header">
            <span class="symbol">¥</span>
            <span class="price-num">
              {{ data.price > 0 ? data.price : '免费' }}
            </span>
            <n-tag type="error" size="small" round quaternary>限时特惠</n-tag>
          </div>

          <button class="fancy-buy-btn" @click="$emit('pay')">
            <div class="btn-content">
              <span class="main-text">立即学习（解锁付费课程）</span>
              <span class="sub-text">尊享一对一答疑 & 核心源码下载</span>
            </div>
            <div class="btn-flare"></div>
          </button>

          <div class="status-row">
            <span>学习进度：0%</span>
            <n-text depth="3">资料下载</n-text>
            <span>学习人数：{{ data.buyCount }}</span>
            <n-text depth="3">浏览量：{{ data.viewCount }}</n-text>
          </div>

          <div class="locked-outline">
            <div v-for="i in data.videoCount || 3" :key="i" class="locked-item">
              <span class="idx">{{ i }}. 核心模块展示</span>
              <n-icon><LockClosedOutline /></n-icon>
            </div>
            <div class="pay-to-unlock">
              <div class="divider"></div>
              <span>支付后解锁全部章节</span>
              <div class="divider"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NTag, NIcon, NText } from 'naive-ui';
import { PlayCircleOutline, LockClosedOutline } from '@vicons/ionicons5';

defineProps({
  data: Object,
});
defineEmits(['pay']);
</script>

<style scoped>
/* 把你代码里以 .marketing-layout, .hero-section, .fancy-buy-btn 等开头的 CSS 挪到这里 */
/* 此处省略你代码中已有的样式... */
/* --- 1. 未支付布局 --- */
.marketing-layout {
  max-width: 1200px;
  margin: 0 auto;
}
.breadcrumb {
  font-size: 13px;
  color: #999;
  margin-bottom: 20px;
}
.hero-section {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
}

/* 视频预览区 */
.preview-player {
  flex: 1;
}
.video-container {
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  aspect-ratio: 16/9;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.video-mask {
  position: absolute;
  inset: 0;
  z-index: 5;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
}
.video-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
}
.free-badge {
  position: absolute;
  top: 16px;
  left: 16px;
}

/* Tabs 样式 */
.detail-tabs-card {
  background: #fff;
  margin-top: 24px;
  border-radius: 12px;
  padding: 24px;
}
.tabs-nav {
  display: flex;
  gap: 30px;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 20px;
}
.tabs-nav span.active {
  color: #18a058;
  border-bottom: 2px solid #18a058;
  padding-bottom: 12px;
}
.rating-box {
  margin-left: auto;
  background: #fff8f0;
  padding: 4px 12px;
  border: 1px solid #ffe8cc;
  border-radius: 4px;
  font-size: 12px;
}

/* 购买侧边栏 */
.sales-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.price-header {
  margin-bottom: 20px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.price-num {
  font-size: 28px;
  font-weight: bold;
  color: #e63946;
}

/* 炫酷按钮动画补全 */
.fancy-buy-btn {
  width: 100%;
  border: none;
  padding: 16px;
  border-radius: 10px;
  cursor: pointer;
  background: linear-gradient(135deg, #ff8c00 0%, #ff4500 100%);
  color: white;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
}
.btn-flare {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: flare 3s infinite;
}
@keyframes flare {
  0% {
    left: -100%;
  }
  30% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

.locked-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
  color: #adb5bd;
}
.divider {
  height: 1px;
  flex: 1;
  background: #eee;
}
</style>
