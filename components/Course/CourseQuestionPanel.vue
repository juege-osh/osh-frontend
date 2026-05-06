<template>
  <section class="course-qna-panel">
    <div class="panel-head">
      <div class="panel-head-info">
        <p class="eyebrow">COURSE Q&amp;A</p>
        <h3>课程提问区</h3>
        <p class="panel-desc">围绕当前小节集中提问，历史问题可直接下拉查看。</p>
      </div>
      <button class="ask-btn" @click="handleOpenCreate">我要提问</button>
    </div>

    <div class="summary-row">
      <div class="summary-card">
        <span class="summary-label">总问题数</span>
        <strong>{{ total }}</strong>
      </div>
      <div class="summary-card">
        <span class="summary-label">已解决</span>
        <strong>{{ answeredCount }}</strong>
      </div>
      <div class="summary-card">
        <span class="summary-label">待回答</span>
        <strong>{{ pendingCount }}</strong>
      </div>
    </div>

    <div class="dropdown-shell">
      <button class="dropdown-toggle" @click="expanded = !expanded">
        <span>{{ expanded ? '收起问题列表' : '下拉查看全部问题' }}</span>
        <span class="toggle-icon" :class="{ expanded }">⌄</span>
      </button>

      <Transition name="slide-fade">
        <div v-if="expanded" class="dropdown-body">
          <div v-if="loading" class="state-box">问题加载中...</div>
          <div v-else-if="errorText" class="state-box error">{{ errorText }}</div>
          <div v-else-if="questions.length === 0" class="state-box">
            这个小节还没有人提问，快来第一个提问吧 🙋
          </div>
          <div v-else class="question-list">
            <button
              v-for="question in questions"
              :key="question.id"
              class="question-item"
              @click="openQuestion(question.id)"
            >
              <div class="question-main">
                <div class="question-title-row">
                  <span class="status-dot" :class="statusClass(question.status)" />
                  <strong>{{ question.title || question.content }}</strong>
                </div>
                <p>{{ truncate(question.content, 72) }}</p>
              </div>
              <div class="question-meta">
                <span>{{ statusText(question.status) }}</span>
                <span>{{ question.viewCount || 0 }} 浏览</span>
              </div>
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <QuestionAnswerCreateModal
      v-model:show="showCreateModal"
      title="为当前小节提问"
      :preset-resource-type="COURSE_RESOURCE_TYPE"
      :preset-resource-no="sectionId"
      :lock-resource="true"
      @success="loadQuestions"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { createDiscreteApi } from 'naive-ui'
import { useHasAuth } from '~/composables/useAuth'
import { useUser } from '~/composables/useAuth'
import { apiGetQuestionList } from '~/composables/Api/QuestionAnswer/qna'

// 课程资源类型标识，与后端 ResourceTypeEnum.COURSE 的 type code 保持一致
const COURSE_RESOURCE_TYPE = 'course'

const props = defineProps({
  sectionId: {
    type: [Number, String],
    required: true,
  },
  courseId: {
    type: [Number, String],
    default: null,
  },
  accessLevel: {
    type: String,
    default: 'TRIAL', // FULL=已购买或高权限，TRIAL=仅试看
  },
})

const expanded = ref(false)
const loading = ref(false)
const showCreateModal = ref(false)
const errorText = ref('')
const questions = ref([])
const total = ref(0)

const answeredCount = computed(() => questions.value.filter((item) => Number(item.status) === 2).length)
const pendingCount = computed(() => Math.max(total.value - answeredCount.value, 0))

watch(
  () => props.sectionId,
  () => {
    if (props.sectionId) loadQuestions()
  },
  { immediate: true }
)

async function loadQuestions() {
  if (!props.sectionId) return
  loading.value = true
  errorText.value = ''
  try {
    const response = await apiGetQuestionList({
      resourceType: COURSE_RESOURCE_TYPE,
      resourceNo: Number(props.sectionId),
      type: 'all',
      pageNum: 1,
      pageSize: 50,
    })
    const rows = response?.rows || response?.data?.rows || []
    const totalValue = response?.total || response?.data?.total || rows.length
    questions.value = rows
    total.value = totalValue
  } catch (error) {
    console.error('[CourseQnA] load failed', error)
    errorText.value = error?.data?.msg || error?.message || '问题列表加载失败'
  } finally {
    loading.value = false
  }
}

function handleOpenCreate() {
  useHasAuth(() => {
    // 权限判断：level >= 2 或已购买该课程（accessLevel === 'FULL'）
    // role 信息从 localStorage 读取（登录时持久化，不受 getinfo 覆盖影响）
    let userLevel = 0
    if (process.client) {
      try {
        const roleStr = localStorage.getItem('__user_role__')
        const role = roleStr ? JSON.parse(roleStr) : null
        userLevel = Number(role?.level ?? 0)
      } catch {}
    }
    const isPaid = props.accessLevel === 'FULL'
    if (userLevel < 2 && !isPaid) {
      const { message } = createDiscreteApi(['message'])
      message.warning('需要 VIP 及以上等级，或已购买该课程，才能提问')
      return
    }
    showCreateModal.value = true
  })
}

function openQuestion(questionId) {
  navigateTo(`/question_answer/detail/${questionId}`)
}

function statusText(status) {
  const s = Number(status)
  if (s === 2) return '已解决'
  if (s === 1) return '待回答'
  return '草稿'
}

function statusClass(status) {
  const s = Number(status)
  if (s === 2) return 'resolved'
  if (s === 1) return 'pending'
  return 'draft'
}

function truncate(text, length) {
  if (!text) return ''
  return text.length > length ? `${text.slice(0, length)}...` : text
}
</script>

<style scoped>
.course-qna-panel {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  padding: 22px;
  background:
    radial-gradient(circle at top left, rgba(24, 160, 88, 0.28), transparent 40%),
    radial-gradient(circle at bottom right, rgba(32, 128, 240, 0.22), transparent 44%),
    linear-gradient(145deg, #0d1f14 0%, #132b1e 55%, #0a1510 100%);
  color: #f0fdf4;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.3);
  margin-top: 16px;
}

/* 头部 */
.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 10px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(240, 253, 244, 0.55);
}

.panel-head h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #f0fdf4;
}

.panel-desc {
  margin: 8px 0 0;
  font-size: 13px;
  color: rgba(220, 252, 231, 0.75);
  line-height: 1.6;
}

/* 提问按钮 */
.ask-btn {
  flex-shrink: 0;
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: #052e16;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(74, 222, 128, 0.3);
  transition: transform 0.15s, box-shadow 0.15s;
  white-space: nowrap;
}
.ask-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 28px rgba(74, 222, 128, 0.4);
}
.ask-btn:active { transform: translateY(0); }

/* 统计卡片 */
.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 20px;
}

.summary-card {
  border: 1px solid rgba(74, 222, 128, 0.15);
  border-radius: 16px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
}

.summary-label {
  display: block;
  margin-bottom: 6px;
  color: rgba(220, 252, 231, 0.65);
  font-size: 12px;
}

.summary-card strong {
  font-size: 24px;
  font-weight: 700;
  color: #86efac;
}

/* 下拉区 */
.dropdown-shell { margin-top: 16px; }

.dropdown-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 1px solid rgba(74, 222, 128, 0.15);
  border-radius: 14px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(220, 252, 231, 0.85);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.dropdown-toggle:hover {
  background: rgba(74, 222, 128, 0.08);
  border-color: rgba(74, 222, 128, 0.3);
}

.toggle-icon {
  font-size: 20px;
  transition: transform 0.22s ease;
  color: #4ade80;
}
.toggle-icon.expanded { transform: rotate(180deg); }

.dropdown-body {
  margin-top: 10px;
  border-radius: 18px;
  padding: 10px;
  background: rgba(5, 10, 7, 0.4);
  border: 1px solid rgba(74, 222, 128, 0.1);
}

/* 问题列表 */
.question-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(74, 222, 128, 0.2) transparent;
}

.question-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(74, 222, 128, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s, border-color 0.18s, background 0.18s;
}
.question-item:hover {
  transform: translateY(-1px);
  border-color: rgba(74, 222, 128, 0.35);
  background: rgba(74, 222, 128, 0.07);
}

.question-main { flex: 1; min-width: 0; }

.question-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.question-main strong {
  font-size: 14px;
  color: #f0fdf4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-main p {
  margin: 0;
  font-size: 12px;
  color: rgba(220, 252, 231, 0.6);
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.question-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 72px;
  text-align: right;
  font-size: 11px;
  color: rgba(220, 252, 231, 0.55);
  flex-shrink: 0;
}

/* 状态点 */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.status-dot.resolved { background: #4ade80; box-shadow: 0 0 6px rgba(74, 222, 128, 0.6); }
.status-dot.pending  { background: #fbbf24; box-shadow: 0 0 6px rgba(251, 191, 36, 0.5); }
.status-dot.draft    { background: #64748b; }

/* 空/加载状态 */
.state-box {
  padding: 20px;
  text-align: center;
  font-size: 13px;
  color: rgba(220, 252, 231, 0.6);
}
.state-box.error { color: #fca5a5; }

/* 动画 */
.slide-fade-enter-active,
.slide-fade-leave-active { transition: all 0.22s ease; }
.slide-fade-enter-from,
.slide-fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
