<template>
  <div class="study-layout">
    <div class="study-header">
      <h2>{{ data.title }} · 学习中心</h2>
      <n-button
        secondary
        type="success"
        size="small"
        @click="$router.push('/course')"
      >
        返回列表
      </n-button>
    </div>

    <n-grid :x-gap="16" :y-gap="16" :cols="24">
      <n-gi :span="13">
        <div class="player-wrapper-paid">
          <div class="player-top-bar">
            <span>正在学习：{{ currentSection.title || '请选择章节' }}</span>
          </div>
          <div class="real-video-box">
            <n-icon size="80" color="rgba(255,255,255,0.3)"
              ><PlayOutline
            /></n-icon>
          </div>
          <div class="player-bottom-bar">
            <div class="current-chapter">{{ currentSection.title }}</div>
            <n-button color="#ff8c00" size="small" class="qa-trigger-btn">
              <template #icon><ChatbubbleEllipsesOutline /></template>
              有疑问？
            </n-button>
          </div>
        </div>
      </n-gi>

      <n-gi :span="11">
        <div class="card-module qa-module">
          <n-gi :span="11">
            <div class="card-module qa-module">
              <div class="module-title">问答列表</div>

              <div class="qa-content-box">
                <slot name="qa"></slot>

                <div v-if="!$slots.qa" class="empty-text">暂无提问...</div>
              </div>
            </div>
          </n-gi>
        </div>
      </n-gi>

      <n-gi :span="13">
        <div class="card-module outline-module">
          <div class="module-title">章节目录</div>
          <slot name="outline"></slot>
        </div>
      </n-gi>

      <n-gi :span="11">
        <div class="card-module files-module">
          <div class="module-title">课件资料</div>
          <slot name="files"></slot>
        </div>
      </n-gi>
    </n-grid>
  </div>
</template>

<script setup>
import { NGrid, NGi, NButton, NIcon, NTabs, NTabPane } from 'naive-ui';
import { PlayOutline, ChatbubbleEllipsesOutline } from '@vicons/ionicons5';

defineProps({
  data: Object,
  currentSection: {
    type: Object,
    default: () => ({ title: '核心代码解析' }),
  },
});
</script>

<style scoped>
/* 搬运你之前 .study-layout 之后的所有 CSS */
.study-layout {
  width: 100%;
  max-width: none;
  padding: 20px;
}
.study-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.player-wrapper-paid {
  background: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.player-top-bar {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  padding: 12px 20px;
  font-size: 14px;
}
.real-video-box {
  aspect-ratio: 16/9;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(#333, #000);
}
.player-bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #fff;
}
.card-module {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  height: 420px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.module-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 15px;
}
.course-detail-container {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}
/* 问答列表 */
.qa-module {
  display: flex;
  flex-direction: column;
}

.qa-content-box {
  flex: 1;
  overflow-y: auto;
  /* 这里的颜色和字体大小对齐你截图里的“暂无提问” */
  color: #666;
  font-size: 14px;
}

.empty-text {
  padding-top: 20px;
  color: #999;
}
</style>
