<template>
  <div class="open-project-create">
    <!-- 面包屑 -->
    <n-breadcrumb class="breadcrumb-wrapper">
      <n-breadcrumb-item>
        <nuxt-link to="/">首页</nuxt-link>
      </n-breadcrumb-item>
      <n-breadcrumb-item>
        <nuxt-link to="/openproject/list">开源项目</nuxt-link>
      </n-breadcrumb-item>
      <n-breadcrumb-item>新增项目</n-breadcrumb-item>
    </n-breadcrumb>

    <!-- 表单卡片 - 全屏宽 -->
    <n-card class="create-card">
      <template #header>
        <span class="create-title">新增开源项目</span>
      </template>

      <!-- 表单：宽度拉满 -->
      <n-form
        ref="formRef"
        :model="projectForm"
        :rules="formRules"
        label-placement="left"
        label-width="120px"
        class="full-form"
      >
        <!-- 项目名称 -->
        <n-form-item label="项目名称" path="project_name">
          <n-input
            v-model:value="projectForm.project_name"
            placeholder="请输入项目名称（如：Vue3 开源商城）"
            clearable
          />
        </n-form-item>

        <!-- 项目描述 -->
        <n-form-item label="项目描述" path="project_desc">
          <n-input
            v-model:value="projectDesc"
            type="textarea"
            placeholder="请输入项目详细描述"
            :rows="5"
            clearable
          />
        </n-form-item>

        <!-- 项目链接 -->
        <n-form-item label="项目链接" path="project_url">
          <n-input
            v-model:value="projectForm.project_url"
            placeholder="请输入项目Gitee/GitHub地址（如：https://gitee.com/xxxx/vue3-mall）"
            clearable
          />
        </n-form-item>

        <!-- 作者名称 -->
        <n-form-item label="作者名称" path="author_name">
          <n-input
            v-model:value="projectForm.author_name"
            placeholder="请输入作者名称"
            clearable
          />
        </n-form-item>

        <!-- 项目封面 -->
        <n-form-item label="项目封面" path="project_cover">
          <n-input
            v-model:value="projectForm.project_cover"
            placeholder="请输入封面图片URL（选填）"
            clearable
          />
        </n-form-item>
      </n-form>

      <!-- 按钮 -->
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
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  NBreadcrumb, NBreadcrumbItem, NCard, NForm, NFormItem,
  NInput, NButton, useMessage
} from 'naive-ui'

const router = useRouter()
const message = useMessage()
const formRef = ref(null)
const submitLoading = ref(false)

// 表单数据
const projectForm = reactive({
  project_name: '',
  project_desc: '',
  project_url: '',
  author_name: '',
  project_cover: ''
})

// 修复：textarea 单独绑定（解决输入卡顿问题）
const projectDesc = ref('')
watch(projectDesc, (val) => {
  projectForm.project_desc = val
})

// 校验规则
const formRules = {
  project_name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  project_url: [
    { required: true, message: '请输入项目链接', trigger: 'blur' },
    { pattern: /^https?:\/\/.+$/, message: '请输入有效的URL地址', trigger: 'blur' }
  ],
  author_name: [{ required: true, message: '请输入作者名称', trigger: 'blur' }],
  project_desc: [{ required: true, message: '请输入项目描述', trigger: 'blur' }]
}

// 返回列表
const goBack = () => {
  router.push('/openproject/list')
}

// 提交表单（模拟成功，不报错）
const submitForm = async () => {
  await formRef.value.validate()
  submitLoading.value = true
  setTimeout(() => {
    message.success('新增项目成功！')
    router.push('/openproject/list')
  }, 800)
}
</script>

<style scoped>
/* 最外层：全屏宽度 */
.open-project-create {
  width: 96% !important;
  max-width: 1400px !important;
  margin: 20px auto !important;
  padding: 0 !important;
}

.breadcrumb-wrapper {
  margin-bottom: 20px;
  font-size: 14px;
}

/* 卡片：全屏、不挤压 */
.create-card {
  width: 100% !important;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 10px 20px 20px 20px;
}

.create-title {
  font-size: 18px;
  font-weight: 600;
}

/* 表单：100%宽度 */
.full-form {
  width: 100% !important;
}

/* 表单项目：全屏 */
:deep(.n-form-item) {
  width: 100% !important;
  margin-bottom: 20px !important;
}

/* 输入框：全屏 */
:deep(.n-input, .n-input-wrapper) {
  width: 100% !important;
}

/* 按钮组 */
.btn-group {
  margin-top: 35px;
  display: flex;
  gap: 20px;
  justify-content: center;
}
</style>