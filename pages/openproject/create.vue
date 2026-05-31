<template>
  <div class="open-project-create">
    <n-breadcrumb class="breadcrumb-wrapper">
      <n-breadcrumb-item><nuxt-link to="/">首页</nuxt-link></n-breadcrumb-item>
      <n-breadcrumb-item><nuxt-link to="/openproject/list">开源项目</nuxt-link></n-breadcrumb-item>
      <n-breadcrumb-item>新增项目</n-breadcrumb-item>
    </n-breadcrumb>

    <n-card class="create-card">
      <template #header>
        <span class="create-title">新增开源项目</span>
      </template>

      <n-form
        ref="formRef"
        :model="projectForm"
        :rules="formRules"
        label-placement="left"
        label-width="120px"
        class="full-form"
      >
        <n-form-item label="项目名称" path="projectName">
          <n-input v-model:value="projectForm.projectName" placeholder="请输入项目名称" clearable />
        </n-form-item>

        <n-form-item label="项目描述" path="projectDesc">
          <n-input
            v-model:value="projectForm.projectDesc"
            type="textarea"
            placeholder="请输入项目详细描述"
            :rows="5"
            clearable
          />
        </n-form-item>

        <n-form-item label="项目链接" path="projectUrl">
          <n-input
            v-model:value="projectForm.projectUrl"
            placeholder="请输入 Gitee/GitHub 地址（https://...）"
            clearable
          />
        </n-form-item>

        <n-form-item label="作者名称" path="authorName">
          <n-input v-model:value="projectForm.authorName" placeholder="请输入作者名称" clearable />
        </n-form-item>

        <n-form-item label="项目封面" path="projectCover">
          <n-input v-model:value="projectForm.projectCover" placeholder="封面图片URL（选填）" clearable />
        </n-form-item>

        <n-form-item label="项目标签">
          <n-select
            v-model:value="projectForm.tagValues"
            multiple
            filterable
            tag
            :options="tagOptions"
            placeholder="选择已有标签，或直接输入新标签后按 Enter"
            style="width: 100%"
          />
          <template #feedback>
            <span style="font-size:12px;color:#999">可直接输入自定义标签名，按 Enter 确认</span>
          </template>
        </n-form-item>

        <n-form-item label="关联资源">
          <div class="resource-list">
            <div
              v-for="(res, idx) in projectForm.resources"
              :key="idx"
              class="resource-row"
            >
              <n-select
                v-model:value="res.resourceType"
                :options="resourceTypeOptions"
                placeholder="资源类型"
                style="width:120px;flex-shrink:0"
                @update:value="(val) => onResTypeChange(idx, val)"
              />
              <n-select
                v-if="res.resourceType"
                v-model:value="res.resourceId"
                :options="res._options"
                :loading="res._loading"
                filterable
                remote
                clearable
                placeholder="输入名称搜索并选择"
                style="flex:1;min-width:0"
                @search="(kw) => onResSearch(idx, kw)"
                @update:value="(val) => onResSelect(idx, val)"
              />
              <n-button text type="error" @click="removeResource(idx)">✕</n-button>
            </div>
            <n-button dashed size="small" @click="addResource" style="margin-top:8px">
              + 添加关联资源
            </n-button>
          </div>
          <template #feedback>
            <span style="font-size:12px;color:#999">可关联本站课程、电子书资源</span>
          </template>
        </n-form-item>
      </n-form>

      <div class="btn-group">
        <n-button size="large" @click="goBack">取消</n-button>
        <n-button size="large" type="primary" @click="submitForm" :loading="submitLoading">
          提交保存
        </n-button>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  NBreadcrumb, NBreadcrumbItem, NCard, NForm, NFormItem,
  NInput, NButton, NSelect, NSpace, useMessage
} from 'naive-ui'
import { fetchConfig } from '~/composables/useHttp'
const router = useRouter()
const message = useMessage()
const formRef = ref(null)
const submitLoading = ref(false)
const tagOptions = ref([])

const projectForm = reactive({
  projectName: '',
  projectDesc: '',
  projectUrl: '',
  authorName: '',
  projectCover: '',
  tagValues: [],
  resources: [],  // [{ resourceType, resourceUrl, resourceName }]
})

const resourceTypeOptions = [
  { label: '课程', value: 'course' },
  { label: '电子书', value: 'book' },
]

function addResource() {
  projectForm.resources.push({ resourceType: null, resourceId: null, resourceUrl: '', resourceName: '', _options: [], _loading: false })
}

function removeResource(idx) {
  projectForm.resources.splice(idx, 1)
}

function buildHeaders() {
  const headers = { appid: 'bd9d01ecc75dbbaaefce' }
  if (process.client) {
    let token = ''
    try { token = useCookie('token').value || '' } catch {}
    if (!token) {
      token = localStorage.getItem('token') || localStorage.getItem('Token') || ''
    }
    if (token) {
      headers.token = token
      headers.Authorization = `Bearer ${token}`
    }
  }
  return headers
}

async function fetchResourceList(type, keyword = '') {
  if (!type) return []
  const url = type === 'course' ? '/course/search' : '/book/search'
  const body = { pageNum: 1, pageSize: 20 }
  if (keyword) body.title = keyword
  try {
    const res = await $fetch(url, {
      baseURL: fetchConfig.baseURL,
      method: 'POST',
      headers: buildHeaders(),
      body,
    })
    const payload = res?.data || res || {}
    return payload.rows || payload.records || []
  } catch (e) {
    return []
  }
}

function onResTypeChange(idx, newType) {
  const res = projectForm.resources[idx]
  res.resourceId = null
  res.resourceUrl = ''
  res.resourceName = ''
  res._options = []
  if (newType) {
    loadResOptions(idx, '')
  }
}

let resSearchTimers = {}
function onResSearch(idx, keyword) {
  if (resSearchTimers[idx]) clearTimeout(resSearchTimers[idx])
  resSearchTimers[idx] = setTimeout(() => {
    loadResOptions(idx, keyword || '')
  }, 300)
}

async function loadResOptions(idx, keyword) {
  const res = projectForm.resources[idx]
  if (!res.resourceType) return
  res._loading = true
  try {
    const list = await fetchResourceList(res.resourceType, keyword)
    res._options = list.map(item => ({
      label: item.title || `#${item.id}`,
      value: item.id,
    }))
  } finally {
    res._loading = false
  }
}

function onResSelect(idx, selectedId) {
  const res = projectForm.resources[idx]
  const selected = res._options.find(o => o.value === selectedId)
  if (selected) {
    res.resourceName = selected.label
    // 根据类型生成 URL
    if (res.resourceType === 'course') {
      res.resourceUrl = `/course_detail/${selectedId}`
    } else if (res.resourceType === 'book') {
      res.resourceUrl = `/detail/book/${selectedId}`
    }
  }
}

const formRules = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  projectUrl: [
    { required: true, message: '请输入项目链接', trigger: 'blur' },
    { pattern: /^https?:\/\/.+$/, message: '请输入有效的URL地址', trigger: 'blur' },
  ],
  authorName: [{ required: true, message: '请输入作者名称', trigger: 'blur' }],
  projectDesc: [{ required: true, message: '请输入项目描述', trigger: 'blur' }],
}

const loadTags = async () => {
  try {
    const res = await apiGetOpenProjectTags()
    const tags = res?.data || res || []
    // value 用 number 类型，方便后续区分自定义标签（string）
    tagOptions.value = tags.map(t => ({ label: t.tagName, value: Number(t.id) }))
  } catch {}
}

const goBack = () => router.push('/openproject/list')

const submitForm = async () => {
  await formRef.value.validate()
  submitLoading.value = true
  try {
    // 区分已有标签（number）和自定义标签（string）
    const tagIds = projectForm.tagValues.filter(v => typeof v === 'number')
    const customTags = projectForm.tagValues.filter(v => typeof v === 'string' && v.trim())

    await apiSubmitOpenProject({
      projectName: projectForm.projectName,
      projectDesc: projectForm.projectDesc,
      projectUrl: projectForm.projectUrl,
      authorName: projectForm.authorName,
      projectCover: projectForm.projectCover,
      tagIds,
      customTags,
      resources: projectForm.resources.filter(r => r.resourceUrl?.trim()),
    })
    message.success('提交成功，等待审核')
    router.push('/openproject/list')
  } catch (e) {
    message.error(e?.data?.msg || '提交失败，请稍后重试')
  } finally {
    submitLoading.value = false
  }
}

onMounted(loadTags)
</script>

<style scoped>
.open-project-create {
  width: 96%;
  max-width: 1400px;
  margin: 20px auto;
}
.breadcrumb-wrapper { margin-bottom: 20px; font-size: 14px; }
.create-card { border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); padding: 10px 20px 20px; }
.create-title { font-size: 18px; font-weight: 600; }
.full-form { width: 100%; }
:deep(.n-form-item) { width: 100%; margin-bottom: 20px; }
:deep(.n-input), :deep(.n-input-wrapper) { width: 100%; }
.btn-group { margin-top: 35px; display: flex; gap: 20px; justify-content: center; }

.resource-list { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.resource-row { display: flex; align-items: center; gap: 8px; }
</style>
