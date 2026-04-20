<template>
  <div class="ebook-container">
    <h2 class="ebook-title">编辑电子书</h2>

    <LoadingGroup :pending="loading" :error="error">
      <BookEditor ref="editorRef" :book-id="bookId" @save="handleSave" />

      <div class="action-buttons">
        <n-button @click="goBack" class="back-btn">返回</n-button>
        <n-button type="primary" @click="submitContent" class="submit-btn" :loading="saving">
          保存电子书
        </n-button>
      </div>
    </LoadingGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NButton, createDiscreteApi } from 'naive-ui'

const route = useRoute()
const bookId = parseInt(route.params.id)

useHead({ title: '编辑电子书' })

const editorRef = ref(null)
const loading = ref(true)
const error = ref(null)
const saving = ref(false)
const { message } = createDiscreteApi(['message'])

// 加载电子书数据
onMounted(async () => {
  try {
    loading.value = true
    const response = await $fetch(`/book/getById?id=${bookId}&forEdit=true`, {
      baseURL: fetchConfig.baseURL,
      headers: {
        ...fetchConfig.headers,
        token: localStorage.getItem('Token') || '',
      }
    })
    
    if (response.code === 200 && response.data) {
      console.log('✅ 电子书数据加载成功:', response.data)
      console.log('📸 封面URL（原始相对路径）:', response.data.cover)
      console.log('📚 章节数量:', response.data.book_details?.length || 0)
      
      // 等待编辑器组件完全挂载
      await nextTick()
      
      // 将数据传递给编辑器组件
      if (editorRef.value && editorRef.value.loadBookData) {
        editorRef.value.loadBookData(response.data)
      } else {
        console.warn('⚠️ 编辑器组件未就绪，延迟加载数据')
        // 如果编辑器还未就绪，延迟500ms再试
        setTimeout(() => {
          if (editorRef.value && editorRef.value.loadBookData) {
            editorRef.value.loadBookData(response.data)
          }
        }, 500)
      }
    } else {
      throw new Error(response.msg || '加载失败')
    }
  } catch (err) {
    console.error('❌ 加载电子书数据失败:', err)
    error.value = err
    message.error('加载失败: ' + (err.message || '未知错误'))
  } finally {
    loading.value = false
  }
})

// 提交内容
const submitContent = () => {
  editorRef.value?.saveToDatabase()
}

// 处理保存
const handleSave = async (data) => {
  console.log('✅ 准备保存数据：', data)
  saving.value = true
  
  try {
    const response = await $fetch('/book/update', {
      method: 'POST',
      body: data,
      baseURL: fetchConfig.baseURL,
      headers: {
        appid: fetchConfig.headers.appid
      }
    })
    
    if (response.code === 200) {
      message.success('保存成功')
      setTimeout(() => {
        navigateTo(`/detail/book/${bookId}`)
      }, 1000)
    } else {
      message.error(response.msg || '保存失败')
    }
  } catch (err) {
    console.error('保存失败:', err)
    message.error('保存失败: ' + (err.message || '未知错误'))
  } finally {
    saving.value = false
  }
}

// 返回
const goBack = () => {
  navigateTo(`/detail/book/${bookId}`)
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
