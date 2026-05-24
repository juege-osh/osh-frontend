<template>
    <div>
        <!-- 状态筛选 Tab -->
        <n-tabs type="line" :value="activeTab" @update:value="handleTabChange" class="order-tabs">
            <n-tab name="all">全部</n-tab>
            <n-tab name="paid">已支付</n-tab>
            <n-tab name="canceled">已取消</n-tab>
        </n-tabs>

        <LoadingGroup :pending="pending" :error="error" :isEmpty="rows.length === 0">
            <div class="p-3">
                <UserBuyList v-for="(item,index) in rows" :key="index" :item="item"/>
            </div>
            <div class="flex justify-center items-center mt-5 pagination-container">
                <n-pagination size="large" :page="page" :item-count="total" :page-size="limit" :on-update:page="handlePageChange"/>
            </div>
        </LoadingGroup>
    </div>
</template>
<script setup>
import {
    NPagination,
    NTabs,
    NTab
} from "naive-ui"

useHead({ title:"订单记录" })

const route = useRoute()

// 从 query 中读取当前 tab 状态
const activeTab = ref(route.query.status || 'all')

// tab 对应的后端 status 值
const tabStatusMap = {
    all: '',
    paid: '1',
    canceled: '2'
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
} = await usePage(({ pageNum }) => useOrderListApi(pageNum, tabStatusMap[activeTab.value]))

// 切换 Tab 时重新查询
const handleTabChange = (tab) => {
    activeTab.value = tab
    navigateTo({
        params: { page: 1 },
        query: { status: tab === 'all' ? undefined : tab }
    })
}

// 监听路由 query 变化刷新数据
watch(() => route.query.status, (newStatus) => {
    activeTab.value = newStatus || 'all'
    refresh()
})
</script>

<style scoped>
.order-tabs {
  margin-bottom: 1rem;
  padding: 0 0.75rem;
}

.pagination-container {
  padding-bottom: 2.5rem;
}
</style>
