<template>
  <div>
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <n-input
          v-model:value="searchText"
          placeholder="搜索名称/负责人/分类..."
          clearable
          style="width:240px"
        >
          <template #prefix><n-icon><Search /></n-icon></template>
        </n-input>
        <n-select
          v-model:value="filterCategory"
          :options="categoryOptions"
          placeholder="全部分类"
          clearable
          style="width:140px"
        />
        <n-select
          v-model:value="filterStatus"
          :options="statusOptions"
          placeholder="全部状态"
          clearable
          style="width:120px"
        />
      </div>
      <div class="toolbar-right">
        <n-button @click="checkAllStatus" :loading="checking" secondary>
          <template #icon><n-icon><Refresh /></n-icon></template>
          检查全部状态
        </n-button>
        <n-button type="primary" @click="openAdd">
          <template #icon><n-icon><Add /></n-icon></template>
          新增网站
        </n-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-num">{{ sites.length }}</div>
        <div class="stat-label">总数</div>
      </div>
      <div class="stat-card online">
        <div class="stat-num">{{ onlineCount }}</div>
        <div class="stat-label">在线</div>
      </div>
      <div class="stat-card offline">
        <div class="stat-num">{{ offlineCount }}</div>
        <div class="stat-label">离线</div>
      </div>
      <div class="stat-card unknown">
        <div class="stat-num">{{ unknownCount }}</div>
        <div class="stat-label">未检查</div>
      </div>
    </div>

    <!-- 网站列表 -->
    <div class="site-grid">
      <div
        v-for="site in filteredSites"
        :key="site.id"
        class="site-card"
        :class="'status-border-' + site.status"
      >
        <!-- 状态指示灯 -->
        <div class="site-card-header">
          <div class="site-status-dot" :class="site.status"></div>
          <n-tag :type="statusTagType(site.status)" size="small" round>
            {{ statusLabel(site.status) }}
          </n-tag>
          <div class="site-actions">
            <n-button text size="small" @click="checkOne(site)" :loading="checkingId === site.id">
              <n-icon><Refresh /></n-icon>
            </n-button>
            <n-button text size="small" @click="openEdit(site)">
              <n-icon><Create /></n-icon>
            </n-button>
            <n-button text size="small" type="error" @click="confirmDelete(site)">
              <n-icon><Trash /></n-icon>
            </n-button>
          </div>
        </div>

        <!-- 网站信息 -->
        <div class="site-name">{{ site.name }}</div>
        <a :href="site.url" target="_blank" class="site-url">{{ site.url }}</a>
        <div class="site-desc">{{ site.description || '暂无描述' }}</div>

        <div class="site-meta">
          <span class="meta-item">
            <n-icon size="12"><Pricetag /></n-icon>
            {{ site.category }}
          </span>
          <span class="meta-item">
            <n-icon size="12"><Person /></n-icon>
            {{ site.owner }}
          </span>
        </div>

        <div class="site-time" v-if="site.lastChecked">
          最后检查：{{ site.lastChecked }}
        </div>
        <div class="site-time muted" v-else>尚未检查</div>
      </div>

      <div v-if="filteredSites.length === 0" class="empty-tip">
        <n-empty description="暂无数据" />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <n-modal
      v-model:show="showModal"
      :title="editingId ? '编辑网站' : '新增网站'"
      preset="card"
      style="width:520px"
      :mask-closable="false"
    >
      <n-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-placement="left"
        label-width="80"
      >
        <n-form-item label="网站名称" path="name">
          <n-input v-model:value="form.name" placeholder="请输入网站名称" />
        </n-form-item>
        <n-form-item label="访问地址" path="url">
          <n-input v-model:value="form.url" placeholder="http://..." />
        </n-form-item>
        <n-form-item label="分类" path="category">
          <n-select
            v-model:value="form.category"
            :options="categorySelectOptions"
            placeholder="选择或输入分类"
            tag
            filterable
          />
        </n-form-item>
        <n-form-item label="负责人" path="owner">
          <n-input v-model:value="form.owner" placeholder="请输入负责人姓名" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input
            v-model:value="form.description"
            type="textarea"
            placeholder="简要描述该网站的用途"
            :rows="3"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <div style="display:flex;justify-content:flex-end;gap:8px">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ editingId ? '保存' : '新增' }}
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import {
  NInput, NSelect, NButton, NIcon, NTag, NModal, NForm, NFormItem,
  NEmpty, createDiscreteApi
} from 'naive-ui'
import {
  Search, Refresh, Add, Create, Trash, Pricetag, Person
} from '@vicons/ionicons5'

definePageMeta({ layout: 'internal' })

const sites = useInternalSites()

// 搜索和过滤
const searchText = ref('')
const filterCategory = ref(null)
const filterStatus = ref(null)

const statusOptions = [
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' },
  { label: '未检查', value: 'unknown' },
]

const categoryOptions = computed(() => {
  const cats = [...new Set(sites.value.map(s => s.category).filter(Boolean))]
  return cats.map(c => ({ label: c, value: c }))
})

const categorySelectOptions = [
  { label: '管理系统', value: '管理系统' },
  { label: '基础设施', value: '基础设施' },
  { label: '监控', value: '监控' },
  { label: '开发工具', value: '开发工具' },
  { label: '文档', value: '文档' },
  { label: '其他', value: '其他' },
]

const filteredSites = computed(() => {
  return sites.value.filter(s => {
    const matchSearch = !searchText.value ||
      s.name.includes(searchText.value) ||
      s.owner?.includes(searchText.value) ||
      s.category?.includes(searchText.value)
    const matchCat = !filterCategory.value || s.category === filterCategory.value
    const matchStatus = !filterStatus.value || s.status === filterStatus.value
    return matchSearch && matchCat && matchStatus
  })
})

// 统计
const onlineCount = computed(() => sites.value.filter(s => s.status === 'online').length)
const offlineCount = computed(() => sites.value.filter(s => s.status === 'offline').length)
const unknownCount = computed(() => sites.value.filter(s => s.status === 'unknown').length)

// 状态显示
const statusLabel = (s) => ({ online: '在线', offline: '离线', unknown: '未知' }[s] || '未知')
const statusTagType = (s) => ({ online: 'success', offline: 'error', unknown: 'default' }[s] || 'default')

// 检查状态
const checking = ref(false)
const checkingId = ref(null)

async function checkOne(site) {
  checkingId.value = site.id
  const status = await checkSiteStatus(site)
  useUpdateSiteStatus(site.id, status)
  checkingId.value = null
}

async function checkAllStatus() {
  checking.value = true
  await Promise.all(sites.value.map(s => checkOne(s)))
  checking.value = false
  const { message } = createDiscreteApi(['message'])
  message.success('全部检查完成')
}

// 定时任务：每60秒自动检查一次
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    checkAllStatus()
  }, 60000)
  // 首次进入自动检查
  checkAllStatus()
})
onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// 表单
const showModal = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  name: '',
  url: '',
  category: null,
  owner: '',
  description: '',
})

const rules = {
  name: [{ required: true, message: '请输入网站名称', trigger: 'blur' }],
  url: [
    { required: true, message: '请输入访问地址', trigger: 'blur' },
    { pattern: /^https?:\/\/.+/, message: '请输入有效的 http/https 地址', trigger: 'blur' }
  ],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  owner: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
}

function resetForm() {
  form.name = ''
  form.url = ''
  form.category = null
  form.owner = ''
  form.description = ''
}

function openAdd() {
  editingId.value = null
  resetForm()
  showModal.value = true
}

function openEdit(site) {
  editingId.value = site.id
  form.name = site.name
  form.url = site.url
  form.category = site.category
  form.owner = site.owner
  form.description = site.description || ''
  showModal.value = true
}

function handleSubmit() {
  formRef.value?.validate(async (errors) => {
    if (errors) return
    submitting.value = true
    await new Promise(r => setTimeout(r, 300))
    if (editingId.value) {
      useUpdateSite(editingId.value, { ...form })
    } else {
      useAddSite({ ...form })
    }
    submitting.value = false
    showModal.value = false
    const { message } = createDiscreteApi(['message'])
    message.success(editingId.value ? '修改成功' : '新增成功')
  })
}

function confirmDelete(site) {
  const { dialog } = createDiscreteApi(['dialog'])
  dialog.warning({
    title: '确认删除',
    content: `确定要删除「${site.name}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: () => {
      useDeleteSite(site.id)
      const { message } = createDiscreteApi(['message'])
      message.success('删除成功')
    },
  })
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 统计卡片 */
.stat-cards {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}
.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px 24px;
  text-align: center;
  min-width: 90px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.stat-card.online .stat-num { color: #18a058; }
.stat-card.offline .stat-num { color: #d03050; }
.stat-card.unknown .stat-num { color: #999; }
.stat-num { font-size: 28px; font-weight: 700; line-height: 1.2; }
.stat-label { font-size: 12px; color: #888; margin-top: 4px; }

/* 网站卡片网格 */
.site-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.site-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
  border-left: 4px solid #e0e0e0;
  transition: box-shadow 0.2s;
}
.site-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
.status-border-online { border-left-color: #18a058; }
.status-border-offline { border-left-color: #d03050; }
.status-border-unknown { border-left-color: #ccc; }

.site-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.site-actions { margin-left: auto; display: flex; gap: 2px; }

/* 状态指示灯 */
.site-status-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.site-status-dot.online { background: #18a058; box-shadow: 0 0 6px #18a058; animation: pulse 2s infinite; }
.site-status-dot.offline { background: #d03050; }
.site-status-dot.unknown { background: #ccc; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.site-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}
.site-url {
  font-size: 12px;
  color: #2563eb;
  text-decoration: none;
  display: block;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.site-url:hover { text-decoration: underline; }
.site-desc {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 10px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.site-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #9ca3af;
}
.site-time {
  font-size: 11px;
  color: #9ca3af;
}
.site-time.muted { color: #d1d5db; }

.empty-tip {
  grid-column: 1 / -1;
  padding: 60px 0;
  display: flex;
  justify-content: center;
}
</style>
