<template>
  <div class="user-detail-page">
    <div class="detail-header">
      <n-button text @click="goBack" class="back-btn">← 返回用户列表</n-button>
      <h2 class="page-title">用户详情</h2>
    </div>

    <n-spin :show="loading">
      <template v-if="user">
        <!-- 基本信息卡片 -->
        <div class="info-card">
          <div class="info-card-header">
            <n-avatar :size="64" :src="user.avatar || defaultAvatar" round />
            <div class="info-header-text">
              <h3 class="info-username">{{ user.username }}</h3>
              <div class="info-roles">
                <n-tag
                  v-for="(r, idx) in user.roles"
                  :key="idx"
                  :type="roleTagType(r.roleLevel)"
                  size="small"
                >{{ r.roleName }}</n-tag>
                <n-tag v-if="!user.roles || user.roles.length === 0" size="small">未分配角色</n-tag>
              </div>
            </div>
            <div class="info-status">
              <n-tag :type="user.status === 1 ? 'error' : 'success'" size="small">
                {{ user.status === 1 ? '已拉黑' : '正常' }}
              </n-tag>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">邮箱</span>
              <span class="info-value">{{ user.email || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">性别</span>
              <span class="info-value">{{ user.sex || '未知' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">积分</span>
              <span class="info-value points">{{ user.points ?? 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">违规次数</span>
              <span class="info-value" :class="{ 'text-danger': user.violationCount > 0 }">{{ user.violationCount ?? 0 }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">邀请码</span>
              <span class="info-value mono">{{ user.inviteCode || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">注册时间</span>
              <span class="info-value">{{ user.createTime || '-' }}</span>
            </div>
            <div class="info-item full" v-if="user.introduction">
              <span class="info-label">个人简介</span>
              <span class="info-value">{{ user.introduction }}</span>
            </div>
          </div>
        </div>

        <!-- 违规记录 -->
        <div class="section-card">
          <h3 class="section-title">违规记录</h3>
          <div v-if="violations.length === 0" class="empty-hint">暂无违规记录</div>
          <div v-else class="violation-list">
            <div v-for="(v, idx) in violations" :key="idx" class="violation-item" :class="{ revoked: v.deleteFlag == 1 }">
              <div class="violation-header">
                <div class="violation-header-left">
                  <n-tag :type="v.reason?.startsWith('[拉黑]') ? 'error' : 'warning'" size="small">
                    {{ getViolationTypeName(v.violationType) }}
                  </n-tag>
                  <n-tag v-if="v.deleteFlag == 1" type="default" size="small">已撤销</n-tag>
                </div>
                <span class="violation-time">{{ v.createTime }}</span>
              </div>
              <div class="violation-reason">{{ v.reason || '无' }}</div>
            </div>
          </div>
        </div>
      </template>
      <div v-else-if="!loading" class="empty-hint">用户不存在或无权查看</div>
    </n-spin>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { NAvatar, NTag, NButton, NSpin } from 'naive-ui'
import { apiGetUserDetail } from '~/composables/Api/Admin/userManage'

const route = useRoute()
const defaultAvatar = '/default-avatar.png'

const loading = ref(true)
const user = ref(null)
const violations = ref([])

function roleTagType(level) {
  if (level >= 5) return 'error'
  if (level >= 3) return 'warning'
  return 'info'
}

function getViolationTypeName(type) {
  const map = { 1: '乱答', 2: '广告', 3: '恶意灌水', 4: '其他' }
  return map[type] || '未知'
}

function goBack() {
  navigateTo('/admin/users')
}

async function loadDetail() {
  loading.value = true
  try {
    const res = await apiGetUserDetail(route.params.id)
    const data = res?.data || res || {}
    user.value = data.user || null
    violations.value = data.violations || []
  } catch {
    user.value = null
    violations.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDetail()
})

useHead({ title: '用户详情' })
</script>

<style scoped>
.user-detail-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.detail-header {
  margin-bottom: 20px;
}

.back-btn {
  color: #64748b;
  font-size: 13px;
  margin-bottom: 8px;
}
.back-btn:hover { color: #3b82f6; }

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.info-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.info-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.info-header-text {
  flex: 1;
}

.info-username {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 6px;
}

.info-roles {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.info-value {
  font-size: 14px;
  color: #334155;
}

.info-value.points { color: #f59e0b; font-weight: 600; }
.info-value.mono { font-family: monospace; letter-spacing: 0.05em; }
.text-danger { color: #ef4444; font-weight: 600; }

.section-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 16px;
}

.empty-hint {
  color: #94a3b8;
  font-size: 14px;
  text-align: center;
  padding: 24px 0;
}

.violation-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.violation-item {
  padding: 10px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.violation-item.revoked {
  opacity: 0.6;
  background: #f1f5f9;
  border-style: dashed;
}

.violation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.violation-header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.violation-time {
  font-size: 12px;
  color: #94a3b8;
}

.violation-reason {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
}
</style>
