<template>
  <div class="create-book-page">
    <div class="page-header">
      <n-breadcrumb>
        <n-breadcrumb-item><nuxt-link to="/">首页</nuxt-link></n-breadcrumb-item>
        <n-breadcrumb-item><nuxt-link to="/list/book/1">电子书列表</nuxt-link></n-breadcrumb-item>
        <n-breadcrumb-item>新增电子书</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <div class="create-layout">
      <!-- 左侧：基本信息 -->
      <div class="info-panel">
        <n-card title="基本信息">
          <n-form :model="form" label-placement="top" :rules="rules" ref="formRef">

            <n-form-item label="书名" path="title">
              <n-input v-model:value="form.title" placeholder="请输入电子书名称" />
            </n-form-item>

            <n-form-item label="封面图片链接" path="cover">
              <n-input v-model:value="form.cover" placeholder="https://..." />
            </n-form-item>
            <div v-if="form.cover" class="cover-preview">
              <img :src="form.cover" alt="封面预览" @error="e => e.target.style.display='none'" />
            </div>

            <n-form-item label="简介" path="desc">
              <n-input v-model:value="form.desc" type="textarea" placeholder="一句话介绍这本书..." :rows="3" />
            </n-form-item>

            <n-form-item label="试读内容" path="try">
              <n-input v-model:value="form.try" type="textarea" placeholder="填写免费试读的内容片段..." :rows="3" />
            </n-form-item>

            <n-grid :cols="2" :x-gap="12">
              <n-gi>
                <n-form-item label="售价（元）" path="price">
                  <n-input-number v-model:value="form.price" :min="0" :precision="2" style="width:100%" />
                </n-form-item>
              </n-gi>
              <n-gi>
                <n-form-item label="原价（元）" path="t_price">
                  <n-input-number v-model:value="form.t_price" :min="0" :precision="2" style="width:100%" />
                </n-form-item>
              </n-gi>
            </n-grid>

            <n-form-item label="标签" path="tags">
              <n-select
                v-model:value="form.tags"
                multiple filterable tag
                placeholder="选择或输入标签，回车添加"
                :options="tagOptions"
              />
            </n-form-item>

          </n-form>
        </n-card>
      </div>

      <!-- 右侧：章节编辑 -->
      <div class="editor-panel">
        <n-card>
          <template #header>
            <div class="chapter-header">
              <span>章节内容</span>
              <n-button size="small" @click="addChapter">+ 新增章节</n-button>
            </div>
          </template>

          <!-- 章节 Tab -->
          <div class="chapter-tabs">
            <div
              v-for="(ch, idx) in form.chapters"
              :key="idx"
              class="chapter-tab"
              :class="{ active: currentIdx === idx }"
              @click="currentIdx = idx"
            >
              <span>第{{ idx + 1 }}章</span>
              <n-icon v-if="form.chapters.length > 1" size="14" class="del-icon" @click.stop="deleteChapter(idx)">
                <CloseOutline />
              </n-icon>
            </div>
          </div>

          <!-- 当前章节 -->
          <div class="chapter-form" v-if="currentChapter">
            <n-grid :cols="2" :x-gap="16" style="margin-bottom:16px">
              <n-gi>
                <div class="field-label">章节标题</div>
                <n-input v-model:value="currentChapter.title" placeholder="章节标题" />
              </n-gi>
              <n-gi>
                <div class="field-label">是否免费</div>
                <n-switch 
                  v-model:value="currentChapter.isFreeBoolean"
                  :disabled="isChapterFreeDisabled"
                >
                  <template #checked>免费</template>
                  <template #unchecked>付费</template>
                </n-switch>
                <div v-if="isChapterFreeDisabled" class="hint-text">电子书免费时，所有章节自动免费</div>
              </n-gi>
            </n-grid>

            <div class="field-label">章节内容</div>
            <client-only fallback="加载编辑器中...">
              <QuillEditor
                :key="currentIdx"
                v-model:content="currentChapter.content"
                content-type="html"
                theme="snow"
                :toolbar="toolbarOptions"
                placeholder="开始编写章节内容..."
                @ready="handleEditorReady"
              />
            </client-only>
          </div>
        </n-card>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <n-button size="large" @click="navigateTo('/list/book/1')">取消</n-button>
      <n-button size="large" type="primary" :loading="submitting" @click="handleSubmit">保存电子书</n-button>
    </div>
  </div>
</template>

<script setup>
import {
  NCard, NForm, NFormItem, NInput, NInputNumber, NSelect,
  NButton, NGrid, NGi, NSwitch, NIcon,
  NBreadcrumb, NBreadcrumbItem,
  useMessage
} from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const message = useMessage()
const formRef = ref(null)
const submitting = ref(false)
const currentIdx = ref(0)

const form = reactive({
  title: '',
  cover: '',
  desc: '',
  try: '',
  price: 0,
  t_price: 0,
  tags: [],
  chapters: [
    { title: '第一章', content: '', chapterNo: 1, sortOrder: 1, isFreeBoolean: true }
  ]
})

const rules = {
  title: { required: true, message: '请输入书名', trigger: 'blur' },
  price: { required: true, type: 'number', message: '请输入售价', trigger: 'blur' },
}

const tagOptions = [
  'Java', 'Python', 'Vue3', 'Nuxt3', 'Node.js', 'React',
  '编程', '后端', '前端', 'AI实战', '人工智能', '信息差'
].map(t => ({ label: t, value: t }))

const currentChapter = computed(() => form.chapters[currentIdx.value])

// 监听价格变化：免费电子书的所有章节自动设为免费
watch(() => form.price, (newPrice) => {
  if (newPrice === 0) {
    form.chapters.forEach(ch => {
      ch.isFreeBoolean = true
    })
  }
})

// 判断章节的免费开关是否禁用
const isChapterFreeDisabled = computed(() => form.price === 0)

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ header: [1, 2, 3, false] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link', 'image'],
  ['clean']
]

const handleEditorReady = (editor) => {
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  const formatHeader = (level) => editor.format('header', level)

  editor.keyboard.addBinding({ key: '1', ctrlKey: !isMac, metaKey: isMac, handler: () => formatHeader(1) })
  editor.keyboard.addBinding({ key: '2', ctrlKey: !isMac, metaKey: isMac, handler: () => formatHeader(2) })
  editor.keyboard.addBinding({ key: '3', ctrlKey: !isMac, metaKey: isMac, handler: () => formatHeader(3) })
  editor.keyboard.addBinding({ key: '0', ctrlKey: !isMac, metaKey: isMac, handler: () => formatHeader(false) })
}

const addChapter = () => {
  const no = form.chapters.length + 1
  form.chapters.push({
    title: `第${no}章`,
    content: '',
    chapterNo: no,
    sortOrder: no,
    isFreeBoolean: false
  })
  currentIdx.value = form.chapters.length - 1
}

const deleteChapter = (idx) => {
  form.chapters.splice(idx, 1)
  if (currentIdx.value >= form.chapters.length) {
    currentIdx.value = form.chapters.length - 1
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  // 组装后端需要的结构
  const payload = {
    title: form.title,
    cover: form.cover,
    desc: form.desc,
    try: form.try,
    price: form.price,
    t_price: form.t_price,
    tags: form.tags,
    chapters: form.chapters.map((ch, i) => ({
      title: ch.title,
      content: ch.content,
      chapterNo: i + 1,
      sortOrder: i + 1,
      isFree: ch.isFreeBoolean ? 1 : 0
    }))
  }

  submitting.value = true
  try {
    await $fetch('http://127.0.0.1:8080/pc/book/create', {
      method: 'POST',
      body: payload
    })
    message.success('电子书创建成功')
    navigateTo('/list/book/1')
  } catch (e) {
    message.error('创建失败，请重试')
    console.error(e)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-book-page {
  max-width: 1440px;
  margin: 0 auto;
  padding: 20px 24px;
}

.page-header {
  margin-bottom: 20px;
}

.create-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.info-panel {
  width: 380px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
}

.cover-preview {
  margin: -4px 0 16px;
}
.cover-preview img {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.editor-panel {
  flex: 1;
  min-width: 0;
}

.chapter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chapter-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.chapter-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 13px;
  cursor: pointer;
  background: #f9fafb;
  color: #374151;
  transition: all 0.15s;
  user-select: none;
}
.chapter-tab:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}
.chapter-tab.active {
  background: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.del-icon {
  cursor: pointer;
  opacity: 0.6;
}
.del-icon:hover { opacity: 1; }

.chapter-form {
  padding-top: 4px;
}

.field-label {
  font-size: 13px;
  color: #374151;
  margin-bottom: 6px;
  font-weight: 500;
}

.hint-text {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

/* Quill 编辑器样式修复 */
:deep(.ql-toolbar.ql-snow) {
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  background: #f8fafc;
  padding: 10px 12px;
}
:deep(.ql-container.ql-snow) {
  border: 1px solid #e5e7eb;
  border-radius: 0 0 8px 8px;
  font-size: 15px;
  line-height: 1.8;
}
:deep(.ql-editor) {
  min-height: 500px;
  padding: 20px 24px;
  color: #1f2937;
}
:deep(.ql-editor h1) { font-size: 28px; font-weight: 700; margin: 20px 0 12px; }
:deep(.ql-editor h2) { font-size: 22px; font-weight: 600; margin: 16px 0 10px; }
:deep(.ql-editor h3) { font-size: 18px; font-weight: 600; margin: 14px 0 8px; }
:deep(.ql-editor p)  { margin: 0 0 12px; }

.bottom-bar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #f0f0f0;
}
</style>
