<template>
  <div class="course-detail" v-if="course">
    <!-- 面包屑 -->
    <n-breadcrumb class="breadcrumb">
      <n-breadcrumb-item>
        <nuxt-link to="/">首页</nuxt-link>
      </n-breadcrumb-item>
      <n-breadcrumb-item>
        <nuxt-link to="/course">课程管理</nuxt-link>
      </n-breadcrumb-item>
      <n-breadcrumb-item>{{ course.title }}</n-breadcrumb-item>
    </n-breadcrumb>

    <!-- 课程信息头部 -->
    <div class="course-hero">
      <div class="hero-cover-wrap">
        <img
          :src="course.cover || 'https://picsum.photos/seed/default/400/225'"
          :alt="course.title"
          class="hero-cover"
        />
        <div class="hero-status" :class="course.status">
          {{ course.status === 'published' ? '已发布' : '草稿' }}
        </div>
      </div>
      <div class="hero-info">
        <div class="hero-tags">
          <n-tag type="info" size="small" round>{{ course.category }}</n-tag>
          <n-tag type="warning" size="small" round>{{ course.level }}</n-tag>
          <n-tag :type="course.price === 0 ? 'success' : 'error'" size="small" round>
            {{ course.price === 0 ? '免费' : '¥' + course.price }}
          </n-tag>
        </div>
        <h1 class="hero-title">{{ course.title }}</h1>
        <p class="hero-desc">{{ course.description }}</p>
        <div class="hero-meta">
          <div class="hero-meta-item">
            <n-icon size="16"><PersonOutline /></n-icon>
            <span>讲师：{{ course.teacher }}</span>
          </div>
          <div class="hero-meta-item">
            <n-icon size="16"><TimeOutline /></n-icon>
            <span>时长：{{ course.duration }}</span>
          </div>
          <div class="hero-meta-item">
            <n-icon size="16"><PeopleOutline /></n-icon>
            <span>{{ course.studentCount }} 人学习</span>
          </div>
          <div class="hero-meta-item">
            <n-icon size="16"><ListOutline /></n-icon>
            <span>{{ totalLessons }} 节课 · {{ course.chapters.length }} 章</span>
          </div>
        </div>
        <div class="hero-time">
          <span>创建：{{ course.createdAt }}</span>
          <span style="margin-left:16px">更新：{{ course.updatedAt }}</span>
        </div>
        <div class="hero-actions">
          <n-button type="primary" @click="openEditCourse">
            <template #icon><n-icon><Create /></n-icon></template>
            编辑课程信息
          </n-button>
          <n-button @click="navigateTo('/course')">
            <template #icon><n-icon><ArrowBack /></n-icon></template>
            返回列表
          </n-button>
        </div>
      </div>
    </div>

    <!-- 课程目录 -->
    <div class="catalog-section">
      <div class="catalog-header">
        <div class="catalog-title">
          <n-icon size="20"><ListOutline /></n-icon>
          课程目录
        </div>
        <n-button type="primary" @click="openAddChapter">
          <template #icon><n-icon><Add /></n-icon></template>
          新增章节
        </n-button>
      </div>

      <!-- 空状态 -->
      <div class="catalog-empty" v-if="course.chapters.length === 0">
        <n-empty description="暂无章节，点击右上角新增章节">
          <template #extra>
            <n-button type="primary" @click="openAddChapter">新增章节</n-button>
          </template>
        </n-empty>
      </div>

      <!-- 章节列表 -->
      <div class="chapter-list" v-else>
        <div
          v-for="(chapter, ci) in course.chapters"
          :key="chapter.id"
          class="chapter-item"
        >
          <!-- 章节头 -->
          <div class="chapter-header">
            <div class="chapter-left">
              <div class="chapter-index">第 {{ ci + 1 }} 章</div>
              <div class="chapter-title">{{ chapter.title }}</div>
              <n-tag size="small" type="default" round>{{ chapter.lessons.length }} 节</n-tag>
            </div>
            <div class="chapter-actions">
              <n-button text size="small" @click="openAddLesson(chapter)">
                <template #icon><n-icon><Add /></n-icon></template>
                新增小节
              </n-button>
              <n-button text size="small" @click="openEditChapter(chapter)">
                <template #icon><n-icon><Create /></n-icon></template>
                编辑
              </n-button>
              <n-button text size="small" type="error" @click="confirmDeleteChapter(chapter)">
                <template #icon><n-icon><Trash /></n-icon></template>
                删除
              </n-button>
            </div>
          </div>

          <!-- 小节列表 -->
          <div class="lesson-list" v-if="chapter.lessons.length > 0">
            <div
              v-for="(lesson, li) in chapter.lessons"
              :key="lesson.id"
              class="lesson-item"
              @click="goWatch(lesson.id)"
            >
              <div class="lesson-index">{{ ci + 1 }}.{{ li + 1 }}</div>
              <div class="lesson-icon">
                <n-icon size="16" :color="lesson.videoUrl ? '#2563eb' : '#9ca3af'">
                  <PlayCircle v-if="lesson.videoUrl" />
                  <DocumentText v-else />
                </n-icon>
              </div>
              <div class="lesson-info">
                <div class="lesson-title">{{ lesson.title }}</div>
                <div class="lesson-meta">
                  <span v-if="lesson.videoUrl" class="lesson-type video">
                    <n-icon size="11"><PlayCircle /></n-icon> 视频
                  </span>
                  <span v-else class="lesson-type doc">
                    <n-icon size="11"><DocumentText /></n-icon> 文档
                  </span>
                  <span v-if="lesson.duration" class="lesson-duration">{{ lesson.duration }}</span>
                  <n-tag v-if="lesson.isFree" size="tiny" type="success" round>免费试看</n-tag>
                </div>
              </div>
              <div class="lesson-actions" @click.stop>
                <n-button text size="small" type="primary" @click="goWatch(lesson.id)">
                  <template #icon><n-icon><Eye /></n-icon></template>
                  观看
                </n-button>
                <n-button text size="small" @click="goLesson(lesson.id)">
                  <template #icon><n-icon><Create /></n-icon></template>
                  编辑
                </n-button>
                <n-button text size="small" type="error" @click="confirmDeleteLesson(chapter, lesson)">
                  <template #icon><n-icon><Trash /></n-icon></template>
                </n-button>
              </div>
            </div>
          </div>
          <div class="lesson-empty" v-else>
            <span>暂无小节</span>
            <n-button text type="primary" size="small" @click="openAddLesson(chapter)">+ 新增小节</n-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑课程信息弹窗 -->
    <n-modal
      v-model:show="showCourseModal"
      title="编辑课程信息"
      preset="card"
      style="width:600px"
      :mask-closable="false"
    >
      <n-form ref="courseFormRef" :model="courseForm" :rules="courseRules" label-placement="left" label-width="80">
        <n-form-item label="课程名称" path="title">
          <n-input v-model:value="courseForm.title" placeholder="请输入课程名称" />
        </n-form-item>
        <n-form-item label="封面图" path="cover">
          <n-input v-model:value="courseForm.cover" placeholder="请输入封面图片URL" />
        </n-form-item>
        <n-grid :cols="2" :x-gap="12">
          <n-gi>
            <n-form-item label="分类" path="category">
              <n-select v-model:value="courseForm.category" :options="categoryOptions" placeholder="选择分类" tag filterable />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="难度" path="level">
              <n-select v-model:value="courseForm.level" :options="levelOptions" placeholder="选择难度" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="讲师" path="teacher">
              <n-input v-model:value="courseForm.teacher" placeholder="讲师姓名" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="总时长" path="duration">
              <n-input v-model:value="courseForm.duration" placeholder="如：32小时" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="价格(元)" path="price">
              <n-input-number v-model:value="courseForm.price" :min="0" style="width:100%" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="状态" path="status">
              <n-select v-model:value="courseForm.status" :options="statusOptions" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="课程简介" path="description">
          <n-input v-model:value="courseForm.description" type="textarea" :rows="4" placeholder="请输入课程简介" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <n-button @click="showCourseModal = false">取消</n-button>
          <n-button type="primary" @click="saveCourseInfo" :loading="saving">保存修改</n-button>
        </div>
      </template>
    </n-modal>

    <!-- 新增/编辑章节弹窗 -->
    <n-modal
      v-model:show="showChapterModal"
      :title="editingChapterId ? '编辑章节' : '新增章节'"
      preset="card"
      style="width:480px"
      :mask-closable="false"
    >
      <n-form ref="chapterFormRef" :model="chapterForm" :rules="chapterRules" label-placement="left" label-width="80">
        <n-form-item label="章节标题" path="title">
          <n-input v-model:value="chapterForm.title" placeholder="如：第一章：基础入门" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <n-button @click="showChapterModal = false">取消</n-button>
          <n-button type="primary" @click="saveChapter" :loading="saving">
            {{ editingChapterId ? '保存' : '新增' }}
          </n-button>
        </div>
      </template>
    </n-modal>

    <!-- 新增小节弹窗 -->
    <n-modal
      v-model:show="showLessonModal"
      title="新增小节"
      preset="card"
      style="width:480px"
      :mask-closable="false"
    >
      <n-form ref="lessonFormRef" :model="lessonForm" :rules="lessonRules" label-placement="left" label-width="80">
        <n-form-item label="小节标题" path="title">
          <n-input v-model:value="lessonForm.title" placeholder="如：1.1 Vue3 简介" />
        </n-form-item>
        <n-form-item label="时长" path="duration">
          <n-input v-model:value="lessonForm.duration" placeholder="如：25:30" />
        </n-form-item>
        <n-form-item label="免费试看">
          <n-switch v-model:value="lessonForm.isFree" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <n-button @click="showLessonModal = false">取消</n-button>
          <n-button type="primary" @click="saveLesson" :loading="saving">新增小节</n-button>
        </div>
      </template>
    </n-modal>
  </div>

  <!-- 课程不存在 -->
  <div class="not-found" v-else>
    <n-result status="404" title="课程不存在" description="该课程可能已被删除">
      <template #footer>
        <n-button type="primary" @click="navigateTo('/course')">返回课程列表</n-button>
      </template>
    </n-result>
  </div>
</template>

<script setup>
import {
  NBreadcrumb, NBreadcrumbItem, NTag, NIcon, NButton, NEmpty,
  NModal, NForm, NFormItem, NInput, NSelect, NGrid, NGi,
  NInputNumber, NSwitch, NResult, createDiscreteApi
} from 'naive-ui'
import {
  PersonOutline, TimeOutline, PeopleOutline, ListOutline,
  Create, ArrowBack, Add, Trash, PlayCircle, DocumentText, Eye
} from '@vicons/ionicons5'

const route = useRoute()
const courseId = parseInt(route.params.id)

const courses = useCourseManage()
const course = computed(() => courses.value.find(c => c.id === courseId) || null)

useHead({ title: computed(() => course.value ? course.value.title + ' - 课程目录' : '课程详情') })

const totalLessons = computed(() =>
  course.value ? course.value.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0) : 0
)

// 选项
const categoryOptions = [
  { label: '前端开发', value: '前端开发' },
  { label: '后端开发', value: '后端开发' },
  { label: '移动开发', value: '移动开发' },
  { label: '人工智能', value: '人工智能' },
  { label: '数据库', value: '数据库' },
  { label: '运维部署', value: '运维部署' },
  { label: '产品设计', value: '产品设计' },
  { label: '其他', value: '其他' },
]
const levelOptions = [
  { label: '初级', value: '初级' },
  { label: '中级', value: '中级' },
  { label: '高级', value: '高级' },
]
const statusOptions = [
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' },
]

const saving = ref(false)

// ===== 编辑课程信息 =====
const showCourseModal = ref(false)
const courseFormRef = ref(null)
const courseForm = reactive({
  title: '', cover: '', category: null, level: null,
  teacher: '', duration: '', price: 0, status: 'draft', description: '',
})
const courseRules = {
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  level: [{ required: true, message: '请选择难度', trigger: 'change' }],
  teacher: [{ required: true, message: '请输入讲师姓名', trigger: 'blur' }],
}

function openEditCourse() {
  if (!course.value) return
  Object.assign(courseForm, {
    title: course.value.title,
    cover: course.value.cover || '',
    category: course.value.category,
    level: course.value.level,
    teacher: course.value.teacher,
    duration: course.value.duration || '',
    price: course.value.price,
    status: course.value.status,
    description: course.value.description || '',
  })
  showCourseModal.value = true
}

function saveCourseInfo() {
  courseFormRef.value?.validate(async (errors) => {
    if (errors) return
    saving.value = true
    await new Promise(r => setTimeout(r, 200))
    useUpdateCourse(courseId, { ...courseForm })
    saving.value = false
    showCourseModal.value = false
    const { message } = createDiscreteApi(['message'])
    message.success('课程信息已更新')
  })
}

// ===== 章节管理 =====
const showChapterModal = ref(false)
const editingChapterId = ref(null)
const chapterFormRef = ref(null)
const chapterForm = reactive({ title: '' })
const chapterRules = {
  title: [{ required: true, message: '请输入章节标题', trigger: 'blur' }],
}

function openAddChapter() {
  editingChapterId.value = null
  chapterForm.title = ''
  showChapterModal.value = true
}

function openEditChapter(chapter) {
  editingChapterId.value = chapter.id
  chapterForm.title = chapter.title
  showChapterModal.value = true
}

function saveChapter() {
  chapterFormRef.value?.validate(async (errors) => {
    if (errors) return
    saving.value = true
    await new Promise(r => setTimeout(r, 150))
    if (editingChapterId.value) {
      useUpdateChapter(courseId, editingChapterId.value, { title: chapterForm.title })
    } else {
      useAddChapter(courseId, { title: chapterForm.title })
    }
    saving.value = false
    showChapterModal.value = false
    const { message } = createDiscreteApi(['message'])
    message.success(editingChapterId.value ? '章节已更新' : '章节已新增')
  })
}

function confirmDeleteChapter(chapter) {
  const { dialog } = createDiscreteApi(['dialog'])
  dialog.warning({
    title: '确认删除',
    content: `确定要删除章节「${chapter.title}」及其所有小节吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      useDeleteChapter(courseId, chapter.id)
      const { message } = createDiscreteApi(['message'])
      message.success('章节已删除')
    },
  })
}

// ===== 小节管理 =====
const showLessonModal = ref(false)
const currentChapterId = ref(null)
const lessonFormRef = ref(null)
const lessonForm = reactive({ title: '', duration: '', isFree: false })
const lessonRules = {
  title: [{ required: true, message: '请输入小节标题', trigger: 'blur' }],
}

function openAddLesson(chapter) {
  currentChapterId.value = chapter.id
  lessonForm.title = ''
  lessonForm.duration = ''
  lessonForm.isFree = false
  showLessonModal.value = true
}

function saveLesson() {
  lessonFormRef.value?.validate(async (errors) => {
    if (errors) return
    saving.value = true
    await new Promise(r => setTimeout(r, 150))
    useAddLesson(courseId, currentChapterId.value, {
      title: lessonForm.title,
      duration: lessonForm.duration,
      isFree: lessonForm.isFree,
      videoUrl: '',
      videoType: 'mp4',
      content: '',
    })
    saving.value = false
    showLessonModal.value = false
    const { message } = createDiscreteApi(['message'])
    message.success('小节已新增，点击"编辑内容"添加视频和文档')
  })
}

function confirmDeleteLesson(chapter, lesson) {
  const { dialog } = createDiscreteApi(['dialog'])
  dialog.warning({
    title: '确认删除',
    content: `确定要删除小节「${lesson.title}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      useDeleteLesson(courseId, chapter.id, lesson.id)
      const { message } = createDiscreteApi(['message'])
      message.success('小节已删除')
    },
  })
}

function goLesson(lessonId) {
  navigateTo(`/course/lesson/edit/${lessonId}`)
}

function goWatch(lessonId) {
  navigateTo(`/course/lesson/${lessonId}`)
}
</script>

<style scoped>
.course-detail {
  min-height: 80vh;
}

.breadcrumb {
  margin-bottom: 20px;
}

/* 课程头部 */
.course-hero {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  display: flex;
  gap: 28px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.hero-cover-wrap {
  position: relative;
  flex-shrink: 0;
}
.hero-cover {
  width: 320px;
  height: 180px;
  object-fit: cover;
  border-radius: 10px;
  display: block;
}
.hero-status {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.hero-status.published { background: rgba(22,163,74,0.9); color: #fff; }
.hero-status.draft { background: rgba(107,114,128,0.85); color: #fff; }

.hero-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.hero-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.hero-title {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}
.hero-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.hero-meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #6b7280;
}
.hero-time {
  font-size: 12px;
  color: #9ca3af;
}
.hero-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

/* 目录区域 */
.catalog-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.catalog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.catalog-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}
.catalog-empty {
  padding: 60px 0;
  display: flex;
  justify-content: center;
}

/* 章节 */
.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.chapter-item {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}
.chapter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e5e7eb;
}
.chapter-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.chapter-index {
  font-size: 12px;
  color: #9ca3af;
  background: #e5e7eb;
  padding: 2px 8px;
  border-radius: 4px;
}
.chapter-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}
.chapter-actions {
  display: flex;
  gap: 4px;
}

/* 小节 */
.lesson-list {
  display: flex;
  flex-direction: column;
}
.lesson-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background 0.15s;
}
.lesson-item:last-child { border-bottom: none; }
.lesson-item:hover { background: #f8fafc; }

.lesson-index {
  font-size: 12px;
  color: #9ca3af;
  width: 28px;
  flex-shrink: 0;
}
.lesson-icon {
  flex-shrink: 0;
}
.lesson-info {
  flex: 1;
  min-width: 0;
}
.lesson-title {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lesson-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 3px;
}
.lesson-type {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 3px;
}
.lesson-type.video { background: #eff6ff; color: #2563eb; }
.lesson-type.doc { background: #f5f3ff; color: #7c3aed; }
.lesson-duration {
  font-size: 12px;
  color: #9ca3af;
}
.lesson-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.lesson-empty {
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #9ca3af;
}

.not-found {
  padding: 80px 0;
  display: flex;
  justify-content: center;
}
</style>
