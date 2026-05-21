<template>
    <div class="my-group-list">
        <n-card class="filter-card">
            <div class="flex items-center gap-4">
                <span class="filter-label">状态筛选：</span>
                <n-radio-group v-model:value="filterStatus" @update:value="handleFilterChange">
                    <n-radio-button :value="null">全部</n-radio-button>
                    <n-radio-button :value="0">进行中</n-radio-button>
                    <n-radio-button :value="1">已成团</n-radio-button>
                    <n-radio-button :value="2">已取消/过期</n-radio-button>
                </n-radio-group>
            </div>
        </n-card>

        <LoadingGroup :pending="pending" :error="error">
            <div v-if="rows.length > 0" class="group-records">
                <n-card 
                    v-for="item in rows" 
                    :key="item.groupWorkId || item.id"
                    class="record-card"
                    @click="viewDetail(item)"
                >
                    <div class="record-header">
                        <div class="flex items-center gap-2">
                            <n-tag :type="getRecordTagType(item.groupStatus)" size="small">
                                {{ item.groupStatusText || useGroupJoinStatusText(item.groupStatus) }}
                            </n-tag>
                            <span class="record-time">{{ formatTime(item.joinTime || item.created_time) }}</span>
                        </div>
                        <n-button 
                            v-if="item.orderStatus === 'pending' && item.orderNo" 
                            type="primary" 
                            size="small"
                            @click.stop="goPay(item)"
                        >
                            立即支付
                        </n-button>
                    </div>

                    <div class="record-body">
                        <div class="activity-info">
                            <h3 class="activity-title">{{ item.title || '拼团活动' }}</h3>
                            <p class="activity-desc">{{ item.cpu }} {{ item.memory }} {{ item.storage }}</p>
                        </div>

                        <div class="group-work-info">
                            <div class="info-row">
                                <span class="info-label">订单编号：</span>
                                <span class="info-value">{{ item.orderNo || '-' }}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">订单状态：</span>
                                <span class="info-value">{{ item.orderStatusText || '-' }}</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">拼团价格：</span>
                                <Price :value="item.actualPrice || item.basePrice" class="text-rose-500 font-bold"/>
                            </div>
                            <div class="info-row">
                                <span class="info-label">参团时间：</span>
                                <span class="info-value">{{ formatTime(item.joinTime) }}</span>
                            </div>
                        </div>

                        <!-- 已成团 - 显示服务器信息 -->
                        <div v-if="item.groupStatus === 1 && item.serverStartTime" class="server-info">
                            <n-alert type="success" :show-icon="false">
                                <template #header>
                                    <div class="flex items-center gap-2">
                                        <n-icon :component="CheckmarkCircle" size="20" color="#18a058"/>
                                        <span>已成团 - 服务器信息</span>
                                    </div>
                                </template>
                                <div class="server-details">
                                    <div class="detail-row">
                                        <span class="detail-label">服务器配置：</span>
                                        <span class="detail-value">{{ item.cpu }} {{ item.memory }} {{ item.storage }}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">服务器开始时间：</span>
                                        <span class="detail-value">{{ formatTime(item.serverStartTime) }}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">服务器结束时间：</span>
                                        <span class="detail-value">{{ formatTime(item.serverExpireTime) }}</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">剩余使用时间：</span>
                                        <span class="detail-value remaining-time">{{ item.remainingMonths ? Math.ceil(item.remainingMonths) + '个月' : '-' }}</span>
                                    </div>
                                    <div class="detail-row" v-if="item.adminContact">
                                        <span class="detail-label">管理员联系方式：</span>
                                        <span class="detail-value">{{ item.adminContact }}</span>
                                    </div>
                                </div>
                            </n-alert>
                        </div>
                    </div>

                    <div class="record-footer">
                        <div class="order-info">
                            <span class="order-label">订单号：</span>
                            <span class="order-no">{{ item.orderNo || '-' }}</span>
                        </div>
                        <n-button text @click.stop="viewDetail(item)">
                            查看详情
                            <template #icon>
                                <n-icon :component="ArrowForward"/>
                            </template>
                        </n-button>
                    </div>
                </n-card>
            </div>

            <Empty v-else desc="暂无拼团记录" />

            <!-- 分页 -->
            <div class="pagination-wrapper" v-if="totalPages > 1">
                <n-pagination 
                    v-model:page="currentPage"
                    :page-count="totalPages"
                    :page-size="data?.per_page || 10"
                    @update:page="handlePageChange"
                />
            </div>
        </LoadingGroup>
    </div>
</template>

<script setup>
import {
    NCard,
    NRadioGroup,
    NRadioButton,
    NTag,
    NButton,
    NAvatar,
    NPagination,
    NAlert,
    NIcon,
    createDiscreteApi
} from "naive-ui"
import { CheckmarkCircle, ArrowForward } from '@vicons/ionicons5'

definePageMeta({
    name: 'group-my',
    middleware: 'auth'
})

useHead({ title: '我的拼团' })

const defaultAvatar = 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'

const filterStatus = ref(null)
const currentPage = ref(1)

// 优化:使用计算属性处理数据,适配后端实际返回的数据结构
const {
    data,
    error,
    pending,
    refresh
} = await useGetMyGroupActivityListApi({ groupStatus: filterStatus.value }, currentPage.value)

// 调试:打印数据
if (process.client) {
    console.log('=== 我的拼团列表调试 ===')
    console.log('原始 data:', data.value)
}

const rows = computed(() => {
    if (!data.value) return []
    
    // 后端返回格式: { code: 200, msg: "查询成功", data: [...] }
    if (Array.isArray(data.value)) {
        return data.value
    }
    
    // 兼容旧格式
    if (data.value.data && Array.isArray(data.value.data)) {
        return data.value.data
    }
    
    if (data.value.rows && Array.isArray(data.value.rows)) {
        return data.value.rows
    }
    
    return []
})

const totalPages = computed(() => {
    // 新接口没有分页信息,默认1页
    if (data.value?.pages) return data.value.pages
    return 1
})

// 筛选状态变化
function handleFilterChange() {
    currentPage.value = 1
    refreshWithFilter()
}

// 页码变化
function handlePageChange(page) {
    currentPage.value = page
    refreshWithFilter()
}

// 带筛选条件刷新
async function refreshWithFilter() {
    try {
        const result = await useGetMyGroupActivityListApi(
            { groupStatus: filterStatus.value }, 
            currentPage.value
        )
        data.value = result.data.value
        error.value = result.error.value
    } catch (err) {
        console.error('刷新我的拼团列表失败:', err)
        error.value = err
    }
}

// 获取记录标签类型
function getRecordTagType(groupStatus) {
    const typeMap = {
        0: 'warning',    // 进行中
        1: 'success',    // 已成团
        2: 'error'       // 已取消/过期
    }
    return typeMap[groupStatus] || 'default'
}

// 查看详情
function viewDetail(item) {
    if (item.group_work_id) {
        navigateTo(`/group/work/${item.group_work_id}`)
    }
}

// 去支付
function goPay(item) {
    const orderNo = item.orderNo || item.order_no
    const title = item.title || '拼团订单'
    const price = item.actualPrice || item.basePrice || item.price || '0.00'
    navigateTo(`/pay?no=${orderNo}&name=${encodeURIComponent(title)}&money=${price}`)
}

// 格式化时间 - 优化:增加时间格式化处理
function formatTime(time) {
    if (!time) return ''
    const date = new Date(time)
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>

<style scoped>
.my-group-list {
    padding: 1rem 0;
}

.filter-card {
    margin-bottom: 1.5rem;
    border-radius: 8px;
}

.flex {
    display: flex;
}

.items-center {
    align-items: center;
}

.gap-2 {
    gap: 0.5rem;
}

.gap-4 {
    gap: 1rem;
}

.filter-label {
    font-weight: 600;
    color: #374151;
}

.group-records {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}

.record-card {
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
}

.record-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid #f3f4f6;
}

.record-time {
    font-size: 0.875rem;
    color: #6b7280;
}

.record-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.activity-info {
    margin-bottom: 0.5rem;
}

.activity-title {
    font-size: 1.125rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.activity-desc {
    font-size: 0.875rem;
    color: #6b7280;
}

.group-work-info {
    background-color: #f9fafb;
    padding: 1rem;
    border-radius: 6px;
}

.info-row {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.info-row:last-child {
    margin-bottom: 0;
}

.info-label {
    font-size: 0.875rem;
    color: #6b7280;
    min-width: 90px;
}

.info-value {
    font-size: 0.875rem;
    font-weight: 500;
}

.text-rose-500 {
    color: #f43f5e;
}

.font-bold {
    font-weight: 700;
}

.users-list {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.users-label {
    font-size: 0.875rem;
    color: #6b7280;
    min-width: 70px;
}

.users-avatars {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.more-users {
    font-size: 0.75rem;
    color: #6b7280;
    margin-left: 0.25rem;
}

.server-info {
    margin-top: 0.5rem;
}

.server-details {
    margin-top: 0.75rem;
}

.detail-row {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
}

.detail-row:last-child {
    margin-bottom: 0;
}

.detail-label {
    color: #6b7280;
    min-width: 100px;
}

.detail-value {
    font-weight: 500;
    color: #374151;
}

.remaining-time {
    color: #f43f5e;
    font-weight: 600;
}

.record-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: 1px solid #f3f4f6;
}

.order-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.order-label {
    font-size: 0.875rem;
    color: #6b7280;
}

.order-no {
    font-size: 0.875rem;
    font-family: monospace;
    color: #374151;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 2rem 0;
}
</style>
