<template>
    <LoadingGroup :pending="pending" :error="error">
        <template v-if="data">
            <!-- 免费章节或已购买：显示内容 -->
            <div v-if="canRead" class="book-detail-content" v-html="data.content"></div>
            
            <!-- 付费章节且未购买：显示提示 -->
            <div v-else class="lock-notice">
                <n-result
                    status="warning"
                    title="付费章节"
                    description="此章节需要购买电子书后才能阅读"
                >
                    <template #footer>
                        <n-button type="primary" @click="goToBuy">立即购买</n-button>
                    </template>
                </n-result>
            </div>
        </template>
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

console.log('[BookRead] data:', data.value)

// 判断是否可以阅读：免费章节(isFree=1) 或 已购买(isbuy=true)
const canRead = computed(() => {
    if (!data.value) return false
    const isFree = data.value.isfree === 1 || data.value.isFree === 1
    const isBuy = data.value.isbuy === true || data.value.isBuy === true
    console.log('[BookRead] isFree:', isFree, 'isBuy:', isBuy)
    return isFree || isBuy
})

const goToBuy = () => {
    navigateTo(`/detail/book/${book_id}`)
}

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
.book-detail-content {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 20px;
    margin: 0 auto;
    max-width: 1200px;
    width: 100%;
    box-sizing: border-box;
}

.lock-notice {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 40px 20px;
    margin: 0 auto;
    max-width: 600px;
}

.book-detail-content img {
    max-width: 100% !important;
    height: auto !important;
    display: block;
    margin: 10px 0;
}

.book-detail-content p {
    line-height: 1.8;
    margin: 10px 0;
    font-size: 16px;
    color: #333333;
}

.book-detail-content h1,
.book-detail-content h2,
.book-detail-content h3 {
    margin: 15px 0 10px;
    color: #222222;
}

@media (max-width: 768px) {
    .book-detail-content {
        padding: 15px;
        margin: 0 10px;
    }
}
</style>