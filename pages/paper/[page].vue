<template>
    <n-grid :x-gap="20">
        <n-grid-item :span="18">
            <LoadingGroup :pending="pending" :error="error" :is-empty="rows.length === 0">
            <TestpaperList v-for="(item,index) in rows" :key="index" :item="item"/>
            <div class="pagination-wrapper">
                <n-pagination size="large" :page="page" :item-count="total" :page-size="limit" :on-update:page="handlePageChange"/>
            </div>
        </LoadingGroup>
        </n-grid-item>
        <n-grid-item :span="6">
            <HotCourseList/>
        </n-grid-item>
    </n-grid>
</template>
<script setup>
import {
    NButton,
    NGrid,
    NGridItem,
    NPagination
} from "naive-ui"
const route = useRoute()

const {
    page,
    limit,
    total,
    handlePageChange,
    rows,
    pending,
    error,
    refresh
} = await usePage(({ pageNum, pageSize })=> {
    return useListApi("testpaper", { pageNum, pageSize })
})

useHead({
    title:"考试列表"
})
</script>

<style scoped>
.pagination-wrapper {
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

.span-18 {
  flex: 0 0 75%; /* 18/24 = 75% */
}

.span-6 {
  flex: 0 0 25%; /* 6/24 = 25% */
}
</style>