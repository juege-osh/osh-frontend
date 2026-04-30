<template>
  <!-- 页面容器：宽度拉满，仅留左右内边距 -->
  <div class="page-wrapper">
    <!-- 面包屑 -->
    <div class="breadcrumb-box">
      <n-breadcrumb>
        <n-breadcrumb-item>
          <nuxt-link to="/">首页</nuxt-link>
        </n-breadcrumb-item>
        <n-breadcrumb-item>实用网站</n-breadcrumb-item>
      </n-breadcrumb>
    </div>

    <!-- 搜索组件 -->
    <div class="search-box">
      <UseFullSearch @search="handleSearch" />
    </div>

    <!-- 记录列表：非表格布局，纯卡片长条 -->
    <div class="records-list">
      <!-- 列表表头 -->
      <div class="record-header">
        <div class="header-item name-col">网站名称</div>
        <div class="header-item desc-col">详细信息</div>
        <div class="header-item action-col">访问链接</div>
        <div class="header-item status-col">状态</div>
        <div class="header-item rate-col">评价</div>
      </div>

      <!-- 每条记录：长条卡片 -->
      <div 
        class="record-item" 
        v-for="item in list" 
        :key="item.id"
      >
        <div class="record-col name-col">{{ item.name }}</div>
        <div class="record-col desc-col">{{ item.desc }}</div>
        
        <!-- 访问链接 -->
        <div class="record-col action-col">
          <n-button text type="primary" @click="openLink(item.url, item.id)">
            点击访问 ({{ item.clickCount }})
          </n-button>
        </div>

        <!-- 状态 -->
        <div class="record-col status-col">
          <n-tag type="success" v-if="item.status === 1"> 已通过 </n-tag>
          <n-tag type="warning" v-else> 待审核 </n-tag>
        </div>

        <!-- 评价：好评 中评 差评 全部显示 -->
        <div class="record-col rate-col">
          <n-button text size="small" type="success" @click="setRate(item.id, '好评')">
            好评({{ item.good }})
          </n-button>
          <n-button text size="small" type="warning" class="ml-1" @click="setRate(item.id, '中评')">
            中评({{ item.medium }})
          </n-button>
          <n-button text size="small" type="error" class="ml-1" @click="setRate(item.id, '差评')">
            差评({{ item.bad }})
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { NTag, NButton, NBreadcrumb, NBreadcrumbItem } from 'naive-ui'

const list = ref([
  { 
    id: 1, 
    name: '菜鸟教程', 
    url: 'https://www.runoob.com', 
    status: 1,
    desc: '包含HTML、CSS、JavaScript、Python等多语言入门教程',
    clickCount: 128, good: 86, medium: 12, bad: 3
  },
  { 
    id: 2, 
    name: 'Vue官方文档', 
    url: 'https://cn.vuejs.org', 
    status: 1,
    desc: 'Vue3官方中文文档，含组合式API、单文件组件等核心内容',
    clickCount: 205, good: 190, medium: 12, bad: 3
  },
  { 
    id: 3, 
    name: 'Spring官网', 
    url: 'https://spring.io', 
    status: 1,
    desc: 'Spring生态官方站点，涵盖Spring Boot、Spring Cloud等框架',
    clickCount: 92, good: 45, medium: 33, bad: 14
  },
  { 
    id: 4, 
    name: 'Postman', 
    url: 'https://www.postman.com', 
    status: 1,
    desc: 'API调试与测试工具，支持接口请求、集合管理、自动化测试',
    clickCount: 156, good: 140, medium: 15, bad: 1
  },
  { 
    id: 5, 
    name: 'Docker官方', 
    url: 'https://www.docker.com', 
    status: 1,
    desc: 'Docker容器化技术官方站点，含文档、镜像仓库、教程',
    clickCount: 133, good: 105, medium: 20, bad: 8
  },
])

const handleSearch = (params) => { console.log('搜索', params) }

const openLink = (url, id) => {
  const item = list.value.find(i => i.id === id)
  if (item) item.clickCount++
  window.open(url, '_blank')
}

const setRate = (id, type) => {
  const item = list.value.find(i => i.id === id)
  if (!item) return
  if (type === '好评') item.good++
  if (type === '中评') item.medium++
  if (type === '差评') item.bad++
}
</script>

<style scoped>
/* 页面容器 */
.page-wrapper {
  width: 100%;
  padding: 24px 20px;
  box-sizing: border-box;
  background: #f8f9fa;
  min-height: calc(100vh - 40px);
}

/* 面包屑 */
.breadcrumb-box {
  margin-bottom: 20px;
  font-size: 14px;
}

/* 搜索框 */
.search-box {
  margin-bottom: 24px;
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* 列表容器 */
.records-list {
  width: 100%;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}

/* 表头 */
.record-header {
  display: flex;
  align-items: center;
  height: 60px;
  padding: 0 24px;
  background: #f5f7fa;
  border-bottom: 1px solid #e8e8e8;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

/* 列表项 */
.record-item {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 24px;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.record-item:last-child { border-bottom: none; }
.record-item:hover { background: #f9fafc; }

/* 列宽 */
.name-col  { width: 18%; }
.desc-col  { width: 28%; }
.action-col{ width: 22%; }
.status-col{ width: 15%; }
.rate-col  { width: 17%; display: flex; gap: 2px; align-items: center; }

/* 统一所有列字体：完全一样 */
.record-col {
  font-size: 14px;
  font-weight: 400;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 按钮间距 */
:deep(.ml-1) { margin-left: 2px; }

/* 响应式 */
@media (max-width: 768px) {
  .name-col{width:18%;}.desc-col{width:24%;}.action-col{width:22%;}.status-col{width:16%;}.rate-col{width:20%;}
  .page-wrapper { padding: 16px 12px; }
  .record-header, .record-item { padding: 0 16px; }
}
</style>