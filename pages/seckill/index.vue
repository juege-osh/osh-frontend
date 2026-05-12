<template>
  <div class="seckill-page">
    <!-- Banner 区 -->
    <div class="seckill-banner">
      <!-- 背景装饰 -->
      <div class="banner-bg-left"></div>
      <div class="banner-bg-right"></div>
      <div class="banner-wave"></div>

      <div class="banner-inner">
        <!-- 左侧：文字区 -->
        <div class="banner-left">
          <div class="banner-tag-row">
            <span class="live-dot"></span>
            <span class="live-text">活动进行中</span>
          </div>
          <h1 class="banner-title">
            <span class="title-fire">🔥</span>
            <span class="title-main">限时秒杀</span>
          </h1>
          <h2 class="banner-sub">IT精品课 · 低至1折</h2>
          <p class="banner-desc">精选编程、设计、AI课程，限量特价，抢完即止</p>
          <div class="banner-feature-list">
            <span class="feature-item">✦ 正版授权</span>
            <span class="feature-item">✦ 永久有效</span>
            <span class="feature-item">✦ 讲师答疑</span>
          </div>
        </div>

        <!-- 中间：倒计时 -->
        <div class="banner-center">
          <div class="countdown-card">
            <div class="countdown-title">
              <span class="countdown-fire">⏰</span>
              距活动结束
            </div>
            <div class="countdown-body" v-if="activeSession">
              <CountDown :time="correctedEndTime" class="countdown-widget" @end="handleSessionEnd" />
            </div>
            <div class="countdown-body" v-else>
              <span class="countdown-over">已结束</span>
            </div>
            <div class="countdown-hint">每天 10:00 / 14:00 / 20:00 开抢</div>
          </div>
        </div>

        <!-- 右侧：统计数据 -->
        <div class="banner-right">
          <div class="stat-card" v-for="s in stats" :key="s.label">
            <span class="stat-icon">{{ s.icon }}</span>
            <span class="stat-num">{{ s.num }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="seckill-body">
      <!-- 操作栏：搜索 + 新增 -->
      <div class="action-bar">
        <div class="search-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="searchKeyword"
            class="search-input"
            placeholder="搜索秒杀商品名称..."
            @keyup.enter="loadGoods"
          />
          <button class="search-btn" @click="loadGoods">搜索</button>
        </div>
        <!-- 管理操作按钮：新增 + 编辑 + 下架 + 删除 四个放一起，仅管理员可见 -->
        <div class="manage-btns" v-if="isAdmin">
          <button class="manage-btn add-mode-btn" @click="openAddModal">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            新增商品
          </button>
          <button class="manage-btn edit-mode-btn" :class="{ active: selectMode === 'edit' }" @click="enterSelectMode('edit')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            编辑
          </button>
          <button class="manage-btn offline-mode-btn" :class="{ active: selectMode === 'offline' }" @click="enterSelectMode('offline')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
            下架
          </button>
          <button class="manage-btn delete-mode-btn" :class="{ active: selectMode === 'delete' }" @click="enterSelectMode('delete')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            删除
          </button>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">类型：</span>
          <button
            v-for="t in typeOptions"
            :key="t.value"
            class="filter-btn"
            :class="{ active: filterType === t.value }"
            @click="filterType = t.value; loadGoods()"
          >{{ t.label }}</button>
        </div>
        <div class="filter-group">
          <span class="filter-label">分类：</span>
          <button
            v-for="c in categoryOptions"
            :key="c.value"
            class="filter-btn"
            :class="{ active: filterCategory === c.value }"
            @click="filterCategory = c.value; loadGoods()"
          >{{ c.label }}</button>
        </div>
      </div>

      <!-- 选择模式提示栏 -->
      <div class="batch-bar" v-if="selectMode">
        <span class="batch-info">
          <span class="mode-tag" :class="selectMode">
            {{ selectMode === 'edit' ? '编辑模式' : selectMode === 'offline' ? '下架模式' : '删除模式' }}
          </span>
          已选 <b>{{ selectedIds.length }}</b> 个商品
          <span v-if="selectMode === 'edit'" class="batch-hint">（编辑仅支持单选）</span>
        </span>
        <div class="batch-actions">
          <button class="batch-confirm-btn" :class="selectMode" @click="confirmBatchAction" :disabled="selectedIds.length === 0">
            确认{{ selectMode === 'edit' ? '编辑' : selectMode === 'offline' ? '下架' : '删除' }}
          </button>
          <button class="batch-cancel-btn" @click="exitSelectMode">取消</button>
        </div>
      </div>

      <!-- 商品列表 -->
      <div v-if="pending" class="goods-grid">
        <LoadingCourseSkeleton v-for="i in 8" :key="i" />
      </div>
      <div v-else-if="goodsList.length === 0" class="empty-tip">
        <Empty />
      </div>
      <div v-else class="goods-grid">
        <SeckillGoodsCard
          v-for="item in goodsList"
          :key="item.id"
          :item="item"
          :session="activeSession || {}"
          :selected="selectedIds.includes(item.id)"
          :selectable="!!selectMode"
          @click="goDetail(item)"
          @buy="handleBuy(item)"
          @toggle="toggleSelect"
        />
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <SeckillEditModal
      v-model:show="showModal"
      :init-data="editingItem"
      @success="loadGoods"
    />
  </div>
</template>

<script setup>
useHead({ title: '限时秒杀 · IT精品课' })

const { hasPermission } = usePermission()

// 是否有管理权限（超管 或 拥有秒杀管理权限）
const isAdmin = computed(() =>
  hasPermission('*') ||
  hasPermission('*:*:*') ||
  hasPermission('seckill:goods:add') ||
  hasPermission('seckill:goods:edit') ||
  hasPermission('seckill:goods:delete')
)

const stats = [
  { icon: '📚', num: '1000+', label: '精品课程' },
  { icon: '👨‍🎓', num: '50万+', label: '学员选择' },
  { icon: '⭐', num: '98%', label: '好评率' },
  { icon: '💰', num: '低至1折', label: '超值优惠' },
]

// ── Mock 数据（后端接口就绪后删除此块，改用真实 API） ────────
const USE_MOCK = true

const now = Date.now()
const MOCK_ACTIVITY = {
  id: 1,
  title: '安全生产知识大促',
  banner: '',
  start_time: new Date(now - 2 * 3600 * 1000).toISOString(),
  end_time: new Date(now + 4 * 3600 * 1000).toISOString(),
  sessions: [
    {
      id: 1,
      name: '10:00 场',
      start_time: new Date(now - 4 * 3600 * 1000).toISOString(),
      end_time: new Date(now - 2 * 3600 * 1000).toISOString(),
      status: 'ended',
    },
    {
      id: 2,
      name: '14:00 场',
      start_time: new Date(now - 1 * 3600 * 1000).toISOString(),
      end_time: new Date(now + 4 * 3600 * 1000).toISOString(),
      status: 'active',
    },
    {
      id: 3,
      name: '20:00 场',
      start_time: new Date(now + 5 * 3600 * 1000).toISOString(),
      end_time: new Date(now + 7 * 3600 * 1000).toISOString(),
      status: 'pending',
    },
  ],
}

const MOCK_GOODS = [
  {
    id: 101, goods_id: 1, goods_type: 'course', session_id: 2,
    title: '安全生产法律法规精讲（2024最新版）',
    cover: 'https://picsum.photos/seed/course1/400/225',
    seckill_price: 99, original_price: 599,
    quota: 50, sold_count: 40,
    teacher_name: '李建国', teacher_avatar: '', rating: 4.9,
    student_count: 1286, good_rate: 98,
    lesson_count: 12, valid_days: 365,
    is_purchased: false, limit_per_user: 1,
  },
  {
    id: 102, goods_id: 2, goods_type: 'course', session_id: 2,
    title: '危险化学品安全管理实务',
    cover: 'https://picsum.photos/seed/course2/400/225',
    seckill_price: 49, original_price: 299,
    quota: 100, sold_count: 30,
    teacher_name: '王志远', teacher_avatar: '', rating: 4.7,
    student_count: 856, good_rate: 95,
    lesson_count: 8, valid_days: 0,
    is_purchased: false, limit_per_user: 1,
  },
  {
    id: 103, goods_id: 3, goods_type: 'course', session_id: 2,
    title: '消防安全管理员备考全攻略',
    cover: 'https://picsum.photos/seed/course3/400/225',
    seckill_price: 79, original_price: 399,
    quota: 80, sold_count: 80,   // 名额已满
    teacher_name: '张晓燕', teacher_avatar: '', rating: 4.8,
    student_count: 2341, good_rate: 97,
    lesson_count: 20, valid_days: 180,
    is_purchased: false, limit_per_user: 1,
  },
  {
    id: 104, goods_id: 4, goods_type: 'book', session_id: 2,
    title: '安全生产技术基础（第三版）',
    cover: 'https://picsum.photos/seed/book1/300/400',
    seckill_price: 29, original_price: 128,
    quota: 200, sold_count: 60,
    author: '陈安之', format: 'PDF',
    page_count: 386, good_rate: 92,
    student_count: 0, rating: 0,
    is_purchased: false, limit_per_user: 0,
  },
  {
    id: 105, goods_id: 5, goods_type: 'exam', session_id: 2,
    title: '注册安全工程师历年真题题库',
    cover: 'https://picsum.photos/seed/exam1/400/225',
    seckill_price: 19, original_price: 99,
    quota: 0, sold_count: 0,   // 不限量
    teacher_name: '刘明', teacher_avatar: '', rating: 4.6,
    student_count: 5678, good_rate: 94,
    question_count: 2000, pass_rate: 78,
    is_purchased: true,   // 已购买示例
    limit_per_user: 1,
  },
  {
    id: 106, goods_id: 6, goods_type: 'course', session_id: 2,
    title: '应急管理与事故调查处理',
    cover: 'https://picsum.photos/seed/course4/400/225',
    seckill_price: 59, original_price: 259,
    quota: 60, sold_count: 15,
    teacher_name: '赵磊', teacher_avatar: '', rating: 4.5,
    student_count: 432, good_rate: 91,
    lesson_count: 16, valid_days: 365,
    is_purchased: false, limit_per_user: 1,
  },
]
// ── Mock 数据结束 ─────────────────────────────────────────────

// ── 服务端时间校准 ──────────────────────────────────────────
const timeDiff = ref(0)
if (!USE_MOCK) {
  try {
    const { data: st } = await useSeckillServerTimeApi()
    if (st.value?.timestamp) timeDiff.value = st.value.timestamp - Date.now()
  } catch {}
}

// ── 活动 & 场次 ─────────────────────────────────────────────
const activityData = ref(USE_MOCK ? MOCK_ACTIVITY : null)

if (!USE_MOCK) {
  const { data, refresh } = await useSeckillActivityApi()
  await refresh()
  activityData.value = data.value
}

const sessions = computed(() => activityData.value?.sessions || [])

const currentSessionId = ref(null)
watchEffect(() => {
  if (!sessions.value.length) return
  const active = sessions.value.find(s => s.status === 'active')
  currentSessionId.value = active?.id ?? sessions.value[0]?.id
})

const activeSession = computed(() =>
  sessions.value.find(s => s.id === currentSessionId.value) || null
)

const correctedEndTime = computed(() => {
  if (!activeSession.value?.end_time) return 0
  return new Date(activeSession.value.end_time).getTime() - timeDiff.value
})

function handleSessionEnd() {
  if (!USE_MOCK) activityData.value = null
}

function onSessionChange() {
  loadGoods()
}

// ── 筛选 ────────────────────────────────────────────────────
const typeOptions = [
  { label: '全部', value: '' },
  { label: '课程', value: 'course' },
  { label: '电子书', value: 'book' },
  { label: '题库', value: 'exam' },
]
const categoryOptions = [
  { label: '全部', value: '' },
  { label: '安全生产', value: 'safety' },
  { label: '消防安全', value: 'fire' },
  { label: '应急管理', value: 'emergency' },
]
const filterType = ref('')
const filterCategory = ref('')
const searchKeyword = ref('')

// ── 商品列表 ─────────────────────────────────────────────────
const goodsList = ref([])
const pending = ref(false)

async function loadGoods() {
  if (!currentSessionId.value) return
  pending.value = true

  if (USE_MOCK) {
    // 模拟筛选
    await new Promise(r => setTimeout(r, 300))
    let list = MOCK_GOODS.filter(g => g.session_id === currentSessionId.value)
    if (filterType.value) list = list.filter(g => g.goods_type === filterType.value)
    if (searchKeyword.value) list = list.filter(g => g.title.includes(searchKeyword.value))
    goodsList.value = list
  } else {
    const query = { sessionId: currentSessionId.value }
    if (filterType.value) query.type = filterType.value
    if (filterCategory.value) query.category = filterCategory.value
    if (searchKeyword.value) query.keyword = searchKeyword.value
    const { data, refresh } = await useSeckillGoodsListApi(query)
    await refresh()
    goodsList.value = data.value || []
  }

  pending.value = false
}

watch(currentSessionId, (val) => {
  if (val) loadGoods()
}, { immediate: true })

// ── 勾选 & 选择模式 ──────────────────────────────────────────
const selectedIds = ref([])
const selectMode = ref('') // '' | 'edit' | 'offline' | 'delete'

function enterSelectMode(mode) {
  selectMode.value = mode
  selectedIds.value = []
}

function exitSelectMode() {
  selectMode.value = ''
  selectedIds.value = []
}

function toggleSelect(id) {
  // 编辑模式只允许单选
  if (selectMode.value === 'edit') {
    selectedIds.value = selectedIds.value[0] === id ? [] : [id]
    return
  }
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
}

function confirmBatchAction() {
  if (selectMode.value === 'edit') handleBatchEdit()
  else if (selectMode.value === 'offline') handleBatchOffline()
  else if (selectMode.value === 'delete') handleBatchDelete()
}

// ── 增删改 ───────────────────────────────────────────────────
const showModal = ref(false)
const editingItem = ref(null)

function openAddModal() {
  editingItem.value = null
  showModal.value = true
}

function openEditModal(item) {
  editingItem.value = { ...item }
  showModal.value = true
}

function handleDelete(item) {
  if (!confirm(`确认删除「${item.title}」？`)) return
  useSeckillGoodsDeleteApi(item.id).then(() => {
    loadGoods()
  }).catch(() => {})
}

function handleOffline(item) {
  if (!confirm(`确认下架「${item.title}」？下架后用户将无法看到此商品。`)) return
  useSeckillGoodsUpdateApi({ ...item, status: 0 }).then(() => {
    loadGoods()
  }).catch(() => {})
}

// ── 批量操作 ──────────────────────────────────────────────────
function handleBatchEdit() {
  if (selectedIds.value.length !== 1) return
  const item = goodsList.value.find(g => g.id === selectedIds.value[0])
  if (item) { openEditModal(item); exitSelectMode() }
}

function handleBatchOffline() {
  if (!confirm(`确认下架选中的 ${selectedIds.value.length} 个商品？`)) return
  Promise.all(
    selectedIds.value.map(id => {
      const item = goodsList.value.find(g => g.id === id)
      return item ? useSeckillGoodsUpdateApi({ ...item, status: 0 }) : Promise.resolve()
    })
  ).then(() => { exitSelectMode(); loadGoods() })
}

function handleBatchDelete() {
  if (!confirm(`确认删除选中的 ${selectedIds.value.length} 个商品？此操作不可恢复。`)) return
  Promise.all(selectedIds.value.map(id => useSeckillGoodsDeleteApi(id)))
    .then(() => { exitSelectMode(); loadGoods() })
}

// ── 操作 ─────────────────────────────────────────────────────
function goDetail(item) {
  navigateTo(`/seckill/detail/${item.id}`)
}

function handleBuy(item) {
  if (item.is_purchased) {
    navigateTo(`/course/lesson/${item.goods_id}`)
    return
  }
  if (item.quota > 0 && item.sold_count >= item.quota) {
    navigateTo(`/createorder?id=${item.goods_id}&type=${item.goods_type}`)
    return
  }
  navigateTo(`/seckill/detail/${item.id}`)
}
</script>

<style scoped>
/* ── 全局色彩变量（京东秒杀风格） ──────────────────────────── */
/* 主色：#e1251b 京东红  辅色：#ff4747  金色：#f5a623  背景：#f4f4f4 */

/* ── Banner ─────────────────────────────────────────────── */
.seckill-banner {
  position: relative;
  background: #e1251b;
  overflow: hidden;
  min-height: 180px;
}

.banner-bg-left {
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, #b71c1c 0%, #e1251b 40%, #ff4747 80%, #ff6b35 100%);
}

/* 右侧光晕 */
.banner-bg-right {
  position: absolute;
  top: -60px; right: -60px;
  width: 360px; height: 360px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%);
}

/* 底部金色分割线 */
.banner-wave {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #f5a623, #fff, #f5a623, transparent);
}

.banner-inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 32px;
  gap: 20px;
}

/* 左侧文字 */
.banner-left { flex: 1; min-width: 0; }

.banner-tag-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}
.live-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(255,255,255,0.3);
  animation: pulse-white 1.5s ease-in-out infinite;
}
@keyframes pulse-white {
  0%, 100% { box-shadow: 0 0 0 3px rgba(255,255,255,0.3); }
  50% { box-shadow: 0 0 0 6px rgba(255,255,255,0.1); }
}
.live-text {
  font-size: 11px;
  color: rgba(255,255,255,0.9);
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.banner-title {
  font-size: 44px;
  font-weight: 900;
  color: #fff;
  margin: 0 0 4px;
  line-height: 1.1;
  display: flex;
  align-items: center;
  gap: 10px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.title-fire { font-size: 38px; }
.title-main { color: #fff; letter-spacing: -1px; }

.banner-sub {
  font-size: 18px;
  font-weight: 700;
  color: #fde68a;
  margin: 0 0 10px;
  letter-spacing: 0.5px;
}

.banner-desc {
  font-size: 13px;
  color: rgba(255,255,255,0.75);
  margin: 0 0 14px;
}

.banner-feature-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.feature-item {
  font-size: 12px;
  color: rgba(255,255,255,0.85);
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  padding: 3px 10px;
  border-radius: 20px;
}

/* 中间倒计时 */
.banner-center { flex-shrink: 0; }
.countdown-card {
  background: rgba(0,0,0,0.25);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 12px;
  padding: 18px 24px;
  text-align: center;
  min-width: 210px;
}
.countdown-title {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  letter-spacing: 1px;
}
.countdown-fire { font-size: 14px; }
.countdown-body { margin-bottom: 8px; }
.countdown-over { font-size: 16px; color: rgba(255,255,255,0.5); }
.countdown-hint {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
}
/* 京东风格倒计时：黑底白字方块 */
.countdown-widget :deep(.count-down) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: rgba(255,255,255,0.7);
  font-size: 12px;
}
.countdown-widget :deep(.count-down small) {
  background: #1a1a1a;
  color: #fff;
  border-radius: 4px;
  padding: 5px 8px;
  font-size: 24px;
  font-weight: 900;
  min-width: 38px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

/* 右侧统计 */
.banner-right {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  flex-shrink: 0;
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(0,0,0,0.2);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  padding: 12px 16px;
  min-width: 96px;
  transition: background 0.2s;
}
.stat-card:hover { background: rgba(0,0,0,0.3); }
.stat-icon { font-size: 18px; margin-bottom: 3px; }
.stat-num {
  font-size: 15px;
  font-weight: 800;
  color: #fde68a;
  line-height: 1.2;
}
.stat-label {
  font-size: 11px;
  color: rgba(255,255,255,0.6);
  margin-top: 2px;
}

@media (max-width: 900px) { .banner-right { display: none; } }
@media (max-width: 640px) {
  .banner-center { display: none; }
  .banner-title { font-size: 30px; }
}

/* ── Body ────────────────────────────────────────────────── */
.seckill-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 16px 32px;
  background: #f4f4f4;
}

/* ── 操作栏 ──────────────────────────────────────────────── */
.action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.search-wrap {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 400px;
  background: #f7f7f7;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  padding: 0 14px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-wrap:focus-within {
  border-color: #e1251b;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(225,37,27,0.08);
}
.search-icon { color: #aaa; flex-shrink: 0; margin-right: 8px; }
.search-input {
  flex: 1;
  padding: 8px 0;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
  color: #222;
}
.search-input::placeholder { color: #bbb; }
.search-btn {
  padding: 6px 18px;
  background: #e1251b;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 8px;
  flex-shrink: 0;
  transition: background 0.15s;
}
.search-btn:hover { background: #c0392b; }
.add-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 20px;
  background: #e1251b;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, transform 0.15s;
  box-shadow: 0 2px 8px rgba(225,37,27,0.25);
}
.add-btn:hover { background: #c0392b; transform: translateY(-1px); }

/* ── 场次 Tab 区域背景 ───────────────────────────────────── */
:deep(.session-tabs) {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
:deep(.session-tab) {
  border-radius: 6px;
  background: #f7f7f7;
  border: 1.5px solid #e5e7eb;
}
:deep(.session-tab.active) {
  background: #fff1f0;
  border-color: #e1251b;
}
:deep(.status-active .session-badge) { background: #e1251b; }

/* ── 筛选栏 ──────────────────────────────────────────────── */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.filter-label {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
}
.filter-btn {
  padding: 4px 14px;
  border-radius: 14px;
  border: 1.5px solid #e5e7eb;
  background: #f7f7f7;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
}
.filter-btn:hover { border-color: #e1251b; color: #e1251b; }
.filter-btn.active {
  background: #e1251b;
  border-color: #e1251b;
  color: #fff;
  font-weight: 600;
}

/* ── 批量操作栏 ──────────────────────────────────────────── */
.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border-left: 4px solid #e1251b;
}
.batch-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555;
}
.batch-info b { color: #e1251b; font-size: 15px; }
.batch-hint { font-size: 12px; color: #aaa; }
.mode-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  color: #fff;
}
.mode-tag.edit    { background: #6366f1; }
.mode-tag.offline { background: #f59e0b; }
.mode-tag.delete  { background: #ef4444; }

.batch-actions { display: flex; gap: 8px; }
.batch-confirm-btn {
  padding: 6px 18px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: #fff;
  transition: opacity 0.15s;
}
.batch-confirm-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.batch-confirm-btn.edit    { background: #6366f1; }
.batch-confirm-btn.edit:hover:not(:disabled) { background: #4f46e5; }
.batch-confirm-btn.offline { background: #f59e0b; }
.batch-confirm-btn.offline:hover:not(:disabled) { background: #d97706; }
.batch-confirm-btn.delete  { background: #ef4444; }
.batch-confirm-btn.delete:hover:not(:disabled)  { background: #dc2626; }
.batch-cancel-btn {
  padding: 6px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background: #f5f5f5;
  font-size: 13px;
  color: #666;
  cursor: pointer;
}
.batch-cancel-btn:hover { background: #eee; }

/* 管理按钮组 */
.manage-btns {
  display: flex;
  gap: 6px;
  margin-left: 8px;
}
.manage-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1.5px solid;
  transition: all 0.15s;
  background: #fff;
}
.manage-btn.add-mode-btn {
  border-color: #e1251b;
  color: #e1251b;
  background: #fff;
}
.manage-btn.add-mode-btn:hover { background: #e1251b; color: #fff; }
.manage-btn.edit-mode-btn   { border-color: #6366f1; color: #6366f1; }
.manage-btn.offline-mode-btn { border-color: #f59e0b; color: #f59e0b; }
.manage-btn.delete-mode-btn  { border-color: #ef4444; color: #ef4444; }
.manage-btn.edit-mode-btn.active   { background: #6366f1; color: #fff; }
.manage-btn.offline-mode-btn.active { background: #f59e0b; color: #fff; }
.manage-btn.delete-mode-btn.active  { background: #ef4444; color: #fff; }
.manage-btn:hover { opacity: 0.85; }

/* ── 商品网格 ────────────────────────────────────────────── */
.goods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}

.empty-tip {
  padding: 60px 0;
  text-align: center;
  background: #fff;
  border-radius: 8px;
}
</style>
