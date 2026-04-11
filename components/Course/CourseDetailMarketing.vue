<template>
  <div class="course-detail-container">
    <div class="content-wrapper">
      <div class="course-header-card">
        <img :src="data.cover" class="main-cover" />
        <div class="info-right">
          <div class="title-row">
            <h1>{{ data.title }}</h1>
            <div class="collect-box">收藏</div>
          </div>

          <div v-if="!isPaid" class="price-section">
            <div class="stat-text">{{ data.buyCount }}人学过</div>
            <div class="price-main">
              <span class="current-price">¥ {{ data.price }}</span>
              <span v-if="data.tPrice > 0" class="old-price"
                >¥ {{ data.tPrice }}</span
              >
            </div>
            <div class="coupon-tag">领取优惠券</div>
          </div>

          <div v-if="!isPaid" class="action-btn">
            <n-button type="primary" color="#18a058" @click="$emit('pay')">
              立即学习
            </n-button>
          </div>
          <div v-else class="paid-status-tag">
            <span>已参加</span>
          </div>
        </div>
      </div>

      <div class="main-layout">
        <div class="left-content">
          <div class="tabs-header">
            <span
              class="tab-item"
              :class="{ active: currentTab === 'detail' }"
              @click="handleTabChange('detail')"
              >详情</span
            >

            <span
              class="tab-item"
              :class="{ active: currentTab === 'outline' }"
              @click="handleTabChange('outline')"
              >目录</span
            >
          </div>

          <div class="tabs-pane">
            <div v-if="currentTab === 'detail'" class="intro-text">
              {{ data.title }}
            </div>

            <div v-else class="outline-list">
              <div v-if="loading" class="loading-state">
                <n-spin description="正在抓取课程大纲..." />
              </div>

              <div
                v-else-if="!localOutline || localOutline.length === 0"
                class="empty-outline"
              >
                <p>暂无目录数据 (调试ID: {{ courseId }})</p>
              </div>

              <div v-else class="chapter-container">
                <div
                  v-for="(chapter, index) in localOutline"
                  :key="chapter.id"
                  class="chapter-wrapper"
                >
                  <div class="chapter-title-box">
                    <span class="c-tag">第 {{ index + 1 }} 章</span>
                    <span class="c-title">{{ chapter.title }}</span>
                  </div>

                  <div class="sections-container">
                    <div
                      v-for="section in chapter.children || []"
                      :key="section.id"
                      class="section-row"
                    >
                      <div class="s-left">
                        <span class="s-play">▶</span>
                        <span class="s-name">{{ section.title }}</span>
                      </div>

                      <div class="s-right">
                        <span v-if="section.freeFlag === 1" class="s-free"
                          >试看</span
                        >
                        <span v-else class="s-lock">🔒</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="right-sidebar">
          <div class="sidebar-title">精品推荐</div>
          <div class="recommend-list">
            <div class="recommend-item" v-for="i in 2" :key="i">
              <div class="rec-img-box">
                <img src="https://api.dicebear.com/7.x/shapes/svg?seed=2" />
              </div>
              <div class="rec-info">
                <p class="rec-title">uni-app实战在线教育类app开发</p>
                <div class="rec-price-row">
                  <span class="rec-price">¥ 10.00</span>
                  <span class="rec-old-price">¥ 20.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NButton, NSpin } from 'naive-ui';
import { ref, computed } from 'vue'; // 去掉 onMounted，咱们手动触发
import { useRoute } from 'vue-router';
import { fetchConfig } from '~/composables/useHttp';

const props = defineProps({
  data: Object,
});

const route = useRoute();
const courseId = route.params.id;

const localOutline = ref([]);
const loading = ref(false);
const currentTab = ref('detail');
const hasLoaded = ref(false); // 💡 增加一个标识，防止重复请求

// ✨ 核心：点击“目录”触发的函数
const handleTabChange = async (tabName) => {
  currentTab.value = tabName;

  // 只有切换到目录，且之前没加载过，才发请求
  if (tabName === 'outline' && !hasLoaded.value) {
    await fetchOutlineData();
  }
};

const fetchOutlineData = async () => {
  console.log('🚀 准备抓取大纲数据，ID 为:', courseId);
  loading.value = true;

  try {
    // 强制使用绝对路径调试，确保不被 baseURL 坑
    const res = await $fetch(`/course/section/outline/${courseId}`, {
      baseURL: fetchConfig.baseURL, // 保持和 tags 一致的 baseURL
      headers: {
        ...fetchConfig.headers,
        token: localStorage.getItem('Token') || '',
      },
    });

    if (res && res.code === 200) {
      // 确保 res.data 是数组。如果后端多包了一层，这里要指准
      localOutline.value = Array.isArray(res.data) ? res.data : [];
      console.log('🔥 当前大纲长度:', localOutline.value.length);
      hasLoaded.value = true;
    }
  } catch (err) {
    console.error('❌ 请求大纲彻底失败:', err);
  } finally {
    loading.value = false;
  }
};

const isPaid = computed(() => props.data.buyFlag === 1);
const emit = defineEmits(['pay']);
</script>

<style scoped>
/* --- 基础布局 --- */
.course-detail-container {
  background-color: #f4f4f4;
  min-height: 100vh;
  padding: 20px 0;
}
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* --- 顶部卡片 --- */
.course-header-card {
  background: #fff;
  padding: 25px;
  margin-bottom: 20px;
  border-radius: 4px;
  display: flex;
  gap: 25px;
}
.main-cover {
  width: 320px;
  height: 180px;
  object-fit: cover;
  border-radius: 4px;
}
.info-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.title-row h1 {
  font-size: 20px;
  margin: 0;
}
.price-section {
  margin-top: 10px;
}
.current-price {
  font-size: 24px;
  font-weight: bold;
  color: #f44336;
}
.paid-status-tag {
  margin-top: 20px;
  color: #18a058;
  font-weight: bold;
}

/* --- 下方 Tabs 布局 --- */
.main-layout {
  display: grid;
  grid-template-columns: 8.5fr 3.5fr;
  gap: 20px;
}
.left-content {
  background: #fff;
  border-radius: 4px;
  min-height: 400px;
}
.tabs-header {
  border-bottom: 1px solid #eee;
  display: flex;
  padding: 0 10px;
}
.tab-item {
  padding: 15px 20px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  position: relative;
}
.tab-item.active {
  color: #2196f3;
  font-weight: bold;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #2196f3;
}
.tabs-pane {
  padding: 20px;
}

/* --- 目录大纲样式 (重点！) --- */
/* 确保 outline-list 是 block 布局 */
.outline-list {
  display: block !important;
  width: 100%;
}

.chapter-container {
  border: 1px solid #f0f0f0 !important;
  border-radius: 4px;
}

.chapter-wrapper {
  border-bottom: 1px solid #f0f0f0;
}

.chapter-wrapper:last-child {
  border-bottom: none;
}

.chapter-title-box {
  background-color: #f8f9fa !important;
  padding: 15px 20px;
  display: flex !important;
  align-items: center;
  gap: 15px;
}

.c-tag {
  color: #18a058 !important;
  font-weight: bold;
  font-size: 14px;
  min-width: 60px;
}

.c-title {
  font-weight: bold;
  color: #333;
  font-size: 15px;
}

/* 节列表样式 */
.sections-container {
  background: #fff !important;
  display: block !important;
}

.section-row {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 15px 25px;
  border-bottom: 1px solid #f9f9f9;
  transition: all 0.2s;
}

.section-row:hover {
  background-color: #f0fdf4 !important;
}

.s-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.s-play {
  color: #18a058;
  font-size: 10px;
}

.s-name {
  color: #555;
  font-size: 14px;
}

.s-time {
  color: #999;
  font-size: 12px;
}

.s-free {
  font-size: 12px;
  color: #18a058;
  border: 1px solid #18a058;
  padding: 1px 6px;
  border-radius: 3px;
}

.s-unlocked {
  color: #18a058;
  font-size: 13px;
}

.s-lock {
  color: #ccc;
  font-size: 14px;
}

.loading-state,
.empty-outline {
  text-align: center;
  padding: 60px 0;
  color: #999;
}
</style>
