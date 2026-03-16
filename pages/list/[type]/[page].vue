<template>
    <div>
        <n-breadcrumb class="breadcrumb-wrapper">
            <n-breadcrumb-item>
                <nuxt-link to="/">首页</nuxt-link>
            </n-breadcrumb-item>
            <n-breadcrumb-item>{{ title }}</n-breadcrumb-item>
        </n-breadcrumb>

        <LoadingGroup :pending="pending" :error="error" :is-empty="rows.length === 0">
            <template #loading>
                <LoadingBookSkeleton v-if="type == 'book'"/>
                <LoadingCourseSkeleton v-else/>
            </template>
            <n-grid :x-gap="20" :cols="type == 'book' ? 2 : 4">
                <n-gi v-for="(item,index) in rows" :key="index">
                    <BookList v-if="type == 'book'" :item="item"/>
                    <CourseList v-else :item="item"/>
                </n-gi>
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

const {
    page,
    limit,
    total,
    handlePageChange,
    rows,
    pending,
    error,
    refresh
} = await usePage(({ page,limit })=> {

    let query = {
        page
    }

    if(type == "group" || type == "flashsale"){
        query.usable = 1
    }

    return useListApi(type,query)
})

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