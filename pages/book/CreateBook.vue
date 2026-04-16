<template>
  <div class="ebook-container">
    <h2 class="ebook-title">新增电子书</h2>

    <BookEditor ref="editorRef" @save="handleSave" />

    <div class="action-buttons">
      <n-button @click="goBack" class="back-btn">返回</n-button>
      <n-button type="primary" @click="submitContent" class="submit-btn" :loading="saving">
        保存电子书
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NButton, createDiscreteApi } from 'naive-ui'

useHead({ title: '新增电子书' })

const editorRef = ref(null)
const saving = ref(false)
const { message } = createDiscreteApi(['message'])

// 提交内容
const submitContent = () => {
  editorRef.value?.saveToDatabase()
}

// 处理保存
const handleSave = async (data) => {
  console.log('✅ 准备保存数据：', data)
  saving.value = true
  
  try {
    const response = await $fetch('/book/create', {
      method: 'POST',
      body: data,
      baseURL: fetchConfig.baseURL,
      headers: {
        appid: fetchConfig.headers.appid
      }
    })
    
    if (response.code === 200) {
      message.success('创建成功')
      const newBookId = response.data?.id || response.data
      setTimeout(() => {
        if (newBookId) {
          navigateTo(`/detail/book/${newBookId}`)
        } else {
          navigateTo('/list/book/1')
        }
      }, 1000)
    } else {
      message.error(response.msg || '创建失败')
    }
  } catch (err) {
    console.error('创建失败:', err)
    message.error('创建失败: ' + (err.message || '未知错误'))
  } finally {
    saving.value = false
  }
}

// 返回
const goBack = () => {
  navigateTo('/list/book/1')
}
</script>

<style scoped>
.ebook-container {
  padding: 16px;
  max-width: 1400px;
  margin: 0 auto;
}

.ebook-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin: 20px auto 0;
  max-width: 400px;
}

.back-btn,
.submit-btn {
  flex: 1;
  padding: 10px 20px;
  font-size: 16px;
}
</style>