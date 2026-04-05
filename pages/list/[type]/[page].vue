<template>
  <div>
    <n-breadcrumb class="breadcrumb-wrapper">
      <n-breadcrumb-item><nuxt-link to="/">首页</nuxt-link></n-breadcrumb-item>
      <n-breadcrumb-item>{{ title }}</n-breadcrumb-item>
    </n-breadcrumb>

    <div v-if="type === 'column'" class="course-filter-section">
      <n-space vertical size="large">
        <n-input-group>
          <n-input
            v-model:value="extraParams.keyword"
            placeholder="搜索课程..."
            @keyup.enter="handleSearch"
          />
          <n-button type="primary" @click="handleSearch">搜索</n-button>
        </n-input-group>
        <n-space align="center">
          <span style="font-weight: bold">标签：</span>
          <n-checkbox-group
            v-model:value="extraParams.tagIds"
            @update:value="handleSearch"
          >
            <n-checkbox v-for="t in tags" :key="t.id" :value="t.id">{{
              t.name
            }}</n-checkbox>
          </n-checkbox-group>
        </n-space>
      </n-space>
    </div>

    <LoadingGroup
      :pending="pending"
      :error="error"
      :is-empty="rows.length === 0"
    >
      <template #loading>
        <LoadingBookSkeleton v-if="type == 'book'" />
        <LoadingCourseSkeleton v-else />
      </template>

      <n-grid :x-gap="20" :y-gap="20" :cols="type == 'book' ? 2 : 4">
        <n-gi v-for="(item, index) in rows" :key="index">
          <BookList v-if="type == 'book'" :item="item" />

          <div
            v-else-if="type == 'column'"
            class="custom-course-card"
            @click="navigateTo(`/course/detail/${item.id}`)"
          >
            <div class="course-img-box">
              <img :src="item.cover" />
              <div class="type-tag">
                {{ item.type === 'media' ? '视频' : '图文' }}
              </div>
            </div>
            <div class="course-body">
              <div class="course-name">{{ item.title }}</div>
              <div class="price-info">
                <span class="price">¥{{ item.price }}</span>
                <span class="count">{{ item.buyCount }}人学过</span>
              </div>
              <div class="rating-bar">
                <span class="r-g">好评 {{ item.goodCount }}</span>
                <span class="r-m">中评 {{ item.midCount }}</span>
                <span class="r-b">差评 {{ item.badCount }}</span>
              </div>
            </div>
          </div>

          <CourseList v-else :item="item" />
        </n-gi>
      </n-grid>

      <div class="pagination-container">
        <n-pagination
          size="large"
          :page="page"
          :item-count="total"
          :page-size="limit"
          @update:page="handlePageChange"
        />
      </div>
    </LoadingGroup>
  </div>
</template>

<script setup>
import {
  NGrid,
  NGi,
  NPagination,
  NBreadcrumb,
  NBreadcrumbItem,
  NInput,
  NInputGroup,
  NSpace,
  NCheckbox,
  NCheckboxGroup,
  NButton,
} from 'naive-ui';

const route = useRoute();
const { type } = route.params;
const title = route.meta.title;

// 【新增】课程模块特有的筛选参数
const extraParams = reactive({
  keyword: '',
  tagIds: [],
});
const tags = ref([]); // 用于存放从后端获取的标签列表

const { page, limit, total, handlePageChange, rows, pending, error, refresh } =
  await usePage(({ page, limit }) => {
    let query = { page, limit };

    // 原有逻辑：拼团/秒杀过滤
    if (type == 'group' || type == 'flashsale') {
      query.usable = 1;
    }

    // 【新增】如果是课程，合并搜索和标签参数
    if (type == 'column') {
      query = { ...query, ...extraParams };
    }

    return useListApi(type, query);
  });

// 搜索刷新
const handleSearch = () => {
  page.value = 1;
  refresh();
};

// 如果是课程，初始化加载标签
if (type === 'column') {
  const { data } = await useHttpGet('get-tags', '/course/tags');
  tags.value = data.value || [];
}

definePageMeta({
  middleware: ['list'],
});
</script>

<style scoped>
/* 保持原有样式并增加课程卡片美化 */
.breadcrumb-wrapper {
  margin-bottom: 1.25rem;
}
.course-filter-section {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #efeff5;
}

.custom-course-card {
  background: #fff;
  border: 1px solid #efeff5;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}
.custom-course-card:hover {
  transform: translateY(-5px);
  border-color: #26a67a;
}

.course-img-box {
  position: relative;
  height: 140px;
}
.course-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
}
.type-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 2px 6px;
  font-size: 12px;
  border-radius: 4px;
}

.course-body {
  padding: 12px;
}
.course-name {
  font-weight: bold;
  height: 40px;
  overflow: hidden;
  margin-bottom: 8px;
}
.price-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.price {
  color: #e53e3e;
  font-size: 18px;
  font-weight: bold;
}
.count {
  color: #999;
  font-size: 12px;
}

.rating-bar {
  display: flex;
  gap: 4px;
  border-top: 1px solid #f4f4f5;
  pt: 8px;
}
.rating-bar span {
  font-size: 11px;
  padding: 2px 5px;
  border-radius: 3px;
  flex: 1;
  text-align: center;
}
.r-g {
  background: #f0fdf4;
  color: #16a34a;
}
.r-m {
  background: #f8fafc;
  color: #64748b;
}
.r-b {
  background: #fef2f2;
  color: #dc2626;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}
</style>
