<template>
  <div class="qna-list-container">
    <div class="search-section">
      <n-input-group>
        <n-select
          v-model:value="searchType"
          :options="resourceOptions"
          style="width: 120px"
        />
        <n-input
          v-model:value="searchNo"
          placeholder="资源编号"
          style="width: 100px"
        />
        <n-input
          v-model:value="keyword"
          placeholder="如何解决环境报错..."
          style="flex: 1"
        />
        <n-button type="primary" color="#2c3e50" @click="handleSearch"
          >搜索</n-button
        >
      </n-input-group>
      <n-button type="info" secondary @click="emit('open-create')">
        <template #icon
          ><n-icon><Add /></n-icon
        ></template>
        我要提问
      </n-button>
    </div>

    <n-tabs type="line" animated @update:value="handleTabChange">
      <n-tab-pane name="all" tab="全部问题" />
      <n-tab-pane name="my" tab="我的问题" />
      <n-tab-pane name="follow" tab="关注" />
      <n-tab-pane name="unsolved" tab="未回答" />
      <n-tab-pane name="solved" tab="已回答" />
    </n-tabs>

    <div class="qna-list">
      <n-card
        v-for="q in paginatedData"
        :key="q.id"
        :class="['qna-card', q.is_paid_only ? 'paid-style' : '']"
        hoverable
        @click="emit('to-detail', q.id)"
      >
        <div class="card-horizontal-content">
          <div class="main-info">
            <n-tag
              v-if="q.is_paid_only"
              size="small"
              type="warning"
              class="type-tag"
              >付费</n-tag
            >
            <n-tag v-else size="small" type="info" ghost class="type-tag"
              >免费</n-tag
            >

            <span class="qna-title" :title="q.title">{{ q.title }}</span>

            <div class="tags-group">
              <n-tag
                v-for="tag in q.tags"
                :key="tag"
                size="tiny"
                :bordered="false"
                round
                >{{ tag }}</n-tag
              >
            </div>
          </div>

          <div class="meta-info">
            <div class="user-rel">
              <span class="user-name">{{ q.userName }}</span>
              <span class="rel-link"
                >[{{ q.resourceName }}] #{{ q.resourceNo }}</span
              >
            </div>

            <div class="status-group">
              <span>回复: {{ q.replyCount }}</span>
              <span :class="q.status === 0 ? 'status-pending' : 'status-done'">
                {{ q.status === 0 ? '待回答' : '已解决' }}
              </span>
            </div>

            <div class="stats-group">
              <span class="view-count"
                ><n-icon><EyeOutline /></n-icon> {{ q.viewCount }}</span
              >
              <n-button size="tiny" quaternary circle
                ><n-icon><PersonAddOutline /></n-icon
              ></n-button>
            </div>
          </div>
        </div>
      </n-card>
    </div>

    <div class="pagination-container">
      <n-pagination
        v-model:page="page"
        v-model:page-size="pageSize"
        :item-count="mockQuestions.length"
        show-size-picker
        :page-sizes="[10, 20, 30]"
        @update:page="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  NInputGroup,
  NSelect,
  NInput,
  NButton,
  NIcon,
  NTabs,
  NTabPane,
  NCard,
  NTag,
  NPagination,
} from 'naive-ui';
import { Add, EyeOutline, PersonAddOutline } from '@vicons/ionicons5';

const emit = defineEmits(['to-detail', 'open-create']);

// 状态控制
const searchType = ref('course');
const searchNo = ref('');
const keyword = ref('');
const page = ref(1);
const pageSize = ref(10);

const resourceOptions = [
  { label: '课程', value: 'course' },
  { label: '网站', value: 'website' },
];

// 5. 更多假数据
const mockQuestions = ref(
  Array.from({ length: 45 }).map((_, index) => ({
    id: 1000 + index,
    title:
      index % 3 === 0
        ? `关于第 #${1000 + index} 节课中遇到的环境配置问题，报错信息如附件`
        : `如何在实战项目中优化 Python 爬虫的并发效率？第 ${index} 种方案尝试`,
    is_paid_only: index % 4 === 0,
    tags: index % 2 === 0 ? ['Python', '爬虫'] : ['Vue3', '前端'],
    userName: ['张三', '李四', '王五', '星号'][index % 4],
    resourceName: index % 2 === 0 ? '课程' : '网站',
    resourceNo: `${100 + index}`,
    replyCount: Math.floor(Math.random() * 20),
    status: index % 5 === 0 ? 1 : 0,
    viewCount: Math.floor(Math.random() * 500),
  }))
);

// 6. 分页计算
const paginatedData = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return mockQuestions.value.slice(start, end);
});

const handleSearch = () => console.log('搜索:', keyword.value);
const handleTabChange = (name) => {
  page.value = 1; // 切换分类重置页码
  console.log('切换Tab:', name);
};
const handlePageChange = (p) => {
  window.scrollTo({ top: 0, behavior: 'smooth' }); // 翻页后滚动到顶部
};
</script>

<style scoped>
.qna-list-container {
  width: 100%;
}

.search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #efeff5;
}

.qna-list {
  margin-top: 12px;
}

.qna-card {
  margin-bottom: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.n-card__content) {
  padding: 12px 16px !important;
}

.card-horizontal-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.main-info {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.qna-title {
  margin: 0 12px;
  font-size: 15px;
  font-weight: 500;
  color: #2c3e50;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags-group {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.meta-info {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
  color: #8c8c8c;
  font-size: 13px;
}

.user-rel {
  display: flex;
  gap: 12px;
  min-width: 150px;
}

.rel-link {
  color: #18a058;
  font-weight: 500;
}

.status-group {
  display: flex;
  gap: 12px;
  min-width: 110px;
}

.status-pending {
  color: #f0a020;
}
.status-done {
  color: #18a058;
}

.stats-group {
  display: flex;
  align-items: center;
  gap: 10px;
  border-left: 1px solid #efeff5;
  padding-left: 20px;
}

.view-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* VIP 样式 */
.paid-style {
  border: 1px solid #fbcf33;
  background: linear-gradient(90deg, #fffcf0 0%, #fff 120px);
  position: relative;
}

.paid-style::before {
  content: 'VIP';
  position: absolute;
  left: 0;
  top: 0;
  background: #fbcf33;
  color: #fff;
  font-size: 9px;
  padding: 0px 5px;
  border-radius: 7px 0 8px 0;
  font-weight: bold;
}

.qna-card:hover {
  border-color: #18a058;
  transform: translateX(5px);
}

/* 分页容器样式 */
.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  padding-bottom: 40px;
}
</style>
