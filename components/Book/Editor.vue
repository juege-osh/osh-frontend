<template>
  <client-only fallback="加载编辑器中...">
    <div class="editor-layout">
      <!-- 左侧：书名 + 章节 + 目录 -->
      <div class="toc-sidebar">
        <div class="book-title-wrap">
          <input
            v-model="bookInfo.title"
            class="book-title-input"
            placeholder="请输入电子书名称"
            @blur="handleBookTitleBlur"
          />
        </div>
        <div class="toc-divider"></div>

        <!-- 章节列表 -->
        <div class="chapter-list">
          <div
            v-for="(chapter, idx) in chapters"
            :key="chapter.id || idx"
            class="chapter-item"
            :class="{ active: currentChapterIndex === idx }"
            @click="switchChapter(idx)"
          >
            <span class="chapter-num">第{{ idx + 1 }}章</span>
            <span class="chapter-title">{{ chapter.title || '未命名章节' }}</span>
            <button
              class="del-btn"
              v-if="chapters.length > 1"
              @click.stop="deleteChapter(idx)"
            >×</button>
          </div>
          <button class="add-chapter-btn" @click="addChapter">
            + 新增章节
          </button>
        </div>

        <div class="toc-divider mt-4"></div>

        <!-- 自动目录 -->
        <h3 class="toc-title">目录</h3>
        <div class="toc-divider"></div>
        <ul class="toc-list">
          <li
            v-for="(item, index) in tocList"
            :key="index"
            :class="['toc-item', `toc-level-${item.level}`]"
          >
            {{ item.text }}
          </li>
          <li v-if="tocList.length === 0" class="toc-empty">暂无标题</li>
        </ul>
      </div>

      <!-- 右侧编辑器 -->
      <div class="editor-container">
        <QuillEditor
          ref="quillEditorRef"
          v-model:content="currentContent"
          content-type="html"
          theme="snow"
          class="custom-quill-editor"
          :toolbar="toolbarOptions"
          placeholder="开始编辑电子书内容..."
          @ready="handleEditorReady"
        />
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { ref, watch, onMounted, computed, defineProps, defineEmits } from 'vue'

// ==================== 【书的基础信息】 ====================
const props = defineProps({
  bookId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['save'])

const bookInfo = ref({
  id: props.bookId,
  title: 'Uni-app 实战教程',
  cover: '',
  description: '',
  try_content: '',
  price: 0.00,
  original_price: 0.00,
  sub_count: 0,
  status: '0',
  del_flag: '0',
  create_by: 'admin',
  create_time: '',
  update_time: ''
})

// ==================== 【章节数据】 ====================
const chapters = ref([
  {
    id: null,
    book_id: props.bookId,
    title: '第一章：uni-app 简介',
    content: `<h2>什么是uni-app</h2><p>uni-app 是一个使用 Vue.js 开发所有前端应用的框架。</p>`,
    orderby: 0,
    isfree: 1,
    del_flag: 0,
    create_by: 'admin',
    create_time: '',
    update_time: ''
  },
  {
    id: null,
    book_id: props.bookId,
    title: '第二章：环境搭建',
    content: `<h2>第二章：环境搭建</h2><p>安装 HBuilderX...</p>`,
    orderby: 1,
    isfree: 1,
    del_flag: 0,
    create_by: 'admin',
    create_time: '',
    update_time: ''
  }
])

// 当前章节索引
const currentChapterIndex = ref(0)

// 编辑器内容（正确双向绑定）
const currentContent = computed({
  get() {
    return chapters.value[currentChapterIndex.value]?.content || ''
  },
  set(val) {
    if (chapters.value[currentChapterIndex.value]) {
      chapters.value[currentChapterIndex.value].content = val
      syncChapterTitle()
    }
  }
})

// ==================== 【增强：跨平台快捷键支持（兼容Mac/Windows/Linux）】 ====================
// 新增编辑器就绪处理函数（兼容Mac的Cmd键和Windows的Ctrl键）
const handleEditorReady = (editor) => {
  // 检测当前系统是否为Mac
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
  
  // 定义通用的标题层级格式化函数
  const formatHeader = (level) => {
    editor.format('header', level)
  }

  // 绑定标题层级快捷键：Mac(Cmd+1/2/3/0) + Windows/Linux(Ctrl+1/2/3/0)
  editor.keyboard.addBinding({
    key: '1',
    ctrlKey: !isMac, // Windows/Linux用Ctrl
    metaKey: isMac,  // Mac用Cmd（metaKey对应Cmd键）
    handler: () => formatHeader(1)
  })
  editor.keyboard.addBinding({
    key: '2',
    ctrlKey: !isMac,
    metaKey: isMac,
    handler: () => formatHeader(2)
  })
  editor.keyboard.addBinding({
    key: '3',
    ctrlKey: !isMac,
    metaKey: isMac,
    handler: () => formatHeader(3)
  })
  editor.keyboard.addBinding({
    key: '0',
    ctrlKey: !isMac,
    metaKey: isMac,
    handler: () => formatHeader(false)
  })
}

// ==================== 【同步章节标题】 ====================
const syncChapterTitle = () => {
  const html = currentContent.value
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const h1 = doc.querySelector('h1')
  const h2 = doc.querySelector('h2')

  const titleText = h1?.innerText?.trim() || h2?.innerText?.trim() || ''
  if (titleText) {
    chapters.value[currentChapterIndex.value].title = titleText
  }
}

// ==================== 【自动生成目录】 ====================
const tocList = ref([])
const quillEditorRef = ref(null)

const updateToc = () => {
  const html = currentContent.value
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const headings = doc.querySelectorAll('h1, h2, h3')

  const arr = []
  headings.forEach((h) => {
    const text = h.innerText.trim()
    if (text) {
      arr.push({
        text,
        level: h.tagName.charAt(1)
      })
    }
  })
  tocList.value = arr
}

// ==================== 【工具栏】 ====================
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ header: [1, 2, 3, false] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link', 'image'],
  ['clean']
]

// ==================== 【章节操作】 ====================
const handleBookTitleBlur = () => {
  if (!bookInfo.value.title.trim()) {
    bookInfo.value.title = '未命名电子书'
  }
}

let autoId = 100
const addChapter = () => {
  const num = chapters.value.length + 1
  chapters.value.push({
    id: autoId++,
    book_id: props.bookId,
    title: `第${num}章`,
    content: `<h2>第${num}章</h2>`,
    orderby: num,
    isfree: 1,
    del_flag: 0,
    create_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    update_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
  })
  currentChapterIndex.value = chapters.value.length - 1
}

const switchChapter = (idx) => {
  currentChapterIndex.value = idx
  updateToc()
}

const deleteChapter = (idx) => {
  chapters.value.splice(idx, 1)
  if (currentChapterIndex.value >= chapters.value.length) {
    currentChapterIndex.value = chapters.value.length - 1
  }
}

// ==================== 【保存】 ====================
const saveToDatabase = () => {
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  bookInfo.value.update_time = now
  if (!bookInfo.value.create_time) bookInfo.value.create_time = now

  chapters.value.forEach((ch, i) => {
    ch.orderby = i
    ch.book_id = props.bookId
    ch.update_time = now
    if (!ch.create_time) ch.create_time = now
  })

  const saveData = {
    book: bookInfo.value,
    chapters: chapters.value
  }

  emit('save', saveData)
  console.log('✅ 保存成功', saveData)
}

// ==================== 监听内容变化 ====================
watch(currentContent, () => {
  updateToc()
}, { deep: true })

// 合并重复的onMounted
onMounted(() => {
  updateToc()
})

// 暴露给父组件调用
defineExpose({ saveToDatabase })
</script>

<style scoped>
.editor-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  padding: 20px;
  min-height: 800px;
}

.toc-sidebar {
  width: 280px;
  min-width: 280px;
  background: #f8fafc;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
}

.book-title-wrap {
  margin-bottom: 12px;
}
.book-title-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  outline: none;
  padding: 4px 0;
  border-bottom: 1px solid #e2e8f0;
}
.book-title-input:focus {
  border-bottom-color: #3b82f6;
}

.toc-divider {
  height: 1px;
  background: #e2e8f0;
  margin-bottom: 16px;
}

.chapter-list {
  margin-bottom: 8px;
}
.chapter-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin: 6px 0;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}
.chapter-item.active {
  background: #3b82f6;
  color: #fff;
  border-color: #2563eb;
}
.chapter-num {
  font-size: 12px;
  opacity: 0.8;
  margin-right: 8px;
}
.chapter-title {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.del-btn {
  background: none;
  border: none;
  color: inherit;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.8;
}
.add-chapter-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  margin-top: 8px;
}
.mt-4 {
  margin-top: 16px;
}

.toc-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #0f172a;
}
.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.toc-item {
  padding: 10px 12px;
  margin: 6px 0;
  border-radius: 8px;
  color: #334155;
  font-size: 15px;
}
.toc-level-1 {
  font-size: 16px;
  font-weight: 600;
  padding-left: 8px;
  color: #0f172a;
}
.toc-level-2 {
  padding-left: 28px;
  color: #334155;
}
.toc-level-3 {
  padding-left: 48px;
  color: #64748b;
  font-size: 14px;
}
.toc-empty {
  color: #94a3b8;
  font-size: 15px;
  padding: 10px 12px;
}

.editor-container {
  flex: 1;
  min-width: 0;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
:deep(.ql-toolbar) {
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 12px 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}
:deep(.ql-container) {
  height: 85vh;
  max-height: 1000px;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  padding: 32px 40px;
  overflow-y: auto;
}
:deep(.ql-container)::-webkit-scrollbar {
  width: 7px;
}
:deep(.ql-container)::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 4px;
}
:deep(.ql-container)::-webkit-scrollbar-thumb:hover {
  background-color: #aaa;
}
:deep(.ql-editor h1) {
  font-size: 32px;
  font-weight: 700;
  margin: 24px 0 28px;
  color: #0f172a;
}
:deep(.ql-editor h2) {
  font-size: 26px;
  font-weight: 600;
  margin: 20px 0 24px;
  color: #1e293b;
}
:deep(.ql-editor h3) {
  font-size: 22px;
  font-weight: 600;
  margin: 18px 0 20px;
  color: #334155;
}
:deep(.ql-editor p) {
  margin: 0 0 16px;
}
</style>