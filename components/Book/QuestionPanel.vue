<template>
  <section class="question-panel" :class="{ 'sidebar-mode': compact }">
    <div class="panel-head">
      <div>
        <p class="eyebrow">Book Q&A</p>
        <h3>电子书提问区</h3>
        <p class="panel-desc">{{ compact ? '提问和历史问题都集中在这里。' : '围绕当前电子书集中提问，历史问题可直接下拉查看。' }}</p>
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
          <div v-else-if="questions.length === 0" class="state-box">这本电子书还没有人提问。</div>
          <div v-else class="question-list">
            <button
              v-for="question in questions"
              :key="question.id"
              class="question-item"
              @click="openQuestion(question.id)"
            >
              <div class="question-main">
                <div class="question-title-row">
                  <span class="status-dot" :class="statusClass(question.status)"></span>
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
      title="为当前电子书提问"
      :preset-resource-type="BOOK_RESOURCE_TYPE"
      :preset-resource-no="bookId"
      :lock-resource="true"
      @success="loadQuestions"
    />
  </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useHasAuth } from '~/composables/useAuth'
import { apiGetQuestionList } from '~/composables/Api/QuestionAnswer/qna'
import { BOOK_RESOURCE_TYPE } from '~/composables/Api/Book/book'

const props = defineProps({
  bookId: {
    type: [Number, String],
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
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
  () => props.bookId,
  () => {
    if (props.bookId) {
      loadQuestions()
    }
  },
  { immediate: true }
)

async function loadQuestions() {
  if (!props.bookId) return
  loading.value = true
  errorText.value = ''

  try {
    const response = await apiGetQuestionList({
      resourceType: BOOK_RESOURCE_TYPE,
      resourceNo: Number(props.bookId),
      type: 'all',
      pageNum: 1,
      pageSize: 50,
    })

    const rows = response?.rows
      || response?.data?.rows
      || []
    const totalValue = response?.total
      || response?.data?.total
      || rows.length

    questions.value = rows
    total.value = totalValue
  } catch (error) {
    console.error('load book questions failed', error)
    errorText.value = error?.data?.msg || error?.message || '问题列表加载失败'
  } finally {
    loading.value = false
  }
}

function handleOpenCreate() {
  useHasAuth(() => {
    showCreateModal.value = true
  })
}

function openQuestion(questionId) {
  navigateTo(`/question_answer/detail/${questionId}`)
}

function statusText(status) {
  const current = Number(status)
  if (current === 2) return '已解决'
  if (current === 1) return '待回答'
  return '草稿'
}

function statusClass(status) {
  const current = Number(status)
  if (current === 2) return 'resolved'
  if (current === 1) return 'pending'
  return 'draft'
}

function truncate(text, length) {
  if (!text) return ''
  return text.length > length ? `${text.slice(0, length)}...` : text
}
</script>

<style scoped>
.question-panel {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(255, 203, 107, 0.34), transparent 38%),
    radial-gradient(circle at bottom right, rgba(69, 161, 255, 0.28), transparent 42%),
    linear-gradient(145deg, #102036 0%, #1c2f4c 56%, #0d1524 100%);
  color: #f8fafc;
  box-shadow: 0 22px 60px rgba(7, 14, 27, 0.28);
}

.question-panel.sidebar-mode {
  border-radius: 24px;
  padding: 18px 16px;
}

.panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 11px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(248, 250, 252, 0.6);
}

.panel-head h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.panel-desc {
  margin: 10px 0 0;
  max-width: 560px;
  color: rgba(226, 232, 240, 0.82);
  line-height: 1.7;
}

.sidebar-mode .panel-head {
  flex-direction: column;
}

.sidebar-mode .panel-head h3 {
  font-size: 18px;
}

.sidebar-mode .panel-desc {
  max-width: none;
  line-height: 1.6;
  font-size: 13px;
}

.ask-btn,
.dropdown-toggle,
.question-item {
  font: inherit;
}

.ask-btn {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #ffd35c 0%, #ff8f66 100%);
  color: #182032;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(255, 184, 77, 0.28);
}

.sidebar-mode .ask-btn {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 22px;
}

.sidebar-mode .summary-row {
  grid-template-columns: 1fr;
  gap: 10px;
}

.summary-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.summary-label {
  display: block;
  margin-bottom: 8px;
  color: rgba(226, 232, 240, 0.72);
  font-size: 13px;
}

.summary-card strong {
  font-size: 26px;
}

.sidebar-mode .summary-card {
  padding: 12px 14px;
  border-radius: 18px;
}

.sidebar-mode .summary-card strong {
  font-size: 18px;
}

.dropdown-shell {
  margin-top: 18px;
}

.sidebar-mode .dropdown-shell {
  margin-top: 16px;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.06);
  color: #f8fafc;
  cursor: pointer;
}

.toggle-icon {
  font-size: 22px;
  transition: transform 0.24s ease;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.dropdown-body {
  margin-top: 12px;
  border-radius: 22px;
  padding: 12px;
  background: rgba(6, 11, 20, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-mode .dropdown-body {
  padding: 8px;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 380px;
  overflow: auto;
}

.sidebar-mode .question-list {
  max-height: min(58vh, 520px);
}

.question-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.sidebar-mode .question-item {
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
}

.question-item:hover {
  transform: translateY(-1px);
  border-color: rgba(255, 211, 92, 0.4);
  background: rgba(255, 255, 255, 0.08);
}

.question-main strong {
  display: block;
  font-size: 15px;
}

.question-main p {
  margin: 8px 0 0;
  color: rgba(226, 232, 240, 0.74);
  line-height: 1.6;
}

.question-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.question-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 88px;
  text-align: right;
  color: rgba(226, 232, 240, 0.72);
  font-size: 12px;
}

.sidebar-mode .question-meta {
  width: 100%;
  min-width: 0;
  flex-direction: row;
  justify-content: space-between;
  text-align: left;
  font-size: 11px;
}

.sidebar-mode .question-main strong {
  font-size: 14px;
}

.sidebar-mode .question-main p {
  font-size: 12px;
  line-height: 1.55;
}

.sidebar-mode .dropdown-toggle {
  padding: 12px 14px;
  border-radius: 16px;
  font-size: 13px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.06);
}

.status-dot.resolved {
  background: #4ade80;
}

.status-dot.pending {
  background: #fbbf24;
}

.status-dot.draft {
  background: #94a3b8;
}

.state-box {
  padding: 18px 16px;
  text-align: center;
  color: rgba(226, 232, 240, 0.72);
}

.state-box.error {
  color: #fecaca;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.24s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 768px) {
  .question-panel {
    padding: 20px;
    border-radius: 22px;
  }

  .panel-head,
  .question-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .ask-btn {
    width: 100%;
    justify-content: center;
  }

  .summary-row {
    grid-template-columns: 1fr;
  }

  .question-meta {
    min-width: 0;
    text-align: left;
  }
}
</style>
