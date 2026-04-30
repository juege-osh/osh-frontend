<template>
  <div class="editor-page">
    <section class="hero">
      <p class="hero-label">Edit Ebook</p>
      <h1>编辑电子书</h1>
      <p>这里会回显原始章节和 OSS 图片预览地址，保存时自动同步章节增删改与权限等级。</p>
    </section>

    <LoadingGroup :pending="loading" :error="error">
      <BookEditor ref="editorRef" :book-id="bookId" @save="handleSave" />
    </LoadingGroup>

    <div class="action-buttons">
      <n-button class="ghost-btn" @click="goBack">返回详情</n-button>
      <n-button type="primary" class="submit-btn" :loading="saving" @click="submitContent">
        保存电子书
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { NButton, createDiscreteApi } from 'naive-ui'
import { apiGetBookDetail, apiUpdateBook } from '~/composables/Api/Book/book'

const route = useRoute()
const bookId = Number(route.params.id)

useHead({ title: '编辑电子书' })

const { message } = createDiscreteApi(['message'])
const { hasPermission } = usePermission()
const canUpdate = computed(() => hasPermission('book:update'))

const editorRef = ref(null)
const loading = ref(true)
const error = ref(null)
const saving = ref(false)
const pendingBookData = ref(null)

function tryLoadEditorData() {
  if (!editorRef.value || !pendingBookData.value) return false
  editorRef.value.loadBookData(pendingBookData.value)
  pendingBookData.value = null
  return true
}

onMounted(async () => {
  if (!canUpdate.value) {
    message.error('没有编辑电子书权限')
    navigateTo('/list/book/1')
    return
  }

  try {
    const response = await apiGetBookDetail(bookId, { forEdit: true })
    if (response?.code && response.code !== 200) {
      throw new Error(response.msg || '加载失败')
    }

    pendingBookData.value = response?.data || response
    await nextTick()
    tryLoadEditorData()
  } catch (err) {
    console.error('load book detail failed', err)
    error.value = err
    message.error(err?.data?.msg || err?.message || '加载失败')
  } finally {
    loading.value = false
  }
})

watch(editorRef, () => {
  tryLoadEditorData()
}, { flush: 'post' })

function submitContent() {
  editorRef.value?.saveToDatabase()
}

async function handleSave(payload) {
  saving.value = true
  try {
    const response = await apiUpdateBook(payload)
    if (response?.code && response.code !== 200) {
      throw new Error(response.msg || '保存失败')
    }

    message.success('电子书已更新')
    navigateTo(`/detail/book/${bookId}`)
  } catch (err) {
    console.error('update book failed', err)
    message.error(err?.data?.msg || err?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

function goBack() {
  navigateTo(`/detail/book/${bookId}`)
}
</script>

<style scoped>
.editor-page {
  padding: 24px 0 48px;
}

.hero {
  margin-bottom: 20px;
  padding: 28px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top left, rgba(99, 102, 241, 0.32), transparent 28%),
    linear-gradient(135deg, #0f172a 0%, #1d4ed8 48%, #0f766e 100%);
  color: #fff;
  box-shadow: 0 26px 60px rgba(15, 23, 42, 0.2);
}

.hero-label {
  margin: 0 0 10px;
  font-size: 11px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  opacity: 0.72;
}

.hero h1 {
  margin: 0;
  font-size: clamp(30px, 4vw, 42px);
}

.hero p:last-child {
  margin: 12px 0 0;
  max-width: 680px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.82);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 22px;
}

.ghost-btn,
.submit-btn {
  min-width: 180px;
  height: 46px;
  border-radius: 16px;
}

@media (max-width: 768px) {
  .hero {
    padding: 22px;
    border-radius: 22px;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
