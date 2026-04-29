<template>
  <div class="course-manage">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">课程管理</h1>
        <p class="page-subtitle">管理所有课程内容，支持增删改查</p>
      </div>
      <n-button type="primary" size="large" @click="openAdd" class="add-btn">
        <template #icon><n-icon><Add /></n-icon></template>
        新增课程
      </n-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-row">
      <div class="stat-card">
        <div class="stat-icon total-icon"><n-icon size="24"><BookOutline /></n-icon></div>
        <div class="stat-body">
          <div class="stat-num">{{ courses.length }}</div>
          <div class="stat-label">全部课程</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pub-icon"><n-icon size="24"><CheckmarkCircle /></n-icon></div>
        <div class="stat-body">
          <div class="stat-num">{{ publishedCount }}</div>
          <div class="stat-label">已发布</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon draft-icon"><n-icon size="24"><TimeOutline /></n-icon></div>
        <div class="stat-body">
          <div class="stat-num">{{ draftCount }}</div>
          <div class="stat-label">草稿</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon student-icon"><n-icon size="24"><PeopleOutline /></n-icon></div>
        <div class="stat-body">
          <div class="stat-num">{{ totalStudents }}</div>
          <div class="stat-label">总学员</div>
        </div>
      </div>
    </div>

    <!-- 搜索过滤栏 -->
    <div class="filter-bar">
      <n-input
        v-model:value="searchText"
        placeholder="搜索课程名称、讲师..."
        clearable
        style="width:260px"
      >
        <template #prefix><n-icon><Search /></n-icon></template>
      </n-input>
      <n-select
        v-model:value="filterCategory"
        :options="categoryOptions"
        placeholder="全部分类"
        clearable
        style="width:140px"
      />
      <n-select
        v-model:value="filterStatus"
        :options="statusOptions"
        placeholder="全部状态"
        clearable
        style="width:120px"
      />
      <n-select
        v-model:value="filterLevel"
        :options="levelOptions"
        placeholder="全部难度"
        clearable
        style="width:120px"
      />
      <span class="filter-count">共 {{ filteredCourses.length }} 门课程</span>
    </div>

    <!-- 课程卡片网格 -->
    <div class="course-grid" v-if="filteredCourses.length > 0">
      <div
        v-for="course in filteredCourses"
        :key="course.id"
        class="course-card"
      >
        <!-- 封面 -->
        <div class="card-cover-wrap">
          <img :src="course.cover || 'https://picsum.photos/seed/default/400/225'" :alt="course.title" class="card-cover" />
          <div class="card-status-badge" :class="course.status">
            {{ course.status === 'published' ? '已发布' : '草稿' }}
          </div>
          <div class="card-level-badge">{{ course.level }}</div>
        </div>

        <!-- 内容 -->
        <div class="card-body">
          <div class="card-title">{{ course.title }}</div>
          <div class="card-desc">{{ course.description }}</div>

          <div class="card-meta">
            <span class="meta-tag category">{{ course.category }}</span>
            <span class="meta-tag teacher">
              <n-icon size="12"><PersonOutline /></n-icon>
              {{ course.teacher }}
            </span>
          </div>

          <div class="card-stats">
            <span class="card-stat">
              <n-icon size="13"><TimeOutline /></n-icon>
              {{ course.duration }}
            </span>
            <span class="card-stat">
              <n-icon size="13"><PeopleOutline /></n-icon>
              {{ course.studentCount }} 人学习
            </span>
            <span class="card-stat price" :class="{ free: course.price === 0 }">
              {{ course.price === 0 ? '免费' : '¥' + course.price }}
            </span>
          </div>

          <div class="card-chapter-info">
            <n-icon size="13"><ListOutline /></n-icon>
            {{ totalLessons(course) }} 节课 · {{ course.chapters.length }} 章
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="card-actions">
          <n-button size="small" type="primary" @click="goDetail(course.id)">
            <template #icon><n-icon><Eye /></n-icon></template>
            查看目录
          </n-button>
          <n-button size="small" @click="openEdit(course)">
            <template #icon><n-icon><Create /></n-icon></template>
            编辑
          </n-button>
          <n-button size="small" type="error" @click="confirmDelete(course)">
            <template #icon><n-icon><Trash /></n-icon></template>
            删除
          </n-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-wrap" v-else>
      <n-empty description="暂无课程，点击右上角新增">
        <template #extra>
          <n-button type="primary" @click="openAdd">立即新增</n-button>
        </template>
      </n-empty>
    </div>

    <!-- 新增/编辑弹窗 -->
    <n-modal
      v-model:show="showModal"
      :title="editingId ? '编辑课程' : '新增课程'"
      preset="card"
      style="width:600px"
      :mask-closable="false"
    >
      <n-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-placement="left"
        label-width="80"
      >
        <n-form-item label="课程名称" path="title">
          <n-input v-model:value="form.title" placeholder="请输入课程名称" />
        </n-form-item>
        <n-form-item label="封面图" path="cover">
          <n-input v-model:value="form.cover" placeholder="请输入封面图片URL" />
        </n-form-item>
        <n-grid :cols="2" :x-gap="12">
          <n-gi>
            <n-form-item label="分类" path="category">
              <n-select
                v-model:value="form.category"
                :options="categorySelectOptions"
                placeholder="选择分类"
                tag filterable
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="难度" path="level">
              <n-select v-model:value="form.level" :options="levelSelectOptions" placeholder="选择难度" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="讲师" path="teacher">
              <n-input v-model:value="form.teacher" placeholder="讲师姓名" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="总时长" path="duration">
              <n-input v-model:value="form.duration" placeholder="如：32小时" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="价格(元)" path="price">
              <n-input-number v-model:value="form.price" :min="0" placeholder="0为免费" style="width:100%" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="状态" path="status">
              <n-select v-model:value="form.status" :options="statusSelectOptions" placeholder="选择状态" />
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-form-item label="课程简介" path="description">
          <n-input
            v-model:value="form.description"
            type="textarea"
            placeholder="请输入课程简介"
            :rows="4"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ editingId ? '保存修改' : '立即创建' }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import {
  NButton, NIcon, NInput, NSelect, NModal, NForm, NFormItem,
  NGrid, NGi, NInputNumber, NEmpty, createDiscreteApi
} from 'naive-ui'
import {
  Add, BookOutline, CheckmarkCircle, TimeOutline, PeopleOutline,
  Search, PersonOutline, ListOutline, Eye, Create, Trash
} from '@vicons/ionicons5'

useHead({ title: '课程管理' })

const courses = useCourseManage()

// 统计
const publishedCount = computed(() => courses.value.filter(c => c.status === 'published').length)
const draftCount = computed(() => courses.value.filter(c => c.status === 'draft').length)
const totalStudents = computed(() => courses.value.reduce((sum, c) => sum + (c.studentCount || 0), 0))

const totalLessons = (course) => course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)

// 过滤
const searchText = ref('')
const filterCategory = ref(null)
const filterStatus = ref(null)
const filterLevel = ref(null)

const filteredCourses = computed(() => {
  return courses.value.filter(c => {
    const matchSearch = !searchText.value ||
      c.title.includes(searchText.value) ||
      c.teacher?.includes(searchText.value)
    const matchCat = !filterCategory.value || c.category === filterCategory.value
    const matchStatus = !filterStatus.value || c.status === filterStatus.value
    const matchLevel = !filterLevel.value || c.level === filterLevel.value
    return matchSearch && matchCat && matchStatus && matchLevel
  })
})

const categoryOptions = computed(() => {
  const cats = [...new Set(courses.value.map(c => c.category).filter(Boolean))]
  return cats.map(c => ({ label: c, value: c }))
})

const statusOptions = [
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' },
]

const levelOptions = [
  { label: '初级', value: '初级' },
  { label: '中级', value: '中级' },
  { label: '高级', value: '高级' },
]

const categorySelectOptions = [
  { label: '前端开发', value: '前端开发' },
  { label: '后端开发', value: '后端开发' },
  { label: '移动开发', value: '移动开发' },
  { label: '人工智能', value: '人工智能' },
  { label: '数据库', value: '数据库' },
  { label: '运维部署', value: '运维部署' },
  { label: '产品设计', value: '产品设计' },
  { label: '其他', value: '其他' },
]

const levelSelectOptions = [
  { label: '初级', value: '初级' },
  { label: '中级', value: '中级' },
  { label: '高级', value: '高级' },
]

const statusSelectOptions = [
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' },
]

// 表单
const showModal = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  title: '',
  cover: '',
  category: null,
  level: null,
  teacher: '',
  duration: '',
  price: 0,
  status: 'draft',
  description: '',
})

const rules = {
  title: [{ required: true, message: '请输入课程名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  level: [{ required: true, message: '请选择难度', trigger: 'change' }],
  teacher: [{ required: true, message: '请输入讲师姓名', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

function resetForm() {
  form.title = ''
  form.cover = ''
  form.category = null
  form.level = null
  form.teacher = ''
  form.duration = ''
  form.price = 0
  form.status = 'draft'
  form.description = ''
}

function openAdd() {
  editingId.value = null
  resetForm()
  showModal.value = true
}

function openEdit(course) {
  editingId.value = course.id
  form.title = course.title
  form.cover = course.cover || ''
  form.category = course.category
  form.level = course.level
  form.teacher = course.teacher
  form.duration = course.duration || ''
  form.price = course.price
  form.status = course.status
  form.description = course.description || ''
  showModal.value = true
}

function handleSubmit() {
  formRef.value?.validate(async (errors) => {
    if (errors) return
    submitting.value = true
    await new Promise(r => setTimeout(r, 200))
    if (editingId.value) {
      useUpdateCourse(editingId.value, { ...form })
    } else {
      useAddCourse({ ...form })
    }
    submitting.value = false
    showModal.value = false
    const { message } = createDiscreteApi(['message'])
    message.success(editingId.value ? '修改成功' : '课程创建成功')
  })
}

function confirmDelete(course) {
  const { dialog } = createDiscreteApi(['dialog'])
  dialog.warning({
    title: '确认删除',
    content: `确定要删除课程「${course.title}」吗？删除后无法恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      useDeleteCourse(course.id)
      const { message } = createDiscreteApi(['message'])
      message.success('删除成功')
    },
  })
}

function goDetail(id) {
  navigateTo(`/course/${id}`)
}
</script>

<style scoped>
.course-manage {
  min-height: 80vh;
}

/* 页面标题 */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px;
}
.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}
.add-btn {
  flex-shrink: 0;
}

/* 统计卡片 */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: box-shadow 0.2s;
}
.stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.stat-icon {
  width: 52px; height: 52px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.total-icon { background: #eff6ff; color: #2563eb; }
.pub-icon { background: #f0fdf4; color: #16a34a; }
.draft-icon { background: #fefce8; color: #ca8a04; }
.student-icon { background: #fdf4ff; color: #9333ea; }
.stat-num { font-size: 28px; font-weight: 700; color: #1f2937; line-height: 1.2; }
.stat-label { font-size: 13px; color: #6b7280; margin-top: 2px; }

/* 过滤栏 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.filter-count {
  margin-left: auto;
  font-size: 13px;
  color: #9ca3af;
}

/* 课程网格 */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.course-card {
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  transition: box-shadow 0.25s, transform 0.25s;
  display: flex;
  flex-direction: column;
}
.course-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transform: translateY(-2px);
}

/* 封面 */
.card-cover-wrap {
  position: relative;
  overflow: hidden;
}
.card-cover {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.course-card:hover .card-cover { transform: scale(1.04); }

.card-status-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.card-status-badge.published {
  background: rgba(22, 163, 74, 0.9);
  color: #fff;
}
.card-status-badge.draft {
  background: rgba(107, 114, 128, 0.85);
  color: #fff;
}
.card-level-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
}

/* 卡片内容 */
.card-body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.meta-tag.category { background: #eff6ff; color: #2563eb; }
.meta-tag.teacher { background: #f5f3ff; color: #7c3aed; }

.card-stats {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.card-stat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
}
.card-stat.price {
  font-size: 15px;
  font-weight: 700;
  color: #ef4444;
  margin-left: auto;
}
.card-stat.price.free { color: #16a34a; }

.card-chapter-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
  margin-top: auto;
}

/* 操作按钮 */
.card-actions {
  padding: 12px 16px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  gap: 8px;
}

/* 空状态 */
.empty-wrap {
  padding: 80px 0;
  display: flex;
  justify-content: center;
}
</style>
