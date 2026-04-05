<template>
  <div class="detail-container">
    <n-page-header @back="emit('back')">
      <template #title>{{ question.title }}</template>
    </n-page-header>

    <n-card class="q-main" hoverable>
      <n-space align="center" style="margin-bottom: 15px">
        <n-tag size="small" round :bordered="false" color="#f3f3f3"
          >提问者: {{ question.userName }}</n-tag
        >
        <n-tag size="small" round type="success" ghost
          >关联: [课程] #{{ question.resourceNo }}</n-tag
        >
        <span class="meta-stats">
          <n-icon><EyeOutline /></n-icon> {{ question.viewCount }}
          <n-divider vertical />
          <n-icon><PersonAddOutline /></n-icon> {{ question.followCount }}
        </span>
      </n-space>
      <div class="q-content">
        <n-blockquote>
          {{ question.content }}
        </n-blockquote>
      </div>
    </n-card>

    <div class="answer-section">
      <div class="section-title">常规回复</div>

      <n-card v-if="bestAnswer" class="best-answer-card">
        <div class="best-badge">最佳回答</div>
        <div class="ans-header">
          <n-avatar round size="small" src="https://0.gg/avatar.png" />
          <span class="ans-user">专家用户</span>
          <span class="time">1小时前</span>
        </div>
        <div class="ans-content">{{ bestAnswer.content }}</div>
      </n-card>

      <n-list hoverable clickable>
        <n-list-item v-for="ans in commonAnswers" :key="ans.id">
          <n-thing :title="ans.userName" :description="ans.time">
            <template #avatar>
              <n-avatar round size="small" />
            </template>
            {{ ans.content }}
          </n-thing>
        </n-list-item>
      </n-list>
    </div>

    <div class="reply-area">
      <n-alert
        title="警告：违规乱答将被加入灰名单。累计 3 次将直接封号。"
        type="error"
        closable
        class="violation-alert"
      />
      <n-input-group style="margin-top: 12px">
        <n-input
          type="textarea"
          placeholder="请输入你的专业回答... (回答累计 3 次违规将永久封号)"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
        <n-button
          type="primary"
          color="#2c3e50"
          style="height: auto; padding: 0 30px"
        >
          提交专业回答
        </n-button>
      </n-input-group>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import {
  NPageHeader,
  NCard,
  NTag,
  NSpace,
  NIcon,
  NDivider,
  NBlockquote,
  NAvatar,
  NList,
  NListItem,
  NThing,
  NAlert,
  NInput,
  NInputGroup,
  NButton,
} from 'naive-ui';
import { EyeOutline, PersonAddOutline } from '@vicons/ionicons5';

const props = defineProps(['questionId']);
const emit = defineEmits(['back']);

// 模拟数据
const question = reactive({
  title: '如何解决 #1024 课程中 Python 爬虫的 SSL 错误？',
  userName: '星号',
  resourceNo: '1024',
  content:
    'SSL 证书问题可以通过以下步骤解决：1. 将证书中存在的问题（代码加密）索取 SSL 错误...',
  viewCount: 128,
  followCount: 11,
});

const bestAnswer = ref({
  content:
    '通常是因为本地环境缺少根证书。建议使用 certifi 库或在请求中设置 verify=False（仅限开发环境）。',
});

const commonAnswers = ref([
  {
    id: 1,
    userName: '用户B',
    time: '2小时前',
    content: '我也遇到了同样的问题，重装了 openssl 解决了。',
  },
  {
    id: 2,
    userName: 'UserC',
    time: '5小时前',
    content: '关注一下，等一个标准答案。',
  },
]);
</script>

<style scoped>
.detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 20px 150px;
}
.q-main {
  margin: 20px 0;
  border-radius: 12px;
}
.meta-stats {
  margin-left: auto;
  color: #999;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.q-content {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
}
.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 30px 0 15px;
  padding-left: 10px;
  border-left: 4px solid #2c3e50;
}

.best-answer-card {
  border: 2px solid #52c41a66;
  background: #f6ffed;
  margin-bottom: 20px;
  position: relative;
  border-radius: 12px;
}
.best-badge {
  position: absolute;
  left: -1px;
  top: -1px;
  background: #52c41a;
  color: #fff;
  padding: 2px 12px;
  font-size: 12px;
  border-radius: 10px 0 10px 0;
  font-weight: bold;
}
.ans-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  margin-top: 10px;
}
.ans-user {
  font-weight: bold;
}
.time {
  color: #999;
  font-size: 12px;
}

.reply-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20px;
  box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.06);
  z-index: 100;
  border-top: 1px solid #eee;
}
.detail-container {
  width: 100%;
  max-width: none; /* 或者设为 1200px */
  margin: 0 auto;
  padding: 20px 20px 150px;
}
</style>
