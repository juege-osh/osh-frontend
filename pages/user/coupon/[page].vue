<template>
    <LoadingGroup :pending="pending" :error="error" :isEmpty="rows.length === 0">
        <div class="coupon-content">
            <n-grid :x-gap="20" :cols="2">
                <n-grid-item v-for="(item,index) in rows" :key="index">
                    <UserCouponList :item="item"/>
                </n-grid-item>
            </n-grid>
        </div>
        <div class="pagination-container">
            <n-pagination size="large" :page="page" :item-count="total" :page-size="limit" :on-update:page="handlePageChange"/>
        </div>
    </LoadingGroup>
</template>

<script setup>
import {
    NGrid,
    NGridItem,
    NPagination
} from "naive-ui"

useHead({ title:"优惠券记录" })

const {
    page,
    limit,
    total,
    handlePageChange,
    rows,
    pending,
    error,
} = await usePage(({ page,limit })=>useUserCouponApi(page))
</script>

<style scoped>
.coupon-content {
  padding: 0.75rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.25rem;
  padding-bottom: 2.5rem;
}
</style>