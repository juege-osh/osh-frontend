<template>
  <n-modal
    :show="show"
    preset="card"
    :title="formValue.id ? '编辑考试' : '新增考试'"
    style="width: 720px"
    :segmented="{ content: 'soft', footer: 'soft' }"
    @update:show="$emit('update:show', $event)"
  >
    <n-form label-placement="left" label-width="90">
      <n-form-item label="考试标题" required>
        <n-input v-model:value="formValue.title" placeholder="请输入考试标题" />
      </n-form-item>

      <n-form-item label="考试描述">
        <n-input
          v-model:value="formValue.description"
          type="textarea"
          placeholder="简要描述考试内容、适合人群等"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </n-form-item>

      <n-grid :cols="2" :x-gap="16">
        <n-grid-item>
          <n-form-item label="总分" required>
            <n-input-number v-model:value="formValue.totalScore" :min="1" style="width:100%" />
          </n-form-item>
        </n-grid-item>
        <n-grid-item>
          <n-form-item label="及格分" required>
            <n-input-number v-model:value="formValue.passScore" :min="1" style="width:100%" />
          </n-form-item>
        </n-grid-item>
        <n-grid-item>
          <n-form-item label="时长(分钟)" required>
            <n-input-number v-model:value="formValue.expire" :min="1" style="width:100%" />
          </n-form-item>
        </n-grid-item>
        <n-grid-item>
          <n-form-item label="状态">
            <n-select
              v-model:value="formValue.status"
              :options="[{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]"
            />
          </n-form-item>
        </n-grid-item>
      </n-grid>

      <n-form-item label="关联资源">
        <n-space>
          <n-select
            v-model:value="formValue.resourceType"
            :options="resourceTypeOptions"
            placeholder="资源类型（可不选）"
            clearable
            style="width: 160px"
          />
          <n-input-number
            v-if="formValue.resourceType"
            v-model:value="formValue.resourceId"
            placeholder="资源ID"
            :min="1"
            style="width: 160px"
          />
        </n-space>
      </n-form-item>

      <n-form-item label="标签">
        <n-select
          v-model:value="formValue.tags"
          multiple
          filterable
          tag
          :options="tagSelectOptions"
          placeholder="选择或输入标签后回车"
          :on-create="onCreateTag"
        />
      </n-form-item>

      <n-form-item label="开始时间">
        <n-date-picker
          v-model:value="formValue.startTimeTs"
          type="datetime"
          clearable
          style="width: 100%"
        />
      </n-form-item>

      <n-form-item label="结束时间">
        <n-date-picker
          v-model:value="formValue.endTimeTs"
          type="datetime"
          clearable
          style="width: 100%"
        />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="$emit('update:show', false)">取消</n-button>
        <n-button type="primary" :loading="loading" @click="handleSave">
          {{ formValue.id ? '保存修改' : '立即创建' }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { createDiscreteApi } from 'naive-ui'
import {
  NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NSpace,
  NButton, NGrid, NGridItem, NDatePicker,
} from 'naive-ui'
import { apiSaveExam } from '~/composables/Api/Exam/exam'

const props = defineProps({
  show:       Boolean,
  initData:   { type: Object, default: null },
  tagOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:show', 'success'])

const { message } = createDiscreteApi(['message'])
const loading = ref(false)

const tagSelectOptions = computed(() =>
  props.tagOptions.map(t => ({ label: t.label || t, value: t.value || t }))
)

const resourceTypeOptions = [
  { label: '课程', value: 'course' },
  { label: '电子书', value: 'book' },
]

const formValue = reactive({
  id:           null,
  title:        '',
  description:  '',
  totalScore:   100,
  passScore:    60,
  expire:       60,
  status:       1,
  resourceType: null,
  resourceId:   null,
  tags:         [],
  startTimeTs:  null,
  endTimeTs:    null,
})

// 弹窗打开时回填数据
watch(() => props.show, (val) => {
  if (!val) return
  if (props.initData) {
    formValue.id           = props.initData.id || null
    formValue.title        = props.initData.title || ''
    formValue.description  = props.initData.description || ''
    formValue.totalScore   = props.initData.total_score || 100
    formValue.passScore    = props.initData.pass_score || 60
    formValue.expire       = props.initData.expire || 60
    formValue.status       = props.initData.status ?? 1
    formValue.resourceType = props.initData.resource_type || null
    formValue.resourceId   = props.initData.resource_id || null
    formValue.tags         = Array.isArray(props.initData.tags) ? [...props.initData.tags] : []
    formValue.startTimeTs  = props.initData.start_time ? new Date(props.initData.start_time).getTime() : null
    formValue.endTimeTs    = props.initData.end_time   ? new Date(props.initData.end_time).getTime()   : null
  } else {
    resetForm()
  }
})

function resetForm() {
  formValue.id           = null
  formValue.title        = ''
  formValue.description  = ''
  formValue.totalScore   = 100
  formValue.passScore    = 60
  formValue.expire       = 60
  formValue.status       = 1
  formValue.resourceType = null
  formValue.resourceId   = null
  formValue.tags         = []
  formValue.startTimeTs  = null
  formValue.endTimeTs    = null
}

function onCreateTag(inputVal) {
  const t = inputVal.trim()
  return t ? { label: t, value: t } : false
}

async function handleSave() {
  if (!formValue.title.trim()) {
    message.warning('请输入考试标题')
    return
  }
  if (!formValue.totalScore || formValue.totalScore < 1) {
    message.warning('请输入有效总分')
    return
  }
  if (!formValue.passScore || formValue.passScore < 1) {
    message.warning('请输入有效及格分')
    return
  }
  if (formValue.passScore > formValue.totalScore) {
    message.warning('及格分不能大于总分')
    return
  }
  if (!formValue.expire || formValue.expire < 1) {
    message.warning('请输入有效时长')
    return
  }

  loading.value = true
  try {
    const payload = {
      id:           formValue.id || undefined,
      title:        formValue.title.trim(),
      description:  formValue.description || undefined,
      totalScore:   formValue.totalScore,
      passScore:    formValue.passScore,
      expire:       formValue.expire,
      status:       formValue.status,
      resourceType: formValue.resourceType || undefined,
      resourceId:   formValue.resourceId   || undefined,
      tags:         formValue.tags.length > 0 ? formValue.tags : undefined,
      startTime:    formValue.startTimeTs ? new Date(formValue.startTimeTs).toISOString() : undefined,
      endTime:      formValue.endTimeTs   ? new Date(formValue.endTimeTs).toISOString()   : undefined,
    }

    const res = await apiSaveExam(payload)
    if (res?.code === 200) {
      message.success(formValue.id ? '修改成功' : '创建成功')
      emit('update:show', false)
      emit('success')
      setTimeout(resetForm, 300)
    } else {
      message.error(res?.msg || '操作失败')
    }
  } catch (e) {
    message.error(e?.data?.msg || '操作失败，请检查网络')
  } finally {
    loading.value = false
  }
}
</script>
