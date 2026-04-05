<template>
  <div class="course-container">
    <n-breadcrumb class="breadcrumb-wrapper">
      <n-breadcrumb-item><nuxt-link to="/">首页</nuxt-link></n-breadcrumb-item>
      <n-breadcrumb-item>所有课程</n-breadcrumb-item>
    </n-breadcrumb>

    <CourseFilter
      v-model:modelValue="queryParams"
      :tag-options="tagOptions"
      :type-options="typeOptions"
      @search="handleSearch"
      @create="showCreateModal = true"
    />

    <div style="color: red; margin-bottom: 10px">
      当前加载状态: {{ pending ? '加载中...' : '加载完成' }} | 列表长度:
      {{ courseList?.length || 0 }}
    </div>

    <ClientOnly>
      <n-grid
        v-if="courseList && courseList.length > 0"
        :x-gap="16"
        :y-gap="16"
        :cols="5"
      >
        <n-gi v-for="item in courseList" :key="item.id">
          <CourseCard :item="item" @click="handleDetail(item.id)" />
        </n-gi>
      </n-grid>

      <n-empty
        v-else-if="!pending"
        description="暂无课程数据，请检查接口返回"
      />
    </ClientOnly>

    <div class="pagination-wrapper">
      <n-pagination
        v-model:page="queryParams.pageNum"
        :item-count="totalCount"
        :page-size="queryParams.pageSize"
        @update:page="handleRefresh"
      />
    </div>

    <CourseEditModal
      v-model:show="showCreateModal"
      :tag-options="tagOptions"
      @success="handleRefresh"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'; // 加上 computed
import CourseEditModal from '~/components/Course/CourseEditModal.vue';
import CourseFilter from '~/components/Course/CourseFilter.vue';
import CourseCard from '~/components/Course/CourseCard.vue';
// 1. 引入接口和 Nuxt 路由工具

import {
  NGrid,
  NGi,
  NPagination,
  NBreadcrumb,
  NBreadcrumbItem,
} from 'naive-ui';

// ✅ 修改后
const queryParams = reactive({
  keyword: '', // 对应搜索框
  tags: [], // 对应标签选择，改为 tags
  pageNum: 1,
  pageSize: 10,
  // 如果后端还需要 type，可以保留，不需要就删掉
});
// 修改后：将 queryParams 作为函数传入，确保 refresh 时获取的是 reactive 的最新值
// ✅ 直接传入 reactive 对象，不要传匿名函数
const {
  data: resData,
  pending,
  refresh,
} = await useCourseSearchApi(queryParams);
// --- 2. 映射真数据 ---
// 后端返回的是 { data: { rows: [...], total: 100 } }
// --- 2. 映射真数据 ---
// --- 2. 映射真数据 ---
const courseList = computed(() => {
  // 核心调试：如果还是 0，看浏览器 Console 里的打印
  console.log('API 返回的原始 resData:', resData.value);

  // 这里的路径必须极其精准
  // 方案 A: 对应后端返回 { data: { data: { rows: [...] } } } 的情况
  // 方案 B: 对应后端返回 { data: { rows: [...] } } 的情况
  const actualData = resData.value?.data || resData.value;
  const rows = actualData?.rows || [];

  return rows.map((item) => ({
    ...item,
    buyCount: item.salesCount || 0,
    // 补全图片路径，防止 404
    cover: item.cover
      ? item.cover.startsWith('http')
        ? item.cover
        : `http://localhost:8081${item.cover}`
      : 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
    goodCount: item.ratingScore || 5,
    midCount: 0,
    badCount: 0,
  }));
});

// totalCount 也要同步修正
const totalCount = computed(() => {
  const actualData = resData.value?.data || resData.value;
  return actualData?.total || 0;
});
// --- 3. 搜索与刷新逻辑 ---

// --- 新增课程弹窗控制 ---
const showCreateModal = ref(false);

// 标签下拉框数据 - 后续通过接口 tags.map(v => ({label: v.name, value: v.id})) 填充
const tagOptions = [
  { label: 'Vue3', value: 1 },
  { label: 'Nuxt3', value: 2 },
  { label: 'Node.js', value: 3 },
  { label: 'Python', value: 4 },
  { label: 'AI实战', value: 5 },
  { label: '信息差', value: 6 },
];

const typeOptions = [
  { label: '视频课', value: 'media' },
  { label: '直播课', value: 'live' },
  { label: '图文课', value: 'text' },
];

// Mock 10条数据，体现紧凑感
// const mockRows = ref(
//   Array.from({ length: 10 }).map((_, i) => ({
//     id: i + 1,
//     title:
//       i % 2 === 0
//         ? '全栈开发实战：从零构建高性能助手'
//         : '程序员副业指南：信息差变现之道',
//     cover: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
//     type: ['media', 'live', 'text'][i % 3],
//     price: (i * 50).toFixed(2),
//     buyCount: 100 + i * 150,
//     goodCount: 90,
//     midCount: 8,
//     badCount: 2,
//   }))
// );

// --- 3. 搜索与刷新逻辑 ---
// handleRefresh 应该接收组件传回来的新页码
// --- 3. 搜索与刷新逻辑 ---
const handleSearch = () => {
  queryParams.pageNum = 1;
  // 注意：useCourseSearchApi 如果是用的 useFetch 封装，
  // 必须确保 refresh 能拿到最新的 queryParams
  refresh();
};

const handleRefresh = (page) => {
  queryParams.pageNum = page;
  refresh();
};
// 在课程列表页的 <script setup> 中
const handleDetail = (id) => {
  // 注意：这里路径改成了并列的 course_detail
  navigateTo(`/course_detail/${id}`);
};
const handleNewCourse = () => navigateTo('/course/create');
</script>

<style scoped>
.course-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
.breadcrumb-wrapper {
  margin-bottom: 20px;
}

.pagination-wrapper {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>
