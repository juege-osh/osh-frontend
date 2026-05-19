<template>
    <div class="resource-group-list" ref="listContainer">
        <!-- 加载状态 -->
        <div v-if="loading && items.length === 0" class="list-loading-state">
            <n-spin size="large" />
            <p class="loading-text">加载中...</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading && items.length === 0" class="list-empty-state">
            <n-empty :description="emptyText" />
        </div>

        <!-- 列表容器 -->
        <div v-else class="list-container" role="list" aria-label="资源组列表">
            <div
                v-for="item in items"
                :key="item.id"
                class="list-item"
                role="listitem"
            >
                <slot :item="item" :index="items.indexOf(item)" />
            </div>

            <!-- 加载更多状态 -->
            <div v-if="loading" class="list-loading-more" role="status" aria-live="polite">
                <n-spin size="small" />
                <span class="loading-more-text">加载中...</span>
            </div>

            <!-- 加载完成提示 -->
            <div v-else-if="finished" class="list-finished" role="status">
                <span class="finished-text">{{ finishedText }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { NSpin, NEmpty } from 'naive-ui'

const props = defineProps({
    // 列表数据
    items: {
        type: Array,
        required: true,
        default: () => []
    },
    // 加载状态
    loading: {
        type: Boolean,
        default: false
    },
    // 是否加载完成
    finished: {
        type: Boolean,
        default: false
    },
    // 空状态文本
    emptyText: {
        type: String,
        default: '暂无数据'
    },
    // 加载完成文本
    finishedText: {
        type: String,
        default: '已加载全部数据'
    },
    // 是否启用滚动加载
    infiniteScroll: {
        type: Boolean,
        default: true
    },
    // 滚动触发距离（距离底部多少像素时触发加载）
    scrollThreshold: {
        type: Number,
        default: 100
    }
})

const emit = defineEmits(['load-more'])

const listContainer = ref(null)

// 滚动处理
function handleScroll() {
    if (!props.infiniteScroll || !listContainer.value) return
    if (props.loading || props.finished) return

    const container = listContainer.value
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight

    // 当滚动到距离底部指定阈值时触发加载
    if (scrollTop + clientHeight >= scrollHeight - props.scrollThreshold) {
        emit('load-more')
    }
}

// 生命周期
onMounted(() => {
    if (props.infiniteScroll && listContainer.value) {
        listContainer.value.addEventListener('scroll', handleScroll)
    }
})

onUnmounted(() => {
    if (listContainer.value) {
        listContainer.value.removeEventListener('scroll', handleScroll)
    }
})

// 暴露方法供外部调用
defineExpose({
    listContainer,
    scrollToTop: () => {
        if (listContainer.value) {
            listContainer.value.scrollTop = 0
        }
    }
})
</script>

<style scoped>
.resource-group-list {
    width: 100%;
}

.list-container {
    width: 100%;
    min-height: 400px;
    max-height: calc(100vh - 240px);
    overflow-y: auto;
    padding-right: 8px;
    scroll-behavior: smooth;
}

/* 滚动条样式优化 */
.list-container::-webkit-scrollbar {
    width: 6px;
}

.list-container::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.list-container::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
    transition: background 0.2s;
}

.list-container::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.list-loading-state,
.list-empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    max-height: calc(100vh - 240px);
    background: #fff;
    border-radius: 8px;
    padding: 40px;
}

.loading-text {
    margin-top: 16px;
    font-size: 14px;
    color: #6b7280;
}

.list-item {
    margin-bottom: 16px;
    transition: transform 0.2s;
}

.list-item:last-child {
    margin-bottom: 0;
}

/* 加载更多状态 */
.list-loading-more,
.list-finished {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 0;
    gap: 8px;
}

.loading-more-text,
.finished-text {
    font-size: 13px;
    color: #6b7280;
}

.finished-text {
    color: #9ca3af;
}
</style>
