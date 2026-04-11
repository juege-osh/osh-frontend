<template>
    <LoadingGroup :pending="pending" :error="error">
        <!-- 电子书内容容器，增加语义化类名便于样式控制 -->
        <div v-if="data" class="book-detail-content" v-html="data.content"></div>
        <div v-else>
            <n-result
                status="500"
                title="错误提醒"
                description="请先购买电子书"
            >
                <template #footer>
                <!-- <n-button>返回上一步</n-button> -->
                </template>
            </n-result>
        </div>

    </LoadingGroup>
</template>

<script setup>
import { 
    NResult,
    NButton

  } from "naive-ui"
const route = useRoute()
const { id, book_id } = route.params

const {
    data,
    error,
    pending
} = await useBookDetailApi(book_id, id)

// 修改页面标题
const title = computed(() => data.value ? data.value.title : "电子书详情页")
useHead({ title })

definePageMeta({
    middleware(to, from) {
        const { id } = to.params
        if (isNaN(+id)) {
            return abortNavigation("页面不存在")
        }
        return true
    }
})
</script>

<style>
/* 电子书详情内容容器 */
.book-detail-content {
    /* 基础布局：白色背景+圆角+内边距，适配通用页面风格 */
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    margin: 0 auto;
    /* 宽度控制：适配不同屏幕，最大宽度保证阅读体验 */
    max-width: 1200px;
    width: 100%;
    box-sizing: border-box;
}

/* 内容内图片自适应（避免溢出） */
.book-detail-content img {
    max-width: 100% !important;
    height: auto !important;
    display: block;
    margin: 10px 0;
}

/* 内容内文字排版优化（提升阅读体验） */
.book-detail-content p {
    line-height: 1.8;
    margin: 10px 0;
    font-size: 16px;
    color: #333333;
}

/* 内容内标题样式优化 */
.book-detail-content h1,
.book-detail-content h2,
.book-detail-content h3 {
    margin: 15px 0 10px;
    color: #222222;
}

/* 响应式适配：小屏幕下调整内边距 */
@media (max-width: 768px) {
    .book-detail-content {
        padding: 15px;
        margin: 0 10px;
    }
}
</style>