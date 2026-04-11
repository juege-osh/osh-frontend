<template>
  <div class="search-box">
    <div class="left">
      <n-select
        v-model="tagIds"
        placeholder="标签筛选"
        style="width: 240px"
        :options="tagOptions"  
      />
      <n-input
        v-model="keyword"
        placeholder="搜索工具"
        style="width: 220px"
        clearable
      />
      <n-button type="primary" @click="handleSearch">搜索</n-button>
    </div>

    <n-button type="success" @click="goAdd">新增</n-button> <!-- 改色：区分新增和搜索 -->
  </div>
</template>

<script setup>
import { NSelect, NInput, NButton } from 'naive-ui'
import { useRouter } from 'vue-router'  // 新增：修复navigateTo依赖

const router = useRouter()  // 初始化路由实例
const keyword = ref('')
const tagIds = ref([])
const emit = defineEmits(['search'])

const tagOptions = ref([
  { label: '编程教程', value: 1 },
  { label: '前端工具', value: 2 },
  { label: '后端工具', value: 3 },
  { label: 'API调试', value: 4 },
  { label: '容器化', value: 5 }
])

// 搜索触发
const handleSearch = () => {
  emit('search', { 
    keyword: keyword.value,
    tagIds: tagIds.value  // 把标签筛选值也传给父组件
  })
}

// 新增跳转（修复navigateTo用法）
const goAdd = () => {
  router.push('/usefull/create')
}
</script>

<style scoped>
.search-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  width: 100%;
  box-sizing: border-box;
}

.left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  flex: 1;
}

/* 适配小屏幕 */
@media (max-width: 768px) {
  .search-box {
    flex-wrap: wrap;
  }
  .left {
    flex-wrap: wrap;
    width: 100%;
  }
  :deep(.n-select), :deep(.n-input) {
    width: 100% !important;
  }
}

/* 修复组件对齐 */
:deep(.n-select), :deep(.n-input) {
  vertical-align: middle;
  height: 36px;  /* 统一高度，更整齐 */
}
:deep(.n-button) {
  align-self: center;
  height: 36px;
  padding: 0 20px;
}
</style>