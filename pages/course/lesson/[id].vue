<template>
  <div class="watch-page" v-if="lessonData">

    <!-- 顶部栏 -->
    <div class="watch-topbar">
      <div class="topbar-left">
        <n-button text @click="goBack" class="back-btn">
          <template #icon><n-icon size="18"><ArrowBack /></n-icon></template>
        </n-button>
        <div class="topbar-divider"></div>
        <div class="course-title-wrap">
          <span class="course-name">{{ lessonData.course.title }}</span>
          <n-icon size="13" color="#9ca3af" style="flex-shrink:0"><ChevronForward /></n-icon>
          <span class="lesson-name">{{ lessonData.lesson.title }}</span>
        </div>
      </div>
      <div class="topbar-right">
        <n-tag v-if="lessonData.lesson.isFree" type="success" size="small" round>免费试看</n-tag>
        <n-tag v-if="lessonData.lesson.duration" size="small" round>
          <template #icon><n-icon><TimeOutline /></n-icon></template>
          {{ lessonData.lesson.duration }}
        </n-tag>
        <n-button size="small" secondary @click="goEdit">
          <template #icon><n-icon><Create /></n-icon></template>
          编辑内容
        </n-button>
      </div>
    </div>

    <!-- 主体 -->
    <div class="watch-body">

      <!-- 左侧目录 -->
      <aside class="catalog-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <span v-if="!sidebarCollapsed" class="sidebar-title">课程目录</span>
          <n-button text size="small" @click="sidebarCollapsed = !sidebarCollapsed" class="collapse-btn">
            <template #icon>
              <n-icon size="18">
                <MenuOutline v-if="sidebarCollapsed" />
                <CloseOutline v-else />
              </n-icon>
            </template>
          </n-button>
        </div>

        <div class="sidebar-progress" v-if="!sidebarCollapsed">
          <div class="progress-text">
            <span>学习进度</span>
            <span class="progress-num">{{ watchedCount }}/{{ totalLessons }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>

        <div class="chapter-nav" v-if="!sidebarCollapsed">
          <div
            v-for="(chapter, ci) in lessonData.course.chapters"
            :key="chapter.id"
            class="chapter-group"
          >
            <div class="chapter-label">
              <span class="chapter-num">{{ ci + 1 }}</span>
              {{ chapter.title }}
            </div>
            <div
              v-for="(lesson, li) in chapter.lessons"
              :key="lesson.id"
              class="nav-lesson"
              :class="{
                active: lesson.id === currentLessonId,
                watched: watchedIds.has(lesson.id)
              }"
              @click="switchLesson(lesson.id)"
            >
              <div class="nav-lesson-icon">
                <n-icon size="14" v-if="watchedIds.has(lesson.id)" color="#16a34a"><CheckmarkCircle /></n-icon>
                <n-icon size="14" v-else-if="lesson.id === currentLessonId" color="#2563eb"><PlayCircle /></n-icon>
                <n-icon size="14" v-else-if="lesson.videoUrl" color="#9ca3af"><PlayCircleOutline /></n-icon>
                <n-icon size="14" v-else color="#9ca3af"><DocumentTextOutline /></n-icon>
              </div>
              <div class="nav-lesson-info">
                <div class="nav-lesson-title">{{ ci + 1 }}.{{ li + 1 }} {{ lesson.title }}</div>
                <div class="nav-lesson-meta">
                  <span v-if="lesson.duration">{{ lesson.duration }}</span>
                  <n-tag v-if="lesson.isFree" size="tiny" type="success" round style="margin-left:4px">免费</n-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 折叠态只显示图标 -->
        <div class="collapsed-nav" v-else>
          <template v-for="(chapter) in lessonData.course.chapters" :key="chapter.id">
            <div
              v-for="lesson in chapter.lessons"
              :key="lesson.id"
              class="collapsed-item"
              :class="{ active: lesson.id === currentLessonId }"
              :title="lesson.title"
              @click="switchLesson(lesson.id)"
            >
              <n-icon size="16" v-if="watchedIds.has(lesson.id)" color="#16a34a"><CheckmarkCircle /></n-icon>
              <n-icon size="16" v-else-if="lesson.videoUrl" color="#9ca3af"><PlayCircleOutline /></n-icon>
              <n-icon size="16" v-else color="#9ca3af"><DocumentTextOutline /></n-icon>
            </div>
          </template>
        </div>
      </aside>

      <!-- 右侧内容区 -->
      <main class="watch-main">

        <!-- 视频区 -->
        <div class="video-section" v-if="currentLesson.videoUrl">
          <ClientOnly>
            <video
              :key="currentLesson.id"
              :src="currentLesson.videoUrl"
              controls
              class="video-player"
              @ended="onVideoEnded"
              @timeupdate="onTimeUpdate"
              ref="videoRef"
            >
              您的浏览器不支持视频播放
            </video>
          </ClientOnly>
        </div>
        <div class="video-empty" v-else>
          <div class="video-empty-inner">
            <n-icon size="56" color="#d1d5db"><DocumentTextOutline /></n-icon>
            <p>本节为纯文档内容</p>
          </div>
        </div>

        <!-- 小节信息栏 -->
        <div class="lesson-info-bar">
          <div class="lesson-info-left">
            <h1 class="lesson-title">{{ currentLesson.title }}</h1>
            <div class="lesson-meta-row">
              <span class="meta-item">
                <n-icon size="13"><PersonOutline /></n-icon>
                {{ lessonData.course.teacher }}
              </span>
              <span class="meta-item" v-if="currentLesson.duration">
                <n-icon size="13"><TimeOutline /></n-icon>
                {{ currentLesson.duration }}
              </span>
              <span class="meta-item">
                <n-icon size="13"><BookOutline /></n-icon>
                {{ lessonData.chapter.title }}
              </span>
            </div>
          </div>
          <div class="lesson-info-right">
            <n-button
              :type="watchedIds.has(currentLessonId) ? 'success' : 'default'"
              size="small"
              @click="toggleWatched"
            >
              <template #icon>
                <n-icon><CheckmarkCircle v-if="watchedIds.has(currentLessonId)" /><CheckmarkCircleOutline v-else /></n-icon>
              </template>
              {{ watchedIds.has(currentLessonId) ? '已学完' : '标记学完' }}
            </n-button>
            <n-button size="small" :disabled="!prevLesson" @click="switchLesson(prevLesson?.id)">
              <template #icon><n-icon><ChevronBack /></n-icon></template>
              上一节
            </n-button>
            <n-button size="small" type="primary" :disabled="!nextLesson" @click="switchLesson(nextLesson?.id)">
              下一节
              <template #icon><n-icon><ChevronForward /></n-icon></template>
            </n-button>
          </div>
        </div>

        <!-- 文档内容 -->
        <div class="doc-section" v-if="currentLesson.content">
          <div class="doc-header">
            <n-icon size="16"><DocumentText /></n-icon>
            课程文档
          </div>
          <div class="doc-content" v-html="currentLesson.content"></div>
        </div>
        <div class="doc-empty" v-else>
          <n-empty description="暂无文档内容" size="small" />
        </div>

      </main>
    </div>
  </div>

  <!-- 小节不存在 -->
  <div class="not-found" v-else>
    <n-result status="404" title="小节不存在" description="该小节可能已被删除">
      <template #footer>
        <n-button type="primary" @click="navigateTo('/course')">返回课程列表</n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup>
import {
  NButton, NIcon, NTag, NEmpty, NResult, createDiscreteApi
} from 'naive-ui'
import {
  ArrowBack, ChevronForward, ChevronBack, TimeOutline, Create,
  MenuOutline, CloseOutline, CheckmarkCircle, CheckmarkCircleOutline,
  PlayCircle, PlayCircleOutline, DocumentText, DocumentTextOutline,
  PersonOutline, BookOutline
} from '@vicons/ionicons5'

const route = useRoute()
const lessonId = parseInt(route.params.id)

definePageMeta({ layout: 'editor' })

const lessonData = computed(() => useFindLesson(currentLessonId.value))

// 当前小节ID（支持切换）
const currentLessonId = ref(lessonId)

useHead({ title: computed(() => lessonData.value ? lessonData.value.lesson.title + ' - ' + lessonData.value.course.title : '课程学习') })

const currentLesson = computed(() => lessonData.value?.lesson || {})

// 所有小节扁平列表
const allLessons = computed(() => {
  if (!lessonData.value) return []
  return lessonData.value.course.chapters.flatMap(ch => ch.lessons)
})

const totalLessons = computed(() => allLessons.value.length)

const currentIndex = computed(() =>
  allLessons.value.findIndex(l => l.id === currentLessonId.value)
)
const prevLesson = computed(() =>
  currentIndex.value > 0 ? allLessons.value[currentIndex.value - 1] : null
)
const nextLesson = computed(() =>
  currentIndex.value < allLessons.value.length - 1 ? allLessons.value[currentIndex.value + 1] : null
)

// 学习进度（本地记录）
const WATCHED_KEY = computed(() => `watched_course_${lessonData.value?.course?.id}`)
const watchedIds = ref(new Set())

onMounted(() => {
  if (process.client && lessonData.value) {
    try {
      const raw = localStorage.getItem(WATCHED_KEY.value)
      if (raw) watchedIds.value = new Set(JSON.parse(raw))
    } catch {}
  }
})

const watchedCount = computed(() => watchedIds.value.size)
const progressPercent = computed(() =>
  totalLessons.value > 0 ? Math.round((watchedCount.value / totalLessons.value) * 100) : 0
)

function saveWatched() {
  if (process.client) {
    localStorage.setItem(WATCHED_KEY.value, JSON.stringify([...watchedIds.value]))
  }
}

function toggleWatched() {
  const id = currentLessonId.value
  if (watchedIds.value.has(id)) {
    watchedIds.value.delete(id)
  } else {
    watchedIds.value.add(id)
  }
  watchedIds.value = new Set(watchedIds.value)
  saveWatched()
}

// 视频播放完自动标记学完
const videoRef = ref(null)
function onVideoEnded() {
  if (!watchedIds.value.has(currentLessonId.value)) {
    watchedIds.value.add(currentLessonId.value)
    watchedIds.value = new Set(watchedIds.value)
    saveWatched()
    const { message } = createDiscreteApi(['message'])
    message.success('本节已学完，继续加油！')
  }
}

function onTimeUpdate() {
  // 可扩展：记录播放进度
}

// 切换小节
function switchLesson(id) {
  if (!id) return
  currentLessonId.value = id
  // 滚动到顶部
  if (process.client) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 侧边栏折叠
const sidebarCollapsed = ref(false)

function goBack() {
  if (lessonData.value) {
    navigateTo(`/course/${lessonData.value.course.id}`)
  } else {
    navigateTo('/course')
  }
}

function goEdit() {
  navigateTo(`/course/lesson/edit/${currentLessonId.value}`)
}
</script>

<style scoped>
.watch-page {
  min-height: 100vh;
  background: #0f1117;
  display: flex;
  flex-direction: column;
  color: #e5e7eb;
}

/* 顶部栏 */
.watch-topbar {
  height: 52px;
  background: #1a1d27;
  border-bottom: 1px solid #2d3148;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}
.back-btn {
  color: #9ca3af !important;
  flex-shrink: 0;
}
.back-btn:hover { color: #fff !important; }
.topbar-divider {
  width: 1px;
  height: 18px;
  background: #2d3148;
  flex-shrink: 0;
}
.course-title-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  min-width: 0;
  overflow: hidden;
}
.course-name {
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}
.lesson-name {
  color: #e5e7eb;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 主体布局 */
.watch-body {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 左侧目录 */
.catalog-sidebar {
  width: 280px;
  min-width: 280px;
  background: #1a1d27;
  border-right: 1px solid #2d3148;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.25s, min-width 0.25s;
  flex-shrink: 0;
}
.catalog-sidebar.collapsed {
  width: 48px;
  min-width: 48px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 10px;
  border-bottom: 1px solid #2d3148;
  flex-shrink: 0;
}
.sidebar-title {
  font-size: 13px;
  font-weight: 600;
  color: #e5e7eb;
  white-space: nowrap;
}
.collapse-btn {
  color: #6b7280 !important;
  flex-shrink: 0;
}
.collapse-btn:hover { color: #e5e7eb !important; }

/* 进度条 */
.sidebar-progress {
  padding: 10px 14px;
  border-bottom: 1px solid #2d3148;
  flex-shrink: 0;
}
.progress-text {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 6px;
}
.progress-num { color: #9ca3af; }
.progress-bar {
  height: 4px;
  background: #2d3148;
  border-radius: 2px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #7c3aed);
  border-radius: 2px;
  transition: width 0.4s;
}

/* 章节导航 */
.chapter-nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.chapter-nav::-webkit-scrollbar { width: 4px; }
.chapter-nav::-webkit-scrollbar-track { background: transparent; }
.chapter-nav::-webkit-scrollbar-thumb { background: #2d3148; border-radius: 2px; }

.chapter-group {
  margin-bottom: 4px;
}
.chapter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px 6px;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.chapter-num {
  background: #2d3148;
  color: #9ca3af;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  flex-shrink: 0;
}

.nav-lesson {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 9px 14px;
  cursor: pointer;
  transition: background 0.15s;
  border-left: 3px solid transparent;
}
.nav-lesson:hover { background: #22263a; }
.nav-lesson.active {
  background: #1e2d4a;
  border-left-color: #2563eb;
}
.nav-lesson.watched .nav-lesson-title { color: #6b7280; }

.nav-lesson-icon {
  flex-shrink: 0;
  margin-top: 2px;
}
.nav-lesson-info { flex: 1; min-width: 0; }
.nav-lesson-title {
  font-size: 13px;
  color: #d1d5db;
  line-height: 1.4;
  word-break: break-all;
}
.nav-lesson.active .nav-lesson-title { color: #60a5fa; font-weight: 600; }
.nav-lesson-meta {
  display: flex;
  align-items: center;
  font-size: 11px;
  color: #6b7280;
  margin-top: 3px;
}

/* 折叠态 */
.collapsed-nav {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.collapsed-item {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}
.collapsed-item:hover { background: #22263a; }
.collapsed-item.active { background: #1e2d4a; }

/* 右侧主内容 */
.watch-main {
  flex: 1;
  overflow-y: auto;
  background: #0f1117;
}
.watch-main::-webkit-scrollbar { width: 6px; }
.watch-main::-webkit-scrollbar-track { background: transparent; }
.watch-main::-webkit-scrollbar-thumb { background: #2d3148; border-radius: 3px; }

/* 视频区 */
.video-section {
  background: #000;
  width: 100%;
  position: relative;
}
.video-player {
  width: 100%;
  max-height: 60vh;
  display: block;
  background: #000;
}

.video-empty {
  background: #0a0c14;
  width: 100%;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.video-empty-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #4b5563;
  font-size: 14px;
}

/* 小节信息栏 */
.lesson-info-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 28px 16px;
  border-bottom: 1px solid #1e2130;
  gap: 16px;
  flex-wrap: wrap;
}
.lesson-info-left { flex: 1; min-width: 0; }
.lesson-title {
  font-size: 20px;
  font-weight: 700;
  color: #f3f4f6;
  margin: 0 0 8px;
  line-height: 1.4;
}
.lesson-meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #6b7280;
}
.lesson-info-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 文档区 */
.doc-section {
  margin: 20px 28px 40px;
  background: #1a1d27;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #2d3148;
}
.doc-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #9ca3af;
  border-bottom: 1px solid #2d3148;
  background: #22263a;
}
.doc-content {
  padding: 24px 28px;
  font-size: 15px;
  line-height: 1.9;
  color: #d1d5db;
}

/* 文档内容样式 */
.doc-content :deep(h1) { font-size: 22px; font-weight: 700; margin: 20px 0 10px; color: #f3f4f6; }
.doc-content :deep(h2) { font-size: 18px; font-weight: 700; margin: 18px 0 8px; color: #f3f4f6; border-bottom: 1px solid #2d3148; padding-bottom: 6px; }
.doc-content :deep(h3) { font-size: 15px; font-weight: 600; margin: 14px 0 6px; color: #e5e7eb; }
.doc-content :deep(p) { margin: 8px 0; }
.doc-content :deep(ul), .doc-content :deep(ol) { padding-left: 22px; margin: 8px 0; }
.doc-content :deep(li) { margin: 4px 0; }
.doc-content :deep(pre) {
  background: #0f1117;
  border: 1px solid #2d3148;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}
.doc-content :deep(code) { font-family: 'Fira Code', monospace; font-size: 13px; color: #a5f3fc; }
.doc-content :deep(a) { color: #60a5fa; text-decoration: underline; }
.doc-content :deep(a:hover) { color: #93c5fd; }
.doc-content :deep(img) { max-width: 100%; border-radius: 8px; margin: 8px 0; }
.doc-content :deep(strong) { font-weight: 700; color: #f3f4f6; }
.doc-content :deep(em) { font-style: italic; color: #c4b5fd; }
.doc-content :deep(blockquote) {
  border-left: 3px solid #2563eb;
  padding: 8px 16px;
  margin: 12px 0;
  background: #1e2d4a;
  border-radius: 0 6px 6px 0;
  color: #9ca3af;
}

.doc-empty {
  margin: 24px 28px;
  padding: 40px;
  background: #1a1d27;
  border-radius: 12px;
  border: 1px dashed #2d3148;
  display: flex;
  justify-content: center;
}

.not-found {
  padding: 80px 0;
  display: flex;
  justify-content: center;
}
</style>
