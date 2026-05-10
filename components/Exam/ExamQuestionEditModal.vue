<template>
  <n-modal
    :show="show"
    preset="card"
    :title="form.id ? '编辑题目' : '新增题目'"
    style="width: 640px"
    :segmented="{ content: 'soft', footer: 'soft' }"
    @update:show="$emit('update:show', $event)"
  >
    <n-form label-placement="left" label-width="96">
      <n-form-item label="题型" required>
        <n-select
          v-model:value="form.type"
          :options="typeOptions"
          placeholder="选择题型"
        />
      </n-form-item>
      <n-form-item label="题干" required>
        <n-input v-model:value="form.title" type="textarea" placeholder="题目内容（支持简单 HTML）" :autosize="{ minRows: 2, maxRows: 6 }" />
      </n-form-item>
      <n-form-item label="分值" required>
        <n-input-number v-model:value="form.score" :min="1" :max="999" style="width: 100%" />
      </n-form-item>
      <n-form-item v-if="needsOptions" label="选项 JSON" required>
        <n-input
          v-model:value="form.options"
          type="textarea"
          placeholder='单选/多选：如 ["选项A","选项B","选项C","选项D"]'
          :autosize="{ minRows: 3, maxRows: 8 }"
        />
      </n-form-item>
      <n-form-item label="参考答案" :required="needsCorrect">
        <n-input
          v-model:value="form.correctAnswer"
          type="textarea"
          placeholder="单选/判断：索引或 true/false；多选：0,2 逗号索引；填空/简答：参考文本"
          :autosize="{ minRows: 1, maxRows: 4 }"
        />
      </n-form-item>
      <n-form-item label="备注">
        <n-input v-model:value="form.remark" placeholder="解析或提示（可选）" />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button @click="$emit('update:show', false)">取消</n-button>
        <n-button type="primary" :loading="loading" @click="submit">保存</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { createDiscreteApi, NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NSpace, NButton } from 'naive-ui'
import { apiSaveExamQuestion } from '~/composables/Api/Exam/exam'

const props = defineProps({
  show: Boolean,
  examId: { type: Number, required: true },
  initQuestion: { type: Object, default: null },
})
const emit = defineEmits(['update:show', 'success'])

const { message } = createDiscreteApi(['message'])
const loading = ref(false)

const typeOptions = [
  { label: '单选题', value: 'radio' },
  { label: '多选题', value: 'checkbox' },
  { label: '判断题', value: 'trueOrfalse' },
  { label: '填空题', value: 'completion' },
  { label: '问答题', value: 'answer' },
]

const form = reactive({
  id: null,
  type: 'radio',
  title: '',
  score: 10,
  options: '["A","B","C","D"]',
  correctAnswer: '',
  remark: '',
})

const needsOptions = computed(() => form.type === 'radio' || form.type === 'checkbox')
const needsCorrect = computed(() => form.type !== 'completion')

function reset() {
  form.id = null
  form.type = 'radio'
  form.title = ''
  form.score = 10
  form.options = '["A","B","C","D"]'
  form.correctAnswer = ''
  form.remark = ''
}

function fillFrom(q) {
  if (!q) {
    reset()
    return
  }
  form.id = q.id ?? q.question_id ?? null
  form.type = q.type || 'radio'
  form.title = q.title || ''
  form.score = q.score != null ? Number(q.score) : 10
  if (typeof q.options === 'string') {
    form.options = q.options
  } else if (Array.isArray(q.options)) {
    try {
      form.options = JSON.stringify(q.options)
    } catch {
      form.options = '[]'
    }
  } else {
    form.options = '[]'
  }
  const ca = q.correct_answer ?? q.correctAnswer
  form.correctAnswer = ca != null ? String(ca) : ''
  form.remark = q.remark || ''
}

watch(
  () => props.show,
  (v) => {
    if (v) fillFrom(props.initQuestion)
  }
)

watch(
  () => props.initQuestion,
  () => {
    if (props.show) fillFrom(props.initQuestion)
  },
  { deep: true }
)

async function submit() {
  if (!form.title.trim()) {
    message.warning('请填写题干')
    return
  }
  if (needsOptions.value) {
    try {
      const arr = JSON.parse(form.options || '[]')
      if (!Array.isArray(arr) || arr.length < 2) {
        message.warning('选项 JSON 至少包含 2 项')
        return
      }
    } catch {
      message.warning('选项需为合法 JSON 数组')
      return
    }
  }

  loading.value = true
  try {
    const payload = {
      id: form.id || undefined,
      examId: props.examId,
      title: form.title.trim(),
      score: form.score,
      type: form.type,
      remark: form.remark || undefined,
      options: needsOptions.value ? form.options : undefined,
      correctAnswer: form.correctAnswer || undefined,
    }
    const res = await apiSaveExamQuestion(payload)
    if (res?.code === 200) {
      message.success('保存成功')
      emit('update:show', false)
      emit('success')
    } else {
      message.error(res?.msg || '保存失败')
    }
  } catch (e) {
    message.error(e?.data?.msg || e?.message || '保存失败')
  } finally {
    loading.value = false
  }
}
</script>
