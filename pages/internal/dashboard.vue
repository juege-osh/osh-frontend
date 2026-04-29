<template>
  <div>
    <!-- 状态总览卡片 -->
    <div class="overview-cards">
      <div class="ov-card total">
        <div class="ov-icon"><n-icon size="28"><Globe /></n-icon></div>
        <div class="ov-info">
          <div class="ov-num">{{ sites.length }}</div>
          <div class="ov-label">网站总数</div>
        </div>
      </div>
      <div class="ov-card online">
        <div class="ov-icon"><n-icon size="28"><CheckmarkCircle /></n-icon></div>
        <div class="ov-info">
          <div class="ov-num">{{ onlineCount }}</div>
          <div class="ov-label">在线</div>
        </div>
      </div>
      <div class="ov-card offline">
        <div class="ov-icon"><n-icon size="28"><CloseCircle /></n-icon></div>
        <div class="ov-info">
          <div class="ov-num">{{ offlineCount }}</div>
          <div class="ov-label">离线</div>
        </div>
      </div>
      <div class="ov-card rate">
        <div class="ov-icon"><n-icon size="28"><StatsChart /></n-icon></div>
        <div class="ov-info">
          <div class="ov-num">{{ onlineRate }}%</div>
          <div class="ov-label">在线率</div>
        </div>
      </div>
    </div>

    <!-- 分类统计 + 状态列表 -->
    <div class="dashboard-grid">
      <!-- 分类统计 -->
      <div class="dash-panel">
        <div class="panel-title">按分类统计</div>
        <div class="category-list">
          <div v-for="cat in categoryStats" :key="cat.name" class="cat-row">
            <span class="cat-name">{{ cat.name }}</span>
            <div class="cat-bar-wrap">
              <div class="cat-bar" :style="{ width: cat.percent + '%' }"></div>
            </div>
            <span class="cat-count">{{ cat.count }}</span>
          </div>
          <div v-if="categoryStats.length === 0" class="empty-text">暂无数据</div>
        </div>
      </div>

      <!-- 最近检查状态 -->
      <div class="dash-panel">
        <div class="panel-title">
          网站状态列表
          <n-button size="tiny" secondary @click="checkAll" :loading="checking" style="margin-left:auto">
            <template #icon><n-icon><Refresh /></n-icon></template>
            立即检查
          </n-button>
        </div>
        <div class="status-list">
          <div v-for="site in sites" :key="site.id" class="status-row">
            <div class="status-dot" :class="site.status"></div>
            <div class="status-info">
              <div class="status-name">{{ site.name }}</div>
              <div class="status-url">{{ site.url }}</div>
            </div>
            <n-tag :type="tagType(site.status)" size="small" round>
              {{ statusLabel(site.status) }}
            </n-tag>
          </div>
          <div v-if="sites.length === 0" class="empty-text">暂无数据</div>
        </div>
      </div>
    </div>

    <!-- 定时任务状态 -->
    <div class="dash-panel timer-panel">
      <div class="panel-title">
        <n-icon size="16" style="margin-right:6px"><Timer /></n-icon>
        定时检查任务
      </div>
      <div class="timer-info">
        <div class="timer-item">
          <span class="timer-label">任务状态</span>
          <n-tag type="success" size="small" round>运行中</n-tag>
        </div>
        <div class="timer-item">
          <span class="timer-label">检查间隔</span>
          <span class="timer-val">每 60 秒</span>
        </div>
        <div class="timer-item">
          <span class="timer-label">上次检查</span>
          <span class="timer-val">{{ lastCheckTime || '尚未检查' }}</span>
        </div>
        <div class="timer-item">
          <span class="timer-label">下次检查</span>
          <span class="timer-val">{{ nextCheckCountdown }} 秒后</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NIcon, NTag, NButton, createDiscreteApi } from 'naive-ui'
import {
  Globe, CheckmarkCircle, CloseCircle, StatsChart, Refresh, Timer
} from '@vicons/ionicons5'

definePageMeta({ layout: 'internal' })

const sites = useInternalSites()

const onlineCount = computed(() => sites.value.filter(s => s.status === 'online').length)
const offlineCount = computed(() => sites.value.filter(s => s.status === 'offline').length)
const onlineRate = computed(() => {
  const checked = sites.value.filter(s => s.status !== 'unknown')
  if (checked.length === 0) return 0
  return Math.round((onlineCount.value / checked.length) * 100)
})

const categoryStats = computed(() => {
  const map = {}
  sites.value.forEach(s => {
    const c = s.category || '未分类'
    map[c] = (map[c] || 0) + 1
  })
  const max = Math.max(...Object.values(map), 1)
  return Object.entries(map).map(([name, count]) => ({
    name, count, percent: Math.round((count / max) * 100)
  })).sort((a, b) => b.count - a.count)
})

const statusLabel = (s) => ({ online: '在线', offline: '离线', unknown: '未知' }[s] || '未知')
const tagType = (s) => ({ online: 'success', offline: 'error', unknown: 'default' }[s] || 'default')

const lastCheckTime = computed(() => {
  const times = sites.value.map(s => s.lastChecked).filter(Boolean)
  return times.length > 0 ? times[times.length - 1] : null
})

// 倒计时
const nextCheckCountdown = ref(60)
const checking = ref(false)

async function checkAll() {
  checking.value = true
  await Promise.all(sites.value.map(async s => {
    const status = await checkSiteStatus(s)
    useUpdateSiteStatus(s.id, status)
  }))
  checking.value = false
  nextCheckCountdown.value = 60
  const { message } = createDiscreteApi(['message'])
  message.success('检查完成')
}

let countdownTimer = null
onMounted(() => {
  countdownTimer = setInterval(() => {
    nextCheckCountdown.value--
    if (nextCheckCountdown.value <= 0) {
      nextCheckCountdown.value = 60
    }
  }, 1000)
})
onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>

<style scoped>
.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.ov-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.ov-icon {
  width: 52px; height: 52px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.ov-card.total .ov-icon { background: #e8f4fd; color: #2563eb; }
.ov-card.online .ov-icon { background: #e8f8f0; color: #18a058; }
.ov-card.offline .ov-icon { background: #fde8ec; color: #d03050; }
.ov-card.rate .ov-icon { background: #fef3e2; color: #f0a020; }
.ov-num { font-size: 28px; font-weight: 700; color: #1f2937; }
.ov-label { font-size: 13px; color: #6b7280; margin-top: 2px; }

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.dash-panel {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

/* 分类统计 */
.category-list { display: flex; flex-direction: column; gap: 12px; }
.cat-row { display: flex; align-items: center; gap: 10px; }
.cat-name { width: 80px; font-size: 13px; color: #374151; flex-shrink: 0; }
.cat-bar-wrap { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.cat-bar { height: 100%; background: linear-gradient(90deg, #165d69, #26a67a); border-radius: 4px; transition: width 0.5s; }
.cat-count { width: 24px; text-align: right; font-size: 13px; color: #6b7280; }

/* 状态列表 */
.status-list { display: flex; flex-direction: column; gap: 10px; max-height: 320px; overflow-y: auto; }
.status-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 8px; background: #f9fafb; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.status-dot.online { background: #18a058; }
.status-dot.offline { background: #d03050; }
.status-dot.unknown { background: #ccc; }
.status-info { flex: 1; min-width: 0; }
.status-name { font-size: 13px; font-weight: 500; color: #1f2937; }
.status-url { font-size: 11px; color: #9ca3af; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* 定时任务 */
.timer-panel { }
.timer-info { display: flex; gap: 32px; flex-wrap: wrap; }
.timer-item { display: flex; align-items: center; gap: 10px; }
.timer-label { font-size: 13px; color: #6b7280; }
.timer-val { font-size: 13px; color: #1f2937; font-weight: 500; }

.empty-text { color: #ccc; font-size: 13px; text-align: center; padding: 20px 0; }
</style>
