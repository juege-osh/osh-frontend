<template>
  <div class="qna-page-container">
    <div v-if="isListPage" class="page-content">
      <div class="header-action">
        <n-breadcrumb>
          <n-breadcrumb-item>首页</n-breadcrumb-item>
          <n-breadcrumb-item>问答社区</n-breadcrumb-item>
        </n-breadcrumb>
      </div>

      <QuestionAnswerList
        @to-detail="handleToDetail"
        @open-create="showCreate = true"
      />
    </div>

    <div v-else class="page-content">
      <QuestionAnswerDetail :question-id="routeId" @back="handleBack" />
    </div>

    <QuestionAnswerCreateModal v-model:show="showCreate" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// 1. 获取当前路由参数。这里的 'page' 对应你的文件名 [page].vue
const pageParam = computed(() => route.params.page);

// 2. 核心逻辑：只有参数明确为 'list' 时才显示列表
// 访问 /question_answer/list -> pageParam 为 'list' -> isListPage 为 true
// 访问 /question_answer/1    -> pageParam 为 '1'      -> isListPage 为 false
const isListPage = computed(() => {
  return pageParam.value === 'list';
});

// 3. 详情页需要的 ID
const routeId = computed(() => (isListPage.value ? null : pageParam.value));

const showCreate = ref(false);

const handleToDetail = (id) => {
  router.push(`/question_answer/${id}`);
};

const handleBack = () => {
  router.push('/question_answer/list');
};
</script>

<style scoped>
.qna-page-container {
  min-height: 100vh;
  width: 100vw;
  background-color: #f9fbff; /* 浅色背景更显社区质感 */
}

/* 修改 [page].vue 里的这一段 */
/* 修改 [page].vue 里的样式 */
.page-content {
  /* ❌ 删除了 max-width: 1240px; */
  /* ❌ 删除了 margin: 0 auto; */
  width: 100%;
  padding: 20px;
  box-sizing: border-box; /* 确保 padding 不会把宽度撑破 */
}

.header-action {
  margin-bottom: 20px;
}

/* 页面切换动画，提升用户体验 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
