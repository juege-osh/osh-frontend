<template>
    <div>
        <h5 class="search-title">"{{ title }}"的搜索相关结果</h5>
        <UiTab>
            <UiTabItem :active="type === item.value" v-for="(item,index) in tabs" :key="index" @click="handleClick(item.value)">{{ item.label }}</UiTabItem>
        </UiTab>

        <LoadingGroup :pending="pending" :error="error">
            <n-grid :x-gap="20" :cols="4">
                <n-gi v-for="(item,index) in rows" :key="index">
                    <CourseList :item="item"/>
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
    NPagination
} from "naive-ui"
const route = useRoute()
const title = ref(route.query.keyword)
const type = ref(route.params.type)
useHead({ title })

const tabs = [{
    label:"课程",
    value:"course"
},{
    label:"专栏",
    value:"column"
}]

const handleClick = (t)=>{
    navigateTo({
        params:{
            ...route.params,
            type:t
        },
        query:{
            ...route.query,
        }
    })
}

const {
    page,
    limit,
    total,
    handlePageChange,
    rows,
    pending,
    error,
    refresh
} = await usePage(({ page,limit })=>useSearchListApi(()=>{
    return {
        page,
        keyword:encodeURIComponent(title.value),
        type:type.value
    }
}))

const stop = watch(()=>route.query.keyword,(newVal)=>{
    title.value = newVal
    refresh()
})

onBeforeUnmount(()=>stop())

definePageMeta({
    middleware:["search"]
})
</script>

<style scoped>
.search-title {
    font-size: 1.125rem;
    margin: 0.75rem 0;
}

.pagination-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1.25rem 0 2.5rem 0;
}
</style>
