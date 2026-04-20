<template>
    <div class="list-page">
        <n-breadcrumb class="breadcrumb">
            <n-breadcrumb-item>
                <nuxt-link to="/">首页</nuxt-link>
            </n-breadcrumb-item>
            <n-breadcrumb-item>{{ title }}</n-breadcrumb-item>
        </n-breadcrumb>

        <BookSearch v-if="type == 'book'" @search="handleSearch" @singlesearch="handleSingleSearch"/>

        <LoadingGroup :pending="pending" :error="error" :is-empty="rows.length === 0">
            <template #loading>
                <LoadingBookSkeleton v-if="type == 'book'"/>
                <LoadingCourseSkeleton v-else/>
            </template>
            
            <div class="list-grid">
                <!-- 条件1：如果 a 有数据，就显示筛选的 a -->
                <template v-if="w">
                    <BookList v-if="type == 'book'" v-for="(item, index) in a" :key="item.id || index" :item="item" />
                    <CourseList v-else v-for="(item, index) in a" :key="item.id || index" :item="item" />
                </template>

                <!-- 条件2：否则显示默认的 rows -->
                <template v-else>
                    <BookList v-if="type == 'book'" v-for="(item, index) in rows" :key="item.id || index" :item="item" />
                    <CourseList v-else v-for="(item, index) in rows" :key="item.id || index" :item="item" />
                </template>
            </div>

            <div class="pagination-container">
                <n-pagination size="large" :page="page" :item-count="total" :page-size="limit" :on-update:page="handlePageChange"/>
            </div>
        </LoadingGroup>
    </div>
</template>

<script setup>
import {
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
} = await usePage(({ pageNum, pageSize, ...otherParams }) => {
    let query = {
        pageNum, 
        pageSize,
        ...otherParams
    }

    if(type == "group" || type == "flashsale"){
        query.usable = 1
    }

    return useBookListApi(type, query)
}, initialFilters)

// 获取电子书的标签
async function handleSearch(queryParams){
    initialFilters.title = queryParams.keyword || '';
    initialFilters.tagNameList = Object.values(queryParams.tag || {});

    const query = {
        pageNum: 1, 
        pageSize: 12, 
        ...initialFilters
    }
    await useBookListApi("book", query)
}

const a = ref()
const w = ref(false)

async function handleSingleSearch(sort) {
    console.log("当前选中的 sort =", sort);

    if (sort.a == "免费课程") {
        // 使用相对路径，让 useHttp 自动处理 baseURL
        const { data } = await useFetch('/book/getFilterBookList?filter=free', {
            method: 'GET',
            key: 'book-filter'
        })
        a.value = data.value?.data?.records;
        w.value = !w.value;
    } else {
        w.value = false;
    }
}

definePageMeta({
    middleware: ["list"]
})
</script>

<style scoped>
.list-page {
    padding: var(--space-lg) 0;
}

.breadcrumb {
    margin-bottom: var(--space-xl);
}

.list-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
}

.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: var(--space-xl);
    margin-bottom: var(--space-2xl);
}

@media (max-width: 1200px) {
    .list-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 992px) {
    .list-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .list-grid {
        grid-template-columns: 1fr;
    }
}
</style>