<template>
    <div>
        <n-breadcrumb class="breadcrumb-wrapper">
            <n-breadcrumb-item>
                <nuxt-link to="/">首页</nuxt-link>
            </n-breadcrumb-item>
            <n-breadcrumb-item>{{ title }}</n-breadcrumb-item>
        </n-breadcrumb>

        <BookSearch v-if="type == 'book'"  @search="handleSearch"  @singlesearch="handleSingleSearch"/>

        <LoadingGroup :pending="pending" :error="error" :is-empty="rows.length === 0">
            <template #loading>
                <LoadingBookSkeleton v-if="type == 'book'"/>
                <LoadingCourseSkeleton v-else/>
            </template>
            

            <n-grid :x-gap="20" :cols="4">
            <!-- 条件1：如果 a 有数据，就显示筛选的 a -->
                <template v-if="w">
                    <n-gi v-for="(item, index) in a" :key="item.id || index">
                    <BookList v-if="type == 'book'" :item="item" />
                    <CourseList v-else :item="item" />
                    </n-gi>
                </template>

            <!-- 条件2：否则显示默认的 rows -->
                <template v-else>
                    <n-gi v-for="(item, index) in rows" :key="item.id || index">
                    <BookList v-if="type == 'book'" :item="item" />
                    <CourseList v-else :item="item" />
                    </n-gi>
                </template>
            </n-grid>

            <div class="pagination-container">
                <n-pagination size="large" :page="page" :item-count="total" :page-size="limit" :on-update:page="handlePageChange"/>
            </div>
        </LoadingGroup>
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
    NBreadcrumbItem
} from "naive-ui"


const route = useRoute()
const { type } = route.params
const title = route.meta.title


// 定义初始搜索参数，对应后端要求的 body 结构
let initialFilters = {
    title: "",
    tagNameList: []
}



const {
    page,
    limit,
    total,
    handlePageChange,
    rows,
    pending,
    error,
    refresh,
    // 传入分页处理函数
} = await usePage(({ pageNum,pageSize, ...otherParams })=> {

    let query = {
        pageNum, 
        pageSize,
        ...otherParams
    }

    // 【新增】如果是课程，合并搜索和标签参数
    if (type == 'column') {
      query = { ...query, ...extraParams };
    }

    return useBookListApi(type,query)
}, initialFilters)


// 获取电子书的标签
async function handleSearch(queryParams){

  initialFilters.title = queryParams.keyword || '';
  initialFilters.tagNameList = Object.values(queryParams.tag || {});

  // const route = useRoute()
//   console.log('route ', route.params.page);


    const query = {
        pageNum: 1, 
        pageSize: 12, 
        ...initialFilters
    }
    await useBookListApi("book",query)

}



const a = ref()
const w = ref(false)
async function handleSingleSearch(sort) {
  console.log("当前选中的 sort =", sort);


  if (sort.a == "免费课程") {
    const { data } = await useFetch('http://127.0.0.1:8080/pc/book/getFilterBookList?filter=free', {
      method: 'GET',
      key: 'book-filter'
    })
        a.value = data.value?.data?.records;
        w.value = !w.value;
    }else{
        w.value = false;
    }


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
