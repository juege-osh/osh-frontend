<template>
  <div class="ebook-container">
    <h2 class="ebook-title">新增电子书</h2>

    <!-- 👉 关键：在这里绑定 @save 事件 -->
    <BookEditor ref="editorRef" @save="handleSave" />

    <button @click="submitContent" class="submit-btn">
      保存电子书
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const editorRef = ref(null)

// 状态
const bookContent = useState('saveBookContent', () => '')

// ======================================
// 1. 点击按钮 → 触发子组件的保存方法
// ======================================
const submitContent = () => {
  // 调用子组件里的 saveToDatabase()
  // 它内部会自动 emit('save', 数据)
  editorRef.value?.saveToDatabase()
}

// ======================================
// 2. 监听子组件触发的 @save 事件（拿到数据）
// ======================================
const handleSave = (data) => {
  console.log('✅ 父组件收到保存数据：', data)
  
  // 存入状态
  bookContent.value = data

  // 跳转
  navigateTo('/list/book/1')
}
</script>

<style scoped>
.ebook-container {
  padding: 16px;
  max-width: 1024px;
  margin: 0 auto;
}
.ebook-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
}
.submit-btn {
  display: block;
  margin: 16px auto 0;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: #fff;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}
.submit-btn:hover {
  background-color: #2563eb;
}
</style>