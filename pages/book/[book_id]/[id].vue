<template>
    <LoadingGroup :pending="pending" :error="error">
        <div v-if="data" class="book-content-wrapper">
            <article class="book-article" v-html="renderedContent"></article>
        </div>
        <div v-else class="error-state">
            <n-result
                status="warning"
                title="无法访问"
                description="请先购买电子书后再阅读完整内容"
            >
                <template #footer>
                    <n-button type="primary" @click="$router.back()">返回上一页</n-button>
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
import { hydrateRelativeImages } from '~/composables/Api/Book/book'

const route = useRoute()
const { id, book_id } = route.params

console.log('📖 电子书章节页面参数:', { book_id, id })

const {
    data,
    error,
    pending
} = await useBookDetailApi(book_id, id)

const renderedContent = ref('')

// 监听数据变化，输出调试信息
watch(() => data.value, (newData) => {
    console.log('📄 章节内容数据:', newData)
    if (newData) {
        console.log('✅ 章节标题:', newData.title)
        console.log('✅ 章节内容长度:', newData.content?.length || 0)
        console.log('✅ 内容预览:', newData.content?.substring(0, 100))
        hydrateRelativeImages(newData.content || '', 120)
          .then((html) => {
            renderedContent.value = html
          })
          .catch((err) => {
            console.error('hydrate chapter images failed', err)
            renderedContent.value = newData.content || ''
          })
    }
}, { immediate: true })

const title = computed(() => data.value ? data.value.title : "电子书详情页")
useHead({ title })

definePageMeta({
    middleware(to) {
        const { id } = to.params
        if (isNaN(+id)) {
            return abortNavigation("页面不存在")
        }
        return true
    }
})
</script>

<style scoped>
.book-content-wrapper {
    min-height: calc(100vh - 140px);
}

.book-article {
    padding: 2.6rem clamp(1.3rem, 2.5vw, 2.9rem) 3.4rem;
    background:
      radial-gradient(circle at top right, rgba(250, 204, 21, 0.16), transparent 26%),
      radial-gradient(circle at left center, rgba(96, 165, 250, 0.08), transparent 22%),
      linear-gradient(180deg, #fffefb 0%, #fbfdff 100%);
    border-radius: 30px;
    line-height: 1.95;
    font-size: 17px;
    color: #1f2937;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.86),
      0 24px 56px rgba(15,23,42,0.05);
    overflow-wrap: anywhere;
}

/* 标题样式 */
.book-article :deep(h1) {
    font-size: 36px;
    font-weight: 700;
    color: #10213a;
    margin: 2rem 0 1.5rem;
    padding-bottom: 0.8rem;
    border-bottom: 2px solid rgba(16, 33, 58, 0.14);
}

.book-article :deep(h2) {
    font-size: 28px;
    font-weight: 600;
    color: #10213a;
    margin: 1.75rem 0 1rem;
    padding-left: 0.9rem;
    border-left: 4px solid #f97316;
}

.book-article :deep(h3) {
    font-size: 22px;
    font-weight: 600;
    color: #333;
    margin: 1.5rem 0 0.875rem;
}

.book-article :deep(h4) {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 1.25rem 0 0.75rem;
}

/* 段落样式 */
.book-article :deep(p) {
    margin: 1rem 0;
    text-align: justify;
    word-break: break-word;
}

/* 列表样式 */
.book-article :deep(ul),
.book-article :deep(ol) {
    padding-left: 2rem;
    margin: 1rem 0;
}

.book-article :deep(li) {
    margin: 0.5rem 0;
    line-height: 1.8;
}

.book-article :deep(ul li) {
    list-style-type: disc;
}

.book-article :deep(ol li) {
    list-style-type: decimal;
}

/* 图片样式 */
.book-article :deep(img) {
    max-width: 100% !important;
    height: auto !important;
    display: block;
    margin: 1.8rem auto;
    border-radius: 18px;
    box-shadow: 0 18px 40px rgba(15,23,42,0.14);
}

/* 链接样式 */
.book-article :deep(a) {
    color: #18a058;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all 0.2s ease;
}

.book-article :deep(a:hover) {
    border-bottom-color: #18a058;
}

/* 代码样式 */
.book-article :deep(code) {
    background: rgba(15, 23, 42, 0.06);
    padding: 3px 8px;
    border-radius: 8px;
    font-family: 'SFMono-Regular', 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    color: #d03050;
}

.book-article :deep(pre) {
    display: block;
    clear: both;
    background: linear-gradient(180deg, #1f232b 0%, #141820 100%);
    color: #d8dee9;
    padding: 1.4rem 1.45rem;
    border-radius: 22px;
    overflow-x: auto;
    white-space: pre-wrap;
    margin: 1.75rem 0;
    box-shadow: 0 20px 38px rgba(15,23,42,0.16);
}

.book-article :deep(pre code) {
    background: none;
    padding: 0;
    color: inherit;
    font-size: 14px;
    white-space: inherit;
    word-break: break-word;
}

.book-article :deep(pre + p),
.book-article :deep(pre + div),
.book-article :deep(pre + h1),
.book-article :deep(pre + h2),
.book-article :deep(pre + h3),
.book-article :deep(pre + ul),
.book-article :deep(pre + ol),
.book-article :deep(pre + blockquote) {
    margin-top: 1.6rem;
}

/* 引用样式 */
.book-article :deep(blockquote) {
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    border-left: 4px solid #18a058;
    border-radius: 4px;
    color: #666;
}

.book-article :deep(blockquote p) {
    margin: 0.5rem 0;
}

/* 表格样式 */
.book-article :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.book-article :deep(th),
.book-article :deep(td) {
    padding: 0.75rem 1rem;
    border: 1px solid #e8e8e8;
    text-align: left;
}

.book-article :deep(th) {
    background: #f5f7fa;
    font-weight: 600;
    color: #1a1a1a;
}

.book-article :deep(tr:hover) {
    background: #fafafa;
}

/* 分隔线 */
.book-article :deep(hr) {
    border: none;
    border-top: 2px solid #e8e8e8;
    margin: 2rem 0;
}

/* 强调样式 */
.book-article :deep(strong) {
    font-weight: 600;
    color: #1a1a1a;
}

.book-article :deep(em) {
    font-style: italic;
    color: #666;
}

.error-state {
    padding: 3rem 1rem;
}

@media (max-width: 768px) {
    .book-article {
        padding: 1.6rem 1rem;
        font-size: 15px;
    }
    
    .book-article :deep(h1) {
        font-size: 26px;
    }
    
    .book-article :deep(h2) {
        font-size: 22px;
    }
    
    .book-article :deep(h3) {
        font-size: 18px;
    }
}
</style>
