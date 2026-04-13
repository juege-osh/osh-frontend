<template>
  <!-- 页面容器：宽度100%，仅留少量内边距，页面最大化 -->
  <div class="page-wrapper">
    <!-- 面包屑：和列表页风格统一 -->
    <n-breadcrumb class="breadcrumb">
      <n-breadcrumb-item>
        <nuxt-link to="/">首页</nuxt-link>
      </n-breadcrumb-item>
      <n-breadcrumb-item>
        <nuxt-link to="/usefull/list">实用网站</nuxt-link>
      </n-breadcrumb-item>
      <n-breadcrumb-item>新增工具申请</n-breadcrumb-item>
    </n-breadcrumb>

    <!-- 表单卡片：宽度拉满，带阴影和圆角，视觉更舒展 -->
    <div class="form-card">
      <h2 class="form-title">新增工具申请</h2>

      <n-form 
        ref="formRef"
        @submit="handleSubmit" 
        class="form-container"
        :model="form"
        :rules="formRules"
      >
        <n-form-item label="工具名称" path="name" class="form-item">
          <n-input 
            v-model="form.name" 
            class="form-input" 
            placeholder="请输入工具名称（如：Vue官方文档）"
            clearable
            size="large"
          />
        </n-form-item>

        <n-form-item label="工具链接" path="url" class="form-item">
          <n-input 
            v-model="form.url" 
            class="form-input" 
            placeholder="请输入工具官网链接（如：https://cn.vuejs.org）"
            clearable
            size="large"
          />
        </n-form-item>

        <n-form-item label="备注说明" path="remark" class="form-item">
          <n-input 
            v-model="form.remark" 
            type="textarea" 
            class="form-input"
            placeholder="请输入工具描述/使用场景（选填）"
            :rows="5"
            size="large"
          />
        </n-form-item>

        <!-- 按钮组：布局优化，按钮更大 -->
        <div class="submit-btn-group">
          <n-button type="default" @click="goBack" size="large">返回列表</n-button>
          <n-button type="primary" html-type="submit" size="large">提交申请</n-button>
        </div>
      </n-form>
    </div>
  </div>
</template>

<script setup>
import { NButton, NForm, NFormItem, NInput, NBreadcrumb, NBreadcrumbItem } from 'naive-ui'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref(null)

// 表单数据
const form = ref({
  name: '',
  url: '',
  remark: ''
})

// 表单验证规则
const formRules = ref({
  name: [
    { required: true, message: '请输入工具名称', trigger: 'blur' },
    { min: 2, max: 50, message: '名称长度在2-50个字符之间', trigger: 'blur' }
  ],
  url: [
    { required: true, message: '请输入工具链接', trigger: 'blur' },
    { pattern: /^https?:\/\/.+/, message: '请输入合法的网址（以http/https开头）', trigger: 'blur' }
  ]
})

// 提交处理
const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    // 表单验证
    const valid = await formRef.value.validate()
    if (!valid) return

    // 模拟接口提交（实际项目替换为真实接口）
    // await $fetch('/api/tool/create', {
    //   method: 'POST',
    //   body: form.value
    // })

    // 提示+跳转
    window.$message?.success('提交成功，请等待管理员审核')
    router.push('/list')
  } catch (error) {
    window.$message?.error('提交失败，请检查表单内容')
    console.error('提交错误：', error)
  }
}

// 返回列表
const goBack = () => {
  router.push('/usefull/list')
}
</script>

<style scoped>
/* 页面容器：宽度100%，拉满页面，仅留左右20px内边距 */
.page-wrapper {
  width: 100%;
  padding: 30px 20px;
  box-sizing: border-box;
  background: #f8f9fa;
  min-height: calc(100vh - 40px);
}

/* 面包屑样式 */
.breadcrumb {
  margin-bottom: 24px;
  font-size: 14px;
}

/* 表单卡片：宽度100%，带阴影，视觉层次明显 */
.form-card {
  width: 100%;
  background: #ffffff;
  padding: 30px 40px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
}

/* 表单标题 */
.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

/* 表单项间距 */
.form-item {
  margin-bottom: 24px;
}

/* 输入框样式：宽度100%，高度更大 */
.form-input {
  width: 100%;
  box-sizing: border-box;
}

/* 修复label样式：更醒目，间距合理 */
:deep(.form-item .n-form-item-label) {
  font-size: 15px;
  color: #333;
  font-weight: 500;
  padding-bottom: 8px;
  text-align: left;
  flex-shrink: 0;
  width: auto !important;
}

/* 按钮组：靠右对齐，间距更大 */
.submit-btn-group {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  justify-content: flex-end;
}

/* 适配大屏：最大宽度限制，避免过宽 */
@media (min-width: 1200px) {
  .form-card {
    max-width: 1000px;
    margin: 0 auto;
  }
}

/* 小屏幕适配 */
@media (max-width: 768px) {
  .page-wrapper {
    padding: 20px 12px;
  }
  .form-card {
    padding: 20px 16px;
  }
  .form-title {
    font-size: 18px;
  }
}
</style>