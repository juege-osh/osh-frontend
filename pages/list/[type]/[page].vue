<template>
    <div>
        <n-breadcrumb class="breadcrumb-wrapper">
            <n-breadcrumb-item>
                <nuxt-link to="/">首页</nuxt-link>
            </n-breadcrumb-item>
            <n-breadcrumb-item>{{ title }}</n-breadcrumb-item>
        </n-breadcrumb>

        <BookSearch v-if="type == 'book'" ref="bookSearchRef" @search="handleSearch" @singlesearch="handleSingleSearch"/>

        <LoadingGroup :pending="pending" :error="error" :is-empty="rows.length === 0">
            <template #loading>
                <LoadingBookSkeleton v-if="type == 'book'"/>
                <LoadingCourseSkeleton v-else/>
            </template>
            
            <n-grid :x-gap="20" :cols="4">
            <!-- 条件1：如果 a 有数据，就显示筛选的 a -->
                <template v-if="w">
                    <n-gi v-for="(item, index) in a" :key="item.id || index">
                    <BookList v-if="type == 'book'" :item="item" @tag-click="handleTagSearch" />
                    <CourseList v-else :item="item" />
                    </n-gi>
                </template>

            <!-- 条件2：否则显示默认的 rows -->
                <template v-else>
                    <n-gi v-for="(item, index) in rows" :key="item.id || index">
                    <BookList v-if="type == 'book'" :item="item" @tag-click="handleTagSearch" />
                    <CourseList v-else :item="item" />
                    </n-gi>
                </template>
            </n-grid>

            <div class="pagination-container">
                <n-pagination size="large" :page="page" :item-count="total" :page-size="limit" :on-update:page="handlePageChange"/>
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
    data,
} = await usePage(({ pageNum,pageSize, ...otherParams })=> {

    let query = {
        pageNum, 
        pageSize,
        ...otherParams
    }

    if(type == "group" || type == "flashsale"){
        query.usable = 1
    }

    return useBookListApi(type,query)
}, initialFilters)


// 搜索栏触发搜索（含标签点击）：直接更新 data 刷新 rows
async function handleSearch(queryParams){
    initialFilters.title = queryParams.keyword || ''
    initialFilters.tagNameList = queryParams.tag || []

    const res = await $fetch('http://127.0.0.1:8080/pc/book/page', {
        method: 'POST',
        body: { pageNum: 1, pageSize: limit.value, ...initialFilters }
    })
    // 更新 data 让 rows computed 自动刷新，同时清掉筛选态
    data.value = res?.data ?? data.value
    w.value = false
}



const a = ref([])
const w = ref(false)

const filterApiMap = {
  free: 'http://127.0.0.1:8080/pc/book/getFilterBookList?filter=free',
  paid_score: 'http://127.0.0.1:8080/pc/book/getFilterBookList?filter=paid_score',
  score: 'http://127.0.0.1:8080/pc/book/getFilterBookList?filter=score',
  gold: 'http://127.0.0.1:8080/pc/book/getFilterBookList?filter=gold',
  gold_small_class: 'http://127.0.0.1:8080/pc/book/getFilterBookList?filter=gold_small_class',
  internal: 'http://127.0.0.1:8080/pc/book/getFilterBookList?filter=internal',
}

const bookSearchRef = ref(null)

// 点击标签直接按标签搜索
async function handleTagSearch(tag) {
    bookSearchRef.value?.addTagAndSearch(tag)
}

async function handleSingleSearch(sort) {
  const filterKey = sort.a
  if (!filterKey || !filterApiMap[filterKey]) {
    w.value = false
    a.value = []
    return
  }

  try {
    const res = await $fetch(filterApiMap[filterKey], { method: 'GET' })
    a.value = res?.data?.records ?? []
    w.value = true
  } catch (e) {
    console.error('筛选请求失败', e)
    w.value = false
  }
}






definePageMeta({
    middleware:["list"]
})
</script>


<style scoped>
.breadcrumb-wrapper {
  margin-bottom: 1.25rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.25rem;
  margin-bottom: 2.5rem;
}

/* 添加基础样式 */
.x-gap-20 {
  column-gap: 1.25rem; /* 20px = 1.25rem */
}

.cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
</style>