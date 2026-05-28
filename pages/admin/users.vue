<template>
  <div class="user-manage-page">
    <h2 class="page-title">
      用户管理
      <n-button v-if="isFounder" type="primary" size="small" class="invite-btn" @click="showInviteModal = true">
        邀请管理员
      </n-button>
    </h2>

    <!-- 搜索/筛选栏 -->
    <div class="filter-bar">
      <div class="filter-row">
        <n-input v-model:value="query.username" placeholder="用户名" clearable size="small" class="filter-input" />
        <n-input v-model:value="query.email" placeholder="邮箱" clearable size="small" class="filter-input" />
        <n-select v-model:value="query.roleId" :options="roleOptions" placeholder="角色" clearable size="small" class="filter-select" />
        <n-select v-model:value="query.blocked" :options="blockedOptions" placeholder="是否拉黑" clearable size="small" class="filter-select-sm" />
        <n-select v-model:value="query.deleted" :options="deletedOptions" placeholder="是否注销" clearable size="small" class="filter-select-sm" />
        <div class="sort-group">
          <n-select v-model:value="query.orderBy" :options="orderByOptions" placeholder="排序" clearable size="small" class="filter-select" />
          <button class="sort-dir-btn" @click="toggleOrderDir" :title="query.orderDir === 'asc' ? '升序' : '降序'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path v-if="query.orderDir === 'asc'" d="M12 19V5M5 12l7-7 7 7" />
              <path v-else d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </button>
        </div>
        <n-button size="small" @click="resetQuery">重置</n-button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="table-wrap">
      <n-spin :show="loading">
        <table class="user-table" v-if="userList.length > 0">
          <thead>
            <tr>
              <th>用户名</th>
              <th>邮箱</th>
              <th>角色</th>
              <th>积分</th>
              <th>违规次数</th>
              <th>状态</th>
              <th>注册时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="user in userList" :key="user.id">
              <tr :class="{ 'row-expanded': expandedUserId === user.id }" @click="toggleUserExpand(user.id)">
              <td>
                <div class="user-cell" style="cursor:pointer;">
                  <n-avatar :size="28" :src="user.avatar || defaultAvatar" round />
                  <span class="username-link">{{ user.username }}</span>
                  <span class="expand-arrow" :class="{ open: expandedUserId === user.id }">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>
              </td>
              <td>{{ user.email || '-' }}</td>
              <td>
                <div class="role-cell">
                  <n-tag :type="roleTagType(user.roleLevel)" size="small">
                    {{ user.roleName || '未分配' }}
                  </n-tag>
                  <span
                    v-if="user.roles && user.roles.length > 1"
                    class="role-expand-btn"
                    @click.stop="toggleRoleExpand(user.id)"
                  >
                    <svg :class="{ 'rotated': expandedRoleUserId === user.id }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>
                <div v-if="expandedRoleUserId === user.id && user.roles" class="role-dropdown">
                  <n-tag
                    v-for="(r, ri) in user.roles"
                    :key="ri"
                    :type="roleTagType(r.roleLevel)"
                    size="small"
                    class="role-dropdown-item"
                  >
                    {{ r.roleName }}
                  </n-tag>
                </div>
              </td>
              <td>{{ user.points ?? 0 }}</td>
              <td>
                <span :class="{ 'text-danger': user.violationCount > 0 }">{{ user.violationCount ?? 0 }}</span>
              </td>
              <td>
                <n-tag :type="user.status === 1 ? 'error' : 'success'" size="small">
                  {{ user.status === 1 ? '已拉黑' : '正常' }}
                </n-tag>
              </td>
              <td>{{ user.createTime || '-' }}</td>
              <td class="action-cell" @click.stop>
                <n-button text type="info" size="tiny" @click="showViolations(user)">违规记录</n-button>
                <n-button text type="warning" size="tiny" @click="openViolationModal(user)">标记违规</n-button>
              </td>
            </tr>
            <!-- 展开的详情行 -->
            <tr v-if="expandedUserId === user.id" class="detail-row">
              <td :colspan="8">
                <div class="user-detail-panel">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="detail-label">邮箱</span>
                      <span class="detail-value">{{ user.email || '-' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">性别</span>
                      <span class="detail-value">{{ user.sex || '未知' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">积分</span>
                      <span class="detail-value points">{{ user.points ?? 0 }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">违规次数</span>
                      <span class="detail-value" :class="{ 'text-danger': user.violationCount > 0 }">{{ user.violationCount ?? 0 }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">邀请码</span>
                      <span class="detail-value mono">{{ user.inviteCode || '-' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">注册时间</span>
                      <span class="detail-value">{{ user.createTime || '-' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">状态</span>
                      <n-tag :type="user.status === 1 ? 'error' : 'success'" size="small">
                        {{ user.status === 1 ? '已拉黑' : '正常' }}
                      </n-tag>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">所有角色</span>
                      <div class="detail-roles">
                        <n-tag v-for="(r, ri) in (user.roles || [])" :key="ri" :type="roleTagType(r.roleLevel)" size="small" closable @close="removeRole(user, r)">{{ r.roleName }}</n-tag>
                        <span v-if="!user.roles || user.roles.length === 0">未分配</span>
                      </div>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">管理角色</span>
                      <div class="role-manage-row">
                        <n-select
                          v-model:value="addRoleId"
                          :options="assignableRoleOptions"
                          placeholder="选择角色"
                          size="small"
                          clearable
                          style="width: 160px;"
                        />
                        <n-button size="small" type="primary" :disabled="!addRoleId" @click="addRole(user)">添加</n-button>
                      </div>
                    </div>
                    <div class="detail-item full" v-if="user.introduction">
                      <span class="detail-label">个人简介</span>
                      <span class="detail-value">{{ user.introduction }}</span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
        <div v-else class="empty-state">暂无用户数据</div>
      </n-spin>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrap" v-if="total > 0">
      <n-pagination
        :page="query.pageNum"
        :page-size="query.pageSize"
        :item-count="total"
        @update:page="handlePageChange"
      />
    </div>

    <!-- 违规记录弹窗 -->
    <n-modal v-model:show="violationModalVisible" preset="card" title="违规记录" style="width: 560px;">
      <div v-if="violationList.length === 0" class="empty-state">暂无违规记录</div>
      <div v-else class="violation-list">
        <div v-for="(v, idx) in violationList" :key="idx" class="violation-item" :class="{ 'revoked': v.deleteFlag == 1 }">
          <div class="violation-header">
            <div class="violation-header-left">
              <n-tag :type="v.reason?.startsWith('[拉黑]') ? 'error' : 'warning'" size="small">
                {{ getViolationTypeName(v.violationType) }}
              </n-tag>
              <n-tag v-if="v.deleteFlag == 1" type="default" size="small" class="revoked-tag">已撤销</n-tag>
            </div>
            <span class="violation-time">{{ v.createTime }}</span>
          </div>
          <div class="violation-reason">{{ v.reason || '无' }}</div>
          <div class="violation-actions" v-if="v.deleteFlag != 1">
            <n-button text type="warning" size="tiny" @click="handleRevoke(v)">撤销</n-button>
          </div>
        </div>
      </div>
    </n-modal>

    <!-- 标记违规弹窗 -->
    <n-modal v-model:show="recordModalVisible" preset="card" title="标记违规" style="width: 420px;">
      <n-form size="small">
        <n-form-item label="违规类型">
          <n-select v-model:value="recordForm.violationType" :options="violationTypeOptions" placeholder="选择违规类型" />
        </n-form-item>
        <n-form-item label="违规原因">
          <n-input v-model:value="recordForm.reason" type="textarea" placeholder="填写违规原因" :rows="3" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-button type="primary" size="small" @click="submitViolation" :loading="recordLoading">确认</n-button>
      </template>
    </n-modal>

    <!-- 邀请管理员弹窗 -->
    <n-modal v-model:show="showInviteModal" preset="card" title="邀请管理员注册" style="width: 460px;">
      <n-form size="small" ref="inviteFormRef" :model="inviteForm" :rules="inviteRules">
        <n-form-item label="用户名" path="username">
          <n-input v-model:value="inviteForm.username" placeholder="4-20位，字母开头，字母数字下划线" />
        </n-form-item>
        <n-form-item label="邮箱" path="email">
          <n-input v-model:value="inviteForm.email" placeholder="被邀请人邮箱" />
        </n-form-item>
        <n-form-item label="角色" path="roleId">
          <n-select v-model:value="inviteForm.roleId" :options="inviteRoleOptions" placeholder="选择角色" />
        </n-form-item>
      </n-form>
      <div v-if="inviteResult" class="invite-result">
        <p>邀请链接已生成（{{ inviteResult.expireDays }}天有效）：</p>
        <code class="invite-link">{{ inviteResult.inviteLink }}</code>
        <n-button size="tiny" type="primary" @click="copyInviteLink">复制链接</n-button>
      </div>
      <template #footer>
        <n-button type="primary" size="small" @click="submitInvite" :loading="inviteLoading" :disabled="!inviteForm.username || !inviteForm.email || !inviteForm.roleId">
          发送邀请
        </n-button>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import {
  NInput, NSelect, NButton, NTag, NAvatar, NPagination, NSpin, NModal, NForm, NFormItem
} from 'naive-ui'
import { fetchConfig } from '~/composables/useHttp'
import { apiGetUserManageList, apiRecordViolation, apiGetViolationList, apiRevokeViolation, apiGetAssignableRoles, apiAddUserRole, apiRemoveUserRole } from '~/composables/Api/Admin/userManage'

const defaultAvatar = '/default-avatar.png'

// 判断是否为创始人
const isFounder = computed(() => {
  if (!process.client) return false
  try {
    const roleStr = localStorage.getItem('__user_role__')
    if (roleStr) {
      const role = JSON.parse(roleStr)
      return parseInt(role.level || '0') >= 6
    }
  } catch {}
  return false
})

const loading = ref(false)
const userList = ref([])
const total = ref(0)
const expandedRoleUserId = ref(null)
const expandedUserId = ref(null)

function toggleRoleExpand(userId) {
  expandedRoleUserId.value = expandedRoleUserId.value === userId ? null : userId
}

function toggleUserExpand(userId) {
  expandedUserId.value = expandedUserId.value === userId ? null : userId
}

const query = reactive({
  username: '',
  email: '',
  roleId: null,
  blocked: null,
  deleted: null,
  orderBy: null,
  orderDir: 'desc',
  pageNum: 1,
  pageSize: 20
})

const roleOptions = [
  { label: '普通用户', value: 1 },
  { label: '普通开发者', value: 2 },
  { label: 'VIP用户', value: 3 },
  { label: '小班用户', value: 4 },
  { label: '普通管理员', value: 5 },
  { label: '核心开发者', value: 6 },
  { label: '创始人', value: 7 },
]

const blockedOptions = [
  { label: '已拉黑', value: true },
  { label: '未拉黑', value: false },
]

const deletedOptions = [
  { label: '已注销', value: true },
  { label: '未注销', value: false },
]

const orderByOptions = [
  { label: '注册时间', value: 'createTime' },
  { label: '积分', value: 'points' },
  { label: '违规次数', value: 'violationCount' },
]

function roleTagType(level) {
  if (level >= 5) return 'error'
  if (level >= 3) return 'warning'
  return 'info'
}

function toggleOrderDir() {
  query.orderDir = query.orderDir === 'asc' ? 'desc' : 'asc'
}

// 实时搜索：监听所有查询条件变化，自动请求
let searchTimer = null
watch(
  () => [query.username, query.email, query.roleId, query.blocked, query.deleted, query.orderBy, query.orderDir],
  () => {
    // 防抖 300ms
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      query.pageNum = 1
      loadUsers()
    }, 300)
  }
)

async function loadUsers() {
  loading.value = true
  try {
    const res = await apiGetUserManageList(query)
    const data = res?.data || res || {}
    userList.value = data.rows || []
    total.value = data.total || 0
  } catch (e) {
    userList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function resetQuery() {
  query.username = ''
  query.email = ''
  query.roleId = null
  query.blocked = null
  query.deleted = null
  query.orderBy = null
  query.orderDir = 'desc'
  query.pageNum = 1
  loadUsers()
}

function handlePageChange(page) {
  query.pageNum = page
  loadUsers()
}

// ── 违规记录 ──
const violationModalVisible = ref(false)
const violationList = ref([])

const violationTypeOptions = [
  { label: '乱答', value: 1 },
  { label: '广告', value: 2 },
  { label: '恶意灌水', value: 3 },
  { label: '其他', value: 4 },
]

function getViolationTypeName(type) {
  const map = { 1: '乱答', 2: '广告', 3: '恶意灌水', 4: '其他' }
  return map[type] || '未知'
}

async function showViolations(user) {
  try {
    const res = await apiGetViolationList(user.id)
    violationList.value = res?.data || res || []
  } catch {
    violationList.value = []
  }
  violationModalVisible.value = true
}

async function handleRevoke(violation) {
  if (!confirm('确认撤销该违规记录？撤销后用户违规次数将减1')) return
  try {
    const res = await apiRevokeViolation(violation.id)
    alert(res?.msg || res?.data || '已撤销')
    // 刷新违规列表
    const refreshRes = await apiGetViolationList(violation.userId)
    violationList.value = refreshRes?.data || refreshRes || []
    loadUsers()
  } catch (e) {
    alert(e?.data?.msg || '撤销失败')
  }
}

// ── 标记违规 ──
const recordModalVisible = ref(false)
const recordLoading = ref(false)
const recordForm = reactive({ userId: null, violationType: null, reason: '' })

function openViolationModal(user) {
  recordForm.userId = user.id
  recordForm.violationType = null
  recordForm.reason = ''
  recordModalVisible.value = true
}

async function submitViolation() {
  if (!recordForm.violationType) return
  recordLoading.value = true
  try {
    const res = await apiRecordViolation(recordForm)
    const msg = res?.msg || res?.data || '操作成功'
    alert(msg)
    recordModalVisible.value = false
    loadUsers()
  } catch (e) {
    alert(e?.data?.msg || '操作失败')
  } finally {
    recordLoading.value = false
  }
}

// ── 拉黑/解除拉黑（已移除，违规达3次自动拉黑） ──

// ── 角色管理 ──
const addRoleId = ref(null)
const assignableRoleOptions = ref([])

// ── 邀请管理员 ──
const showInviteModal = ref(false)
const inviteLoading = ref(false)
const inviteResult = ref(null)
const inviteFormRef = ref(null)
const inviteForm = reactive({ username: '', email: '', roleId: null })
const inviteRoleOptions = [
  { label: '普通管理员', value: 5 },
  { label: '核心开发者', value: 6 },
]
const inviteRules = {
  username: [
    { required: true, message: '请输入用户名' },
    {
      validator: (_rule, value) => /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/.test(value),
      message: '用户名必须是4-20位字母、数字、下划线组成，且以字母开头',
      trigger: ['input', 'blur']
    }
  ],
  email: [
    { required: true, message: '请输入邮箱' },
    {
      validator: (_rule, value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
      message: '请输入有效邮箱格式',
      trigger: ['input', 'blur']
    }
  ],
  roleId: [
    { required: true, message: '请选择角色', type: 'number' }
  ]
}

async function submitInvite() {
  // 表单校验
  try {
    await inviteFormRef.value.validate()
  } catch {
    return
  }
  inviteLoading.value = true
  inviteResult.value = null
  try {
    const res = await $fetch(`${fetchConfig.baseURL}/admin/invite/create`, {
      method: 'POST',
      headers: getAuthHeadersLocal(),
      body: inviteForm
    })
    if (res?.code === 200 && res?.data) {
      inviteResult.value = res.data
      alert('邀请已发送到对方邮箱')
    } else {
      alert(res?.msg || '邀请失败')
    }
  } catch (e) {
    alert(e?.data?.msg || '邀请失败')
  } finally {
    inviteLoading.value = false
  }
}

function copyInviteLink() {
  if (!inviteResult.value?.inviteLink) return
  navigator.clipboard.writeText(inviteResult.value.inviteLink)
  alert('链接已复制')
}

function getAuthHeadersLocal() {
  const headers = { appid: 'bd9d01ecc75dbbaaefce' }
  if (process.client) {
    let token = ''
    try { token = useCookie('token').value || '' } catch {}
    if (!token) token = localStorage.getItem('token') || ''
    if (token) { headers.token = token; headers.Authorization = `Bearer ${token}` }
  }
  return headers
}

async function loadAssignableRoles() {
  try {
    const res = await apiGetAssignableRoles()
    const list = res?.data || res || []
    assignableRoleOptions.value = list.map(r => ({ label: r.roleName, value: r.roleId }))
  } catch {
    assignableRoleOptions.value = []
  }
}

async function addRole(user) {
  if (!addRoleId.value) return
  try {
    const res = await apiAddUserRole(user.id, addRoleId.value)
    alert(res?.msg || res?.data || '添加成功')
    addRoleId.value = null
    loadUsers()
  } catch (e) {
    alert(e?.data?.msg || '添加失败')
  }
}

async function removeRole(user, role) {
  if (!confirm(`确认移除 ${user.username} 的「${role.roleName}」角色？`)) return
  // 通过 roleName 找到对应的 roleId
  const matched = assignableRoleOptions.value.find(r => r.label === role.roleName)
  if (!matched) {
    alert('该角色无法操作')
    return
  }
  try {
    const res = await apiRemoveUserRole(user.id, matched.value)
    alert(res?.msg || res?.data || '已移除')
    loadUsers()
  } catch (e) {
    alert(e?.data?.msg || '移除失败')
  }
}

onMounted(() => {
  loadUsers()
  loadAssignableRoles()
})

useHead({ title: '用户管理' })
</script>

<style scoped>
.user-manage-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.invite-btn {
  font-size: 12px;
}

.invite-result {
  margin-top: 12px;
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  font-size: 13px;
}

.invite-link {
  display: block;
  word-break: break-all;
  margin: 8px 0;
  padding: 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
}

.filter-bar {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.filter-input { width: 150px; }
.filter-select { width: 140px; }
.filter-select-sm { width: 120px; }

.sort-group {
  display: flex;
  align-items: center;
  gap: 0;
}
.sort-group .filter-select {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.sort-dir-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 28px;
  border: 1px solid #e2e8f0;
  border-left: none;
  border-radius: 0 4px 4px 0;
  background: #fff;
  cursor: pointer;
  color: #475569;
  transition: all 0.15s;
}
.sort-dir-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.table-wrap {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.user-table th {
  background: #f1f5f9;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.user-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.user-table tr:hover td {
  background: #f8fafc;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username-link {
  color: #3b82f6;
  transition: color 0.15s;
}
.username-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.expand-arrow {
  display: flex;
  align-items: center;
  color: #94a3b8;
  transition: transform 0.2s;
  margin-left: 4px;
}
.expand-arrow.open {
  transform: rotate(180deg);
  color: #3b82f6;
}

.row-expanded td {
  background: #f0f7ff;
}

.detail-row td {
  padding: 0 !important;
  border-bottom: 1px solid #e2e8f0;
}

.user-detail-panel {
  padding: 16px 24px 20px;
  background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
  border-top: 1px solid #e2e8f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.detail-item.full {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
}

.detail-value {
  font-size: 13px;
  color: #334155;
}

.detail-value.points { color: #f59e0b; font-weight: 600; }
.detail-value.mono { font-family: monospace; letter-spacing: 0.05em; }

.detail-roles {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.role-manage-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.text-danger { color: #ef4444; font-weight: 600; }

.empty-state {
  padding: 60px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.action-cell {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.role-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.role-expand-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #94a3b8;
  transition: color 0.15s;
}
.role-expand-btn:hover { color: #3b82f6; }
.role-expand-btn svg { transition: transform 0.2s; }
.role-expand-btn svg.rotated { transform: rotate(180deg); }

.role-dropdown {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
  padding: 6px 8px;
  background: #f8fafc;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.role-dropdown-item {
  margin: 0;
}

.violation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
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

.revoked-tag {
  text-decoration: line-through;
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

.violation-actions {
  margin-top: 6px;
  display: flex;
  justify-content: flex-end;
}
</style>
