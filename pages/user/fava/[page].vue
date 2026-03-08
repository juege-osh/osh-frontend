<template>
    <LoadingGroup :pending="pending" :error="error" :isEmpty="rows.length === 0">
        <div class="content-wrapper">
            <UserFavaList v-for="(item,index) in rows" :key="index" :item="item" @delete="handleDeleteItem"/>
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

useHead({ title:"我的收藏" })

const {
    page,
    limit,
    total,
    handlePageChange,
    rows,
    pending,
    error,
    refresh
} = await usePage(({ page,limit })=>useMyFavaListApi(page))

async function handleDeleteItem({ goods_id,type,success,fail }){
    let {
        error
    } = await useUncollectApi({
        goods_id,
        type
    })

    if(error.value){
        fail()
    } else {
        success()
        refresh()
    }
}
</script>

<style scoped>
.content-wrapper {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  padding-bottom: 3rem;
}
</style>