<template>
  <div class="course-container">
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
import { ref, reactive, computed } from 'vue';
import CourseEditModal from '~/components/Course/CourseEditModal.vue';
import CourseFilter from '~/components/Course/CourseFilter.vue';
import CourseCard from '~/components/Course/CourseCard.vue';
import { NGrid, NGi, NPagination } from 'naive-ui';

// 1. 查询参数
const queryParams = reactive({
  keyword: '',
  tags: [],
  pageNum: 1,
  pageSize: 10,
});

// 2. 核心接口调用
// 建议：确保 queryParams 的变化能被 refresh 捕捉
const {
  data: resData,
  pending,
  refresh,
} = await useCourseSearchApi(queryParams);

// 3. 映射列表数据
const courseList = computed(() => {
  const actualData = resData.value?.data?.rows
    ? resData.value.data
    : resData.value;
  const rows = actualData?.rows || [];

  return rows.map((item) => ({
    ...item,
    buyCount: item.salesCount || 0,
    // 这里的域名根据你实际后端地址改，或者写死生产环境域名
    cover: item.cover
      ? item.cover.startsWith('http')
        ? item.cover
        : `http://localhost:8081${item.cover}`
      : 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
    ratingScore: item.ratingScore || 5,
  }));
});

// 4. 映射总条数
const totalCount = computed(() => {
  const actualData =
    resData.value?.data?.total !== undefined
      ? resData.value.data
      : resData.value;
  return actualData?.total || 0;
});

// 5. 弹窗控制
const showCreateModal = ref(false);

// 6. 静态配置
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

// --- 逻辑函数 ---

const handleSearch = () => {
  queryParams.pageNum = 1;
  refresh();
};

const handleRefresh = (page) => {
  // 这里的 page 是 n-pagination 传回来的页码
  queryParams.pageNum = page || 1;
  refresh();
};

const handleDetail = (id) => {
  // 确保路径和你的 pages 目录结构一致
  navigateTo(`/course_detail/${id}`);
};
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
