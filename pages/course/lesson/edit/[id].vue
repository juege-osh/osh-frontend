<template>
  <div class="lesson-editor" v-if="lessonData">
    <!-- 顶部导航栏 -->
    <div class="editor-topbar">
      <div class="topbar-left">
        <n-button text @click="goBack" class="back-btn">
          <template #icon><n-icon><ArrowBack /></n-icon></template>
          返回目录
        </n-button>
        <div class="topbar-divider"></div>
        <div class="topbar-breadcrumb">
          <span class="bc-course">{{ lessonData.course.title }}</span>
          <n-icon size="14" color="#9ca3af"><ChevronForward /></n-icon>
          <span class="bc-chapter">{{ lessonData.chapter.title }}</span>
          <n-icon size="14" color="#9ca3af"><ChevronForward /></n-icon>
          <span class="bc-lesson">{{ lessonData.lesson.title }}</span>
        </div>
      </div>
      <div class="topbar-right">
        <n-tag v-if="lessonData.lesson.isFree" type="success" size="small" round>免费试看</n-tag>
        <n-tag v-if="lessonData.lesson.duration" type="default" size="small" round>
          <template #icon><n-icon><TimeOutline /></n-icon></template>
          {{ lessonData.lesson.duration }}
        </n-tag>
        <n-button secondary size="small" @click="goWatch">
          <template #icon><n-icon><Eye /></n-icon></template>
          预览效果
        </n-button>
        <n-button type="primary" @click="saveAll" :loading="saving">
          <template #icon><n-icon><Save /></n-icon></template>
          保存
        </n-button>
      </div>
    </div>

    <!-- 主体布局 -->
    <div class="editor-layout">
      <!-- 左侧：小节信息 + 视频 -->
      <div class="editor-left">
        <!-- 基本信息卡片 -->
        <div class="editor-card">
          <div class="card-header">
            <n-icon size="16"><InformationCircle /></n-icon>
            基本信息
          </div>
          <div class="card-body">
            <n-form :model="form" label-placement="left" label-width="70">
              <n-form-item label="小节标题">
                <n-input v-model:value="form.title" placeholder="请输入小节标题" />
              </n-form-item>
              <n-form-item label="时长">
                <n-input v-model:value="form.duration" placeholder="如：25:30" style="width:140px" />
              </n-form-item>
              <n-form-item label="免费试看">
                <n-switch v-model:value="form.isFree">
                  <template #checked>是</template>
                  <template #unchecked>否</template>
                </n-switch>
              </n-form-item>
            </n-form>
          </div>
        </div>

        <!-- 视频卡片 -->
        <div class="editor-card video-card">
          <div class="card-header">
            <n-icon size="16"><PlayCircle /></n-icon>
            课程视频
            <n-tag size="tiny" type="info" round style="margin-left:auto">顶部展示</n-tag>
          </div>
          <div class="card-body">
            <div class="video-preview" v-if="previewVideoUrl">
              <video :src="previewVideoUrl" controls class="video-player" :key="previewVideoUrl">
                您的浏览器不支持视频播放
              </video>
            </div>
            <div class="video-placeholder" v-else>
              <n-icon size="48" color="#d1d5db"><PlayCircle /></n-icon>
              <p>暂未上传视频</p>
            </div>

            <div class="video-input-wrap">
              <n-input-group>
                <n-input v-model:value="form.videoUrl" placeholder="输入视频URL（mp4、m3u8 等）" clearable />
                <n-button type="primary" @click="applyVideoUrl" :disabled="!form.videoUrl">预览</n-button>
              </n-input-group>
              <div class="video-tips">
                <n-icon size="13" color="#9ca3af"><InformationCircle /></n-icon>
                <span>支持 MP4、WebM、M3U8 格式，建议使用 CDN 地址</span>
              </div>
            </div>

            <n-form-item label="视频类型" label-placement="left" label-width="70" style="margin-top:12px">
              <n-radio-group v-model:value="form.videoType">
                <n-space>
                  <n-radio value="mp4">MP4</n-radio>
                  <n-radio value="m3u8">M3U8 (HLS)</n-radio>
                  <n-radio value="webm">WebM</n-radio>
                </n-space>
              </n-radio-group>
            </n-form-item>
          </div>
        </div>
      </div>

      <!-- 右侧：文档编辑器 -->
      <div class="editor-right">
        <div class="editor-card doc-card">
          <div class="card-header">
            <n-icon size="16"><DocumentText /></n-icon>
            课程文档
            <n-tag size="tiny" type="warning" round style="margin-left:auto">视频下方展示</n-tag>
          </div>
          <div class="card-body doc-body">
            <!-- 工具栏 -->
            <div class="doc-toolbar">
              <div class="toolbar-group">
                <n-button-group size="small">
                  <n-button @click="execCmd('bold')" title="加粗"><template #icon><n-icon><TextB /></n-icon></template></n-button>
                  <n-button @click="execCmd('italic')" title="斜体"><template #icon><n-icon><TextItalic /></n-icon></template></n-button>
                  <n-button @click="execCmd('underline')" title="下划线"><template #icon><n-icon><TextUnderline /></n-icon></template></n-button>
                </n-button-group>
              </div>
              <div class="toolbar-group">
                <n-select v-model:value="headingLevel" :options="headingOptions" size="small" style="width:100px" @update:value="insertHeading" />
              </div>
              <div class="toolbar-group">
                <n-button-group size="small">
                  <n-button @click="execCmd('insertUnorderedList')" title="无序列表"><template #icon><n-icon><List /></n-icon></template></n-button>
                  <n-button @click="execCmd('insertOrderedList')" title="有序列表"><template #icon><n-icon><ListNumbered /></n-icon></template></n-button>
                </n-button-group>
              </div>
              <div class="toolbar-group">
                <n-button size="small" @click="insertCode" title="代码块"><template #icon><n-icon><Code /></n-icon></template></n-button>
                <n-button size="small" @click="insertLink" title="插入链接"><template #icon><n-icon><Link /></n-icon></template></n-button>
                <n-button size="small" @click="insertImage" title="插入图片"><template #icon><n-icon><Image /></n-icon></template></n-button>
              </div>
              <div class="toolbar-group" style="margin-left:auto">
                <n-button-group size="small">
                  <n-button :type="editorMode === 'edit' ? 'primary' : 'default'" @click="editorMode = 'edit'">编辑</n-button>
                  <n-button :type="editorMode === 'preview' ? 'primary' : 'default'" @click="editorMode = 'preview'">预览</n-button>
                  <n-button :type="editorMode === 'split' ? 'primary' : 'default'" @click="editorMode = 'split'">分屏</n-button>
                </n-button-group>
              </div>
            </div>

            <!-- 编辑区域 -->
            <div class="doc-editor-wrap" :class="editorMode">
              <div
                v-show="editorMode !== 'preview'"
                ref="editorRef"
                class="doc-editor"
                contenteditable="true"
                @input="onEditorInput"
                @keydown="onEditorKeydown"
                spellcheck="false"
              ></div>
              <div
                v-show="editorMode !== 'edit'"
                class="doc-preview"
                v-html="form.content || '<p style=\'color:#9ca3af\'>暂无内容</p>'"
              ></div>
            </div>

            <div class="doc-footer">
              <span class="word-count">字符数：{{ contentLength }}</span>
              <span class="save-hint">Ctrl+S 快速保存</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="editor-bottom-bar">
      <n-button @click="goBack">取消</n-button>
      <n-button type="primary" @click="saveAll" :loading="saving" size="large">
        <template #icon><n-icon><Save /></n-icon></template>
        保存课程内容
      </n-button>
    </div>
  </div>

  <div class="not-found" v-else>
    <n-result status="404" title="小节不存在" description="该小节可能已被删除">
      <template #footer>
        <n-button type="primary" @click="navigateTo('/course')">返回课程列表</n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup>
import { h } from 'vue'
import {
  NButton, NButtonGroup, NIcon, NTag, NForm, NFormItem, NInput,
  NInputGroup, NSwitch, NSelect, NRadioGroup, NRadio, NSpace,
  NResult, createDiscreteApi
} from 'naive-ui'
import {
  ArrowBack, ChevronForward, TimeOutline, Save, InformationCircle,
  PlayCircle, DocumentText, List, Code, Link, Image, Eye
} from '@vicons/ionicons5'

const TextB = { render: () => h('span', { style: 'font-weight:700;font-size:14px;line-height:1' }, 'B') }
const TextItalic = { render: () => h('em', { style: 'font-size:14px;line-height:1' }, 'I') }
const TextUnderline = { render: () => h('u', { style: 'font-size:14px;line-height:1' }, 'U') }
const ListNumbered = { render: () => h('span', { style: 'font-size:12px;line-height:1' }, '1.') }

const route = useRoute()
const lessonId = parseInt(route.params.id)

definePageMeta({ layout: 'editor' })

const lessonData = computed(() => useFindLesson(lessonId))

useHead({ title: computed(() => lessonData.value ? lessonData.value.lesson.title + ' - 编辑' : '编辑小节') })

const form = reactive({
  title: '', duration: '', isFree: false,
  videoUrl: '', videoType: 'mp4', content: '',
})

const previewVideoUrl = ref('')

watch(lessonData, (val) => {
  if (val) {
    form.title = val.lesson.title
    form.duration = val.lesson.duration || ''
    form.isFree = val.lesson.isFree || false
    form.videoUrl = val.lesson.videoUrl || ''
    form.videoType = val.lesson.videoType || 'mp4'
    form.content = val.lesson.content || ''
    previewVideoUrl.value = form.videoUrl
    nextTick(() => {
      if (editorRef.value) editorRef.value.innerHTML = form.content
    })
  }
}, { immediate: true })

function applyVideoUrl() {
  previewVideoUrl.value = form.videoUrl
}

const editorRef = ref(null)
const editorMode = ref('split')
const headingLevel = ref(null)

const headingOptions = [
  { label: '正文', value: 'p' },
  { label: '标题 1', value: 'h1' },
  { label: '标题 2', value: 'h2' },
  { label: '标题 3', value: 'h3' },
]

const contentLength = computed(() => {
  if (process.server) return 0
  const div = document.createElement('div')
  div.innerHTML = form.content
  return div.textContent?.length || 0
})

function onEditorInput() {
  if (editorRef.value) form.content = editorRef.value.innerHTML
}

function onEditorKeydown(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    saveAll()
  }
}

function execCmd(cmd, value = null) {
  editorRef.value?.focus()
  document.execCommand(cmd, false, value)
  onEditorInput()
}

function insertHeading(val) {
  execCmd('formatBlock', (!val || val === 'p') ? 'p' : val)
  headingLevel.value = null
}

function insertCode() {
  const text = window.getSelection()?.toString() || 'code here'
  execCmd('insertHTML', `<pre style="background:#f3f4f6;padding:12px;border-radius:6px;font-family:monospace;overflow-x:auto"><code>${text}</code></pre>`)
}

function insertLink() {
  if (process.server) return
  const url = prompt('请输入链接地址：', 'https://')
  if (url) execCmd('createLink', url)
}

function insertImage() {
  if (process.server) return
  const url = prompt('请输入图片地址：', 'https://')
  if (url) execCmd('insertHTML', `<img src="${url}" style="max-width:100%;border-radius:6px;margin:8px 0" alt="图片" />`)
}

const saving = ref(false)
async function saveAll() {
  if (!lessonData.value) return
  saving.value = true
  await new Promise(r => setTimeout(r, 200))
  useUpdateLesson(
    lessonData.value.course.id,
    lessonData.value.chapter.id,
    lessonId,
    { title: form.title, duration: form.duration, isFree: form.isFree, videoUrl: form.videoUrl, videoType: form.videoType, content: form.content }
  )
  saving.value = false
  const { message } = createDiscreteApi(['message'])
  message.success('保存成功')
}

function goBack() {
  navigateTo(lessonData.value ? `/course/${lessonData.value.course.id}` : '/course')
}

function goWatch() {
  navigateTo(`/course/lesson/${lessonId}`)
}
</script>

<style scoped>
.lesson-editor {
  min-height: 100vh;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
}
.editor-topbar {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.topbar-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.back-btn { flex-shrink: 0; }
.topbar-divider { width: 1px; height: 20px; background: #e5e7eb; flex-shrink: 0; }
.topbar-breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; min-width: 0; overflow: hidden; }
.bc-course, .bc-chapter { color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
.bc-lesson { color: #1f2937; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.editor-layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 20px;
  padding: 20px 24px;
  flex: 1;
}

.editor-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  overflow: hidden;
  margin-bottom: 16px;
}
.editor-card:last-child { margin-bottom: 0; }
.card-header {
  display: flex; align-items: center; gap: 8px;
  padding: 14px 18px; font-size: 14px; font-weight: 600; color: #374151;
  border-bottom: 1px solid #f3f4f6; background: #fafafa;
}
.card-body { padding: 18px; }
.video-card .card-body { padding: 16px; }

.video-preview { margin-bottom: 14px; border-radius: 8px; overflow: hidden; background: #000; }
.video-player { width: 100%; max-height: 220px; display: block; }
.video-placeholder {
  height: 160px; background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; margin-bottom: 14px; color: #9ca3af; font-size: 13px;
}
.video-input-wrap { display: flex; flex-direction: column; gap: 6px; }
.video-tips { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #9ca3af; }

.doc-card {
  height: calc(100vh - 56px - 40px - 72px);
  display: flex; flex-direction: column; margin-bottom: 0;
}
.doc-body { flex: 1; display: flex; flex-direction: column; padding: 0; min-height: 0; }
.doc-toolbar {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  border-bottom: 1px solid #f3f4f6; flex-wrap: wrap; background: #fafafa;
}
.toolbar-group { display: flex; align-items: center; gap: 4px; }

.doc-editor-wrap { flex: 1; display: flex; min-height: 0; overflow: hidden; }
.doc-editor-wrap.edit .doc-editor { flex: 1; }
.doc-editor-wrap.edit .doc-preview { display: none; }
.doc-editor-wrap.preview .doc-editor { display: none; }
.doc-editor-wrap.preview .doc-preview { flex: 1; }
.doc-editor-wrap.split .doc-editor { flex: 1; border-right: 1px solid #e5e7eb; }
.doc-editor-wrap.split .doc-preview { flex: 1; }

.doc-editor {
  padding: 16px 20px; outline: none; overflow-y: auto;
  font-size: 14px; line-height: 1.8; color: #374151; min-height: 200px;
}
.doc-editor:empty::before { content: '在此输入课程文档内容...'; color: #9ca3af; pointer-events: none; }
.doc-preview { padding: 16px 20px; overflow-y: auto; font-size: 14px; line-height: 1.8; color: #374151; }

.doc-preview :deep(h1) { font-size: 22px; font-weight: 700; margin: 16px 0 8px; }
.doc-preview :deep(h2) { font-size: 18px; font-weight: 700; margin: 14px 0 6px; }
.doc-preview :deep(h3) { font-size: 15px; font-weight: 600; margin: 12px 0 4px; }
.doc-preview :deep(p) { margin: 6px 0; }
.doc-preview :deep(ul), .doc-preview :deep(ol) { padding-left: 20px; margin: 6px 0; }
.doc-preview :deep(pre) { background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto; }
.doc-preview :deep(code) { font-family: monospace; font-size: 13px; }
.doc-preview :deep(a) { color: #2563eb; text-decoration: underline; }
.doc-preview :deep(img) { max-width: 100%; border-radius: 6px; }
.doc-preview :deep(strong) { font-weight: 700; }
.doc-preview :deep(em) { font-style: italic; }

.doc-editor :deep(h1) { font-size: 22px; font-weight: 700; margin: 16px 0 8px; }
.doc-editor :deep(h2) { font-size: 18px; font-weight: 700; margin: 14px 0 6px; }
.doc-editor :deep(h3) { font-size: 15px; font-weight: 600; margin: 12px 0 4px; }
.doc-editor :deep(pre) { background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto; }
.doc-editor :deep(img) { max-width: 100%; border-radius: 6px; }

.doc-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px; border-top: 1px solid #f3f4f6; background: #fafafa;
}
.word-count { font-size: 12px; color: #9ca3af; }
.save-hint { font-size: 12px; color: #d1d5db; }

.editor-bottom-bar {
  background: #fff; border-top: 1px solid #e5e7eb;
  padding: 14px 24px; display: flex; align-items: center; justify-content: space-between;
}

.not-found { padding: 80px 0; display: flex; justify-content: center; }
</style>
