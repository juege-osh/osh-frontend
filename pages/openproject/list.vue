<template>
  <div class="open-project-page">
    <n-breadcrumb class="breadcrumb-wrapper">
      <n-breadcrumb-item>
        <nuxt-link to="/">首页</nuxt-link>
      </n-breadcrumb-item>
      <n-breadcrumb-item>开源项目</n-breadcrumb-item>
    </n-breadcrumb>

    <OpenProjectSearch @search="handleSearch" />

    <div class="content-area">
      <div v-if="loading" class="empty-box">
        <n-spin size="large" />
      </div>
      <div v-else-if="projectList.length === 0" class="empty-box">
        <n-empty description="暂无开源项目" />
      </div>
      <div v-else class="project-grid">
        <n-card
          v-for="item in projectList"
          :key="item.id"
          class="project-card"
          hoverable
        >
          <template #header>
            <div class="card-header">
              <span class="project-title">{{ item.project_name }}</span>
              <div class="project-tags">
                <n-tag
                  v-for="tagId in item.tagIds"
                  :key="tagId"
                  :type="getTagType(tagId)"
                  size="small"
                  class="project-tag"
                >
                  {{ getTagName(tagId) }}
                </n-tag>
              </div>
            </div>
          </template>

          <div class="card-body">
            <p class="project-desc">
              {{ item.project_desc || '暂无描述' }}
            </p>

            <div class="project-link">
              <n-icon size="14" class="link-icon"><LinkOutline /></n-icon>
              <a
                :href="item.project_url"
                target="_blank"
                rel="noopener noreferrer"
                class="link-text"
              >
                {{ item.project_url }}
              </a>
            </div>
          </div>

          <template #footer>
            <div class="card-footer">
              <div class="author-info">
                <n-avatar :size="24" :src="item.project_cover || defaultCover" />
                <span class="author-name">{{ item.author_name || '匿名' }}</span>
              </div>

              <n-button text type="primary" @click="goProject(item.project_url)">
                访问项目
                <n-icon><ArrowForwardOutline /></n-icon>
              </n-button>
            </div>
          </template>
        </n-card>
      </div>
    </div>

    <div class="pagination-wrapper" v-if="total > 0">
      <n-pagination
        :page-count="Math.ceil(total / 10)"
        :page="currentPage"
        @update:page="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NCard,
  NAvatar,
  NButton,
  NIcon,
  NEmpty,
  NPagination,
  NSpin,
  NTag
} from "naive-ui"
import { ArrowForwardOutline, LinkOutline } from '@vicons/ionicons5'
import { ref, onMounted } from 'vue'

const route = useRoute()
const title = "开源项目列表"

const defaultCover = "https://picsum.photos/200/200"

const projectList = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const searchParams = ref({})


const tagDict = {
  1: { name: "Vue3", type: "primary" },
  2: { name: "Nuxt3", type: "success" },
  3: { name: "Node.js", type: "info" },
  4: { name: "Python", type: "warning" },
  5: { name: "AI实战", type: "danger" },
  6: { name: "信息差", type: "default" }
}

const getTagName = (tagId) => {
  return tagDict[tagId]?.name || "未知标签"
}
const getTagType = (tagId) => {
  return tagDict[tagId]?.type || "default"
}

// 获取数据
const getProjectList = async () => {
  try {
    loading.value = true


    const rawMockData = [
      {
        id: 1,
        project_name: "Vue3 开源商城",
        project_desc: "Vue3 + Vite 前后端分离商城",
        project_url: "https://gitee.com/xxxx/vue3-mall",
        author_name: "前端工程师",
        project_cover: "https://picsum.photos/200/200?2",
        tagIds: [1] // ✅ Vue3
      },
      {
        id: 2,
        project_name: "Nuxt3 实战项目",
        project_desc: "服务端渲染网站",
        project_url: "https://gitee.com/xxxx/nuxt3",
        author_name: "开发者",
        project_cover: "https://picsum.photos/200/200?1",
        tagIds: [2] // ✅ Nuxt3
      },
      {
        id: 3,
        project_name: "Python 数据分析",
        project_desc: "Python 数据处理/可视化",
        project_url: "https://gitee.com/xxxx/python",
        author_name: "数据分析师",
        project_cover: "https://picsum.photos/200/200?3",
        tagIds: [4] // ✅ Python
      },
      {
        id: 4,
        project_name: "AI 实战项目",
        project_desc: "AI大模型应用",
        project_url: "https://gitee.com/xxxx/ai",
        author_name: "AI开发者",
        project_cover: "https://picsum.photos/200/200?4",
        tagIds: [5] // ✅ AI实战
      }
    ]

    // 标签筛选
    let filteredList = rawMockData
    if (searchParams.value.tagIds?.length) {
      filteredList = rawMockData.filter(item =>
        searchParams.value.tagIds.some(t => item.tagIds.includes(t))
      )
    }

    // 关键词筛选
    if (searchParams.value.keyword) {
      const kw = searchParams.value.keyword.toLowerCase()
      filteredList = filteredList.filter(item =>
        item.project_name.toLowerCase().includes(kw) ||
        item.project_desc.toLowerCase().includes(kw)
      )
    }

    const pageSize = 10
    const start = (currentPage.value - 1) * pageSize
    projectList.value = filteredList.slice(start, start + pageSize)
    total.value = filteredList.length

  } catch (err) {
    projectList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const goProject = (url) => {
  if (!url || !/^https?:\/\//.test(url)) return
  window.open(url, '_blank')
}

const handleSearch = (params) => {
  searchParams.value = params
  currentPage.value = 1
  getProjectList()
}

const handlePageChange = (page) => {
  currentPage.value = page
  getProjectList()
}

onMounted(() => {
  getProjectList()
})
</script>


<style scoped>
.open-project-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb-wrapper {
  margin-bottom: 20px;
}

.content-area {
  min-height: 400px;
}

.empty-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.project-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.project-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.project-tags {
  display: flex;
  gap: 6px;
}

.project-tag {
  margin: 0;
}

.card-body {
  flex: 1;
  padding: 16px 20px;
}

.project-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 13px;
}

.link-icon {
  color: #4096ff;
}

.link-text {
  color: #4096ff;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.link-text:hover {
  text-decoration: underline;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.author-name {
  color: #666;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
</style>