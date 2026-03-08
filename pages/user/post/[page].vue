<template>
    <LoadingGroup :pending="pending" :error="error" :isEmpty="rows.length === 0">
        <div class="p-3">
            <PostList v-for="(item,index) in rows" :key="index" :item="item" @delete="handleDeleteItem"/>
        </div>
        <div class="pagination-container">
            <n-pagination size="large" :page="page" :item-count="total" :page-size="limit" :on-update:page="handlePageChange"/>
        </div>
    </LoadingGroup>
</template>
<script setup>
import {
    NPagination
} from "naive-ui"

useHead({ title:"我的帖子" })

const {
    page,
    limit,
    total,
    handlePageChange,
    rows,
    pending,
    error,
    refresh
} = await usePage(({ page,limit })=>useMypostListApi(page))

async function handleDeleteItem({ id,success,fail }){
    let {
        error
    } = await useDeletePostApi(id)
    if(error.value){
        fail()
    } else {
        success()
        refresh()
    }
}
</script>
<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.25rem;
  padding-bottom: 2.5rem;
}
</style>
