<template>
  <div class="course-container">
    <CourseFilter
      v-model:modelValue="queryParams"
      :tag-options="tagOptions"
      :type-options="typeOptions"
      @search="handleSearch"
      @create="showCreateModal = true"
    />

    <div class="list-main-section">
      <Transition name="fade">
        <div v-if="pending" class="loading-overlay">
          <n-spin size="large" />
        </div>
      </Transition>

      <ClientOnly>
        <div class="grid-content-box">
          <n-grid
            v-if="courseList && courseList.length > 0"
            :x-gap="16"
            :y-gap="16"
            :cols="5"
          >
            <n-gi v-for="item in courseList" :key="item.id">
              <CourseCard
                :item="item"
                @click="handleDetail(item.id)"
                @favorite="handleDoCollect"
              />
            </n-gi>
          </n-grid>

          <div v-else-if="!pending" class="empty-placeholder">
            <n-empty description="暂无课程数据" />
          </div>
        </div>
      </ClientOnly>

      <div class="pagination-footer">
        <n-pagination
          v-model:page="queryParams.pageNum"
          :item-count="totalCount"
          :page-size="queryParams.pageSize"
          @update:page="handleRefresh"
        />
      </div>
    </div>

    <CourseEditModal v-model:show="showCreateModal" @success="handleRefresh" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { createDiscreteApi } from 'naive-ui';
import CourseEditModal from '~/components/Course/CourseEditModal.vue';
import CourseFilter from '~/components/Course/CourseFilter.vue';
import CourseCard from '~/components/Course/CourseCard.vue';
import { NGrid, NGi, NPagination } from 'naive-ui';
import { fetchConfig } from '~/composables/useHttp';
import { apiCollectCourse, apiRemoveCollect, apiGetCoverUrls } from '~/composables/Api/Course/course';

// 1. 核心修复：在查询参数中增加新的两个字段，并给默认排序赋值
const queryParams = reactive({
  keyword: '',
  tags: [],
  pageNum: 1,
  pageSize: 10,
  isFree: null, // (已有)
  isFollowing: false, // (已有)

  // ✨ 新增这两个 ✨
  sortType: 'createTime', // 默认按时间
  courseNo: '', // 编号ID
});

// 2. 核心接口调用
// 建议：确保 queryParams 的变化能被 refresh 捕捉
const {
  data: resData,
  pending,
  refresh,
} = await useCourseSearchApi(queryParams);
const courseList = ref([]);

// 3. 映射列表数据
watch(
  () => resData.value,
  async (newVal) => {
    if (newVal) {
      const actualData = newVal?.data?.rows ? newVal.data : newVal;
      const rows = actualData?.rows || [];

      // 先映射基础数据
      const list = rows.map((item) => ({
        ...item,
        isFavorite: item.isFavorite || false,
        favoriteCount: item.favoriteCount || 0,
        buyCount: item.salesCount || 0,
        cover: item.cover || 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
        ratingScore: item.ratingScore || 5,
      }));

      courseList.value = list;
    }
  },
  { immediate: true }
);

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

const typeOptions = [
  { label: '视频课', value: 'media' },
  { label: '直播课', value: 'live' },
  { label: '图文课', value: 'text' },
];

// 3. 映射数据格式 (将后端返回的 List<Map> 转成 Naive UI 要求的 label/value)
// 假设你用 resData 接收了标签接口的返回值
// 3. 映射数据格式 (将后端返回的 name/id 转成 Naive UI 要求的 label/value)

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

const handleDoCollect = async (courseId) => {
  const { message } = createDiscreteApi(['message']);
  const course = courseList.value.find((c) => c.id === courseId);
  if (!course) return;

  const wasCollected = course.isFavorite;
  // 乐观更新
  course.isFavorite = !wasCollected;
  course.favoriteCount = wasCollected
    ? Math.max(0, (course.favoriteCount || 0) - 1)
    : (course.favoriteCount || 0) + 1;

  try {
    const res = wasCollected
      ? await apiRemoveCollect(courseId)
      : await apiCollectCourse(courseId);

    if (res?.code === 200) {
      message.success(wasCollected ? '已取消收藏' : '收藏成功');
    } else {
      // 回滚
      course.isFavorite = wasCollected;
      course.favoriteCount = wasCollected
        ? (course.favoriteCount || 0) + 1
        : Math.max(0, (course.favoriteCount || 0) - 1);
      message.error(res?.msg || '操作失败');
    }
  } catch {
    course.isFavorite = wasCollected;
    message.error('请求失败');
  }
};
</script>
<style scoped>
.course-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.list-main-section {
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 上方箭头距离控制 */
.status-bar {
  padding: 10px 0;
  font-size: 13px;
  color: #ff4d4f; /* 对应你截图里的红色字体 */
}

/* ✨ 解决分页器看不到的核心：限制内容区总高度 */
.grid-content-box {
  /* 既然卡片高了，我们就通过 min-height 确保位置，但不设死 height */
  min-height: 480px;
  margin-bottom: 20px; /* 下方箭头距离控制 */
}

/* ✨ 压低单项卡片高度：防止挤压分页器 */
:deep(.limit-card) {
  /* 这里的 230px-250px 是关键，根据你的实际卡片内容微调 */
  height: 240px !important;
  overflow: hidden;
}

/* 强制卡片内的图片高度，防止撑开卡片 */
:deep(.limit-card .n-card-cover img) {
  height: 130px;
  object-fit: cover;
}

.pagination-footer {
  display: flex;
  justify-content: center;
  padding-bottom: 30px;
}

.loading-overlay {
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
