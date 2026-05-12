<template>
  <div class="detail-page" v-if="goods">
    <div class="detail-layout">
      <!-- 左侧：内容预览区 -->
      <div class="detail-left">
        <!-- 封面 -->
        <div class="cover-wrap" :class="goods.goods_type === 'book' ? 'cover-book' : 'cover-course'">
          <img :src="goods.cover || '/default-cover.jpg'" :alt="goods.title" class="cover-img" />
          <!-- 试看按钮 -->
          <button class="preview-btn" @click="handlePreview">
            ▶ {{ goods.goods_type === 'book' ? '免费试读' : '免费试看' }}
          </button>
        </div>

        <!-- 课程大纲（网课） -->
        <div class="outline-section" v-if="goods.goods_type === 'course' && outline.length">
          <h3 class="section-title">课程大纲</h3>
          <CourseOutline :chapters="outline" />
        </div>
      </div>

      <!-- 右侧：购买决策区 -->
      <div class="detail-right">
        <h1 class="goods-title">{{ goods.title }}</h1>

        <!-- 讲师信息（网课） -->
        <div class="teacher-row" v-if="goods.goods_type !== 'book'">
          <img :src="goods.teacher_avatar || '/default-avatar.jpg'" class="teacher-avatar" />
          <span class="teacher-name">{{ goods.teacher_name }}</span>
          <span class="teacher-rating">⭐ {{ goods.rating || 0 }} 分</span>
          <span class="teacher-students">{{ goods.student_count || 0 }}人已学</span>
        </div>
        <!-- 作者信息（电子书） -->
        <div class="teacher-row" v-else>
          <span class="teacher-name">✍️ {{ goods.author }}</span>
          <span class="teacher-rating">{{ goods.format }}</span>
          <span class="teacher-students">{{ goods.page_count }}页</span>
        </div>

        <!-- 价格卡片 -->
        <div class="price-card">
          <div class="price-main-row">
            <span class="price-seckill">🔥 秒杀价 ¥{{ goods.seckill_price }}</span>
          </div>
          <div class="price-sub-row">
            <span class="price-original">原价 ¥{{ goods.original_price }}</span>
            <span class="price-saved">已优惠 ¥{{ (goods.original_price - goods.seckill_price).toFixed(2) }}</span>
          </div>

          <div class="price-divider" />

          <!-- 倒计时 -->
          <div class="countdown-row" v-if="activeSession">
            <span class="countdown-label">距结束：</span>
            <CountDown :time="correctedEndTime" @end="handleEnd" />
          </div>

          <!-- 名额 -->
          <div class="quota-row" v-if="goods.quota > 0">
            <span class="quota-label">剩余名额：</span>
            <span class="quota-value">{{ remaining }} / {{ goods.quota }}</span>
          </div>
          <SeckillQuotaBar :quota="goods.quota" :sold-count="goods.sold_count" />

          <!-- 限购说明 -->
          <div class="limit-row" v-if="goods.limit_per_user > 0">
            限购：每人限购 {{ goods.limit_per_user }} 份
          </div>

          <div class="price-divider" />

          <!-- 服务承诺 -->
          <div class="promise-list">
            <span class="promise-item">✅ 购买后永久有效</span>
            <span class="promise-item">✅ 含配套资料下载</span>
            <span class="promise-item">✅ 讲师在线答疑</span>
          </div>

          <div class="price-divider" />

          <!-- 操作按钮 -->
          <button
            class="buy-btn"
            :class="btnClass"
            :disabled="btnState === 'pending'"
            @click="handleBuy"
          >
            {{ btnText }}
          </button>
          <button class="cart-btn" @click="handleCart" v-if="btnState === 'active'">
            加入购物车
          </button>
        </div>
      </div>
    </div>

    <!-- 下方 Tab 区 -->
    <div class="detail-tabs-wrap">
      <div class="detail-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >{{ tab.label }}</button>
      </div>

      <div class="tab-content">
        <!-- 课程介绍 -->
        <div v-if="activeTab === 'intro'" class="tab-intro" v-html="goods.description" />

        <!-- 课程大纲 -->
        <div v-else-if="activeTab === 'outline'">
          <CourseOutline :chapters="outline" v-if="outline.length" />
          <Empty v-else />
        </div>

        <!-- 讲师介绍 -->
        <div v-else-if="activeTab === 'teacher'" class="tab-teacher">
          <div class="teacher-profile">
            <img :src="goods.teacher_avatar || '/default-avatar.jpg'" class="teacher-avatar-lg" />
            <div>
              <h3>{{ goods.teacher_name }}</h3>
              <p class="teacher-bio">{{ goods.teacher_bio || '暂无讲师介绍' }}</p>
            </div>
          </div>
        </div>

        <!-- 用户评价 -->
        <div v-else-if="activeTab === 'review'" class="tab-review">
          <div class="review-summary">
            <span class="review-rate">好评率 {{ goods.good_rate || 0 }}%</span>
          </div>
          <Empty />
        </div>
      </div>
    </div>
  </div>

  <!-- 加载中 -->
  <div v-else class="loading-wrap">
    <LoadingCourseSkeleton />
  </div>
</template>

<script setup>
import { createDiscreteApi } from 'naive-ui'

const route = useRoute()
const id = Number(route.params.id)

// ── Mock 数据（后端就绪后删除） ──────────────────────────────
const USE_MOCK = true
const now = Date.now()

const MOCK_GOODS_MAP = {
  101: {
    id: 101, goods_id: 1, goods_type: 'course', session_id: 2,
    title: '安全生产法律法规精讲（2024最新版）',
    cover: 'https://picsum.photos/seed/course1/800/450',
    seckill_price: 99, original_price: 599,
    quota: 50, sold_count: 40,
    teacher_name: '李建国', teacher_avatar: '', rating: 4.9,
    student_count: 1286, good_rate: 98,
    lesson_count: 12, valid_days: 365,
    is_purchased: false, limit_per_user: 1,
    description: '<p>本课程系统讲解安全生产法律法规体系，涵盖《安全生产法》《职业病防治法》等核心法规，结合真实案例深度解析，帮助学员快速掌握考试重点。</p><p>适合注册安全工程师备考、企业安全管理人员培训。</p>',
    teacher_bio: '李建国，高级注册安全工程师，从事安全生产培训15年，主编多本安全生产教材，培训学员超过10万人次。',
  },
  102: {
    id: 102, goods_id: 2, goods_type: 'course', session_id: 2,
    title: '危险化学品安全管理实务',
    cover: 'https://picsum.photos/seed/course2/800/450',
    seckill_price: 49, original_price: 299,
    quota: 100, sold_count: 30,
    teacher_name: '王志远', teacher_avatar: '', rating: 4.7,
    student_count: 856, good_rate: 95,
    lesson_count: 8, valid_days: 0,
    is_purchased: false, limit_per_user: 1,
    description: '<p>深入讲解危险化学品的分类、储存、运输及应急处置，结合典型事故案例分析，提升企业安全管理水平。</p>',
    teacher_bio: '王志远，化工安全专家，曾任职于中石化安全环保部，具有丰富的危化品安全管理实战经验。',
  },
  103: {
    id: 103, goods_id: 3, goods_type: 'course', session_id: 2,
    title: '消防安全管理员备考全攻略',
    cover: 'https://picsum.photos/seed/course3/800/450',
    seckill_price: 79, original_price: 399,
    quota: 80, sold_count: 80,
    teacher_name: '张晓燕', teacher_avatar: '', rating: 4.8,
    student_count: 2341, good_rate: 97,
    lesson_count: 20, valid_days: 180,
    is_purchased: false, limit_per_user: 1,
    description: '<p>针对消防安全管理员资格考试，系统梳理考点，提供历年真题解析，通过率高达92%。</p>',
    teacher_bio: '张晓燕，消防工程师，从事消防培训10年，擅长考点精讲与应试技巧。',
  },
  104: {
    id: 104, goods_id: 4, goods_type: 'book', session_id: 2,
    title: '安全生产技术基础（第三版）',
    cover: 'https://picsum.photos/seed/book1/600/800',
    seckill_price: 29, original_price: 128,
    quota: 200, sold_count: 60,
    author: '陈安之', format: 'PDF', page_count: 386,
    good_rate: 92, student_count: 0, rating: 0,
    is_purchased: false, limit_per_user: 0,
    description: '<p>本书系统介绍安全生产技术基础知识，包括机械安全、电气安全、防火防爆等核心内容，是注安考试必备参考书。</p>',
    teacher_bio: '',
  },
  105: {
    id: 105, goods_id: 5, goods_type: 'exam', session_id: 2,
    title: '注册安全工程师历年真题题库',
    cover: 'https://picsum.photos/seed/exam1/800/450',
    seckill_price: 19, original_price: 99,
    quota: 0, sold_count: 0,
    teacher_name: '刘明', teacher_avatar: '', rating: 4.6,
    student_count: 5678, good_rate: 94,
    question_count: 2000, pass_rate: 78,
    is_purchased: true, limit_per_user: 1,
    description: '<p>收录近10年注册安全工程师考试真题，含详细解析，智能组卷，模拟考试，帮助考生高效备考。</p>',
    teacher_bio: '刘明，注册安全工程师，多年命题研究经验，题库命中率业内领先。',
  },
  106: {
    id: 106, goods_id: 6, goods_type: 'course', session_id: 2,
    title: '应急管理与事故调查处理',
    cover: 'https://picsum.photos/seed/course4/800/450',
    seckill_price: 59, original_price: 259,
    quota: 60, sold_count: 15,
    teacher_name: '赵磊', teacher_avatar: '', rating: 4.5,
    student_count: 432, good_rate: 91,
    lesson_count: 16, valid_days: 365,
    is_purchased: false, limit_per_user: 1,
    description: '<p>系统讲解应急预案编制、事故调查程序及报告撰写，结合真实事故案例，提升应急处置能力。</p>',
    teacher_bio: '赵磊，应急管理专家，参与多起重大事故调查，具有丰富的实战经验。',
  },
}

const MOCK_OUTLINE = [
  {
    title: '第一章：法律法规体系概述',
    sections: [
      { id: 1, title: '安全生产法的立法背景', is_free: true },
      { id: 2, title: '安全生产法的主要内容', is_free: true },
      { id: 3, title: '相关配套法规介绍', is_free: false },
    ],
  },
  {
    title: '第二章：生产经营单位的安全生产责任',
    sections: [
      { id: 4, title: '主要负责人的职责', is_free: false },
      { id: 5, title: '安全生产管理机构设置', is_free: false },
      { id: 6, title: '安全生产投入保障', is_free: false },
    ],
  },
  {
    title: '第三章：从业人员的权利与义务',
    sections: [
      { id: 7, title: '从业人员的八项权利', is_free: false },
      { id: 8, title: '从业人员的义务', is_free: false },
    ],
  },
]

const MOCK_SESSION = {
  id: 2, name: '14:00 场',
  start_time: new Date(now - 1 * 3600 * 1000).toISOString(),
  end_time: new Date(now + 4 * 3600 * 1000).toISOString(),
  status: 'active',
}
// ── Mock 数据结束 ─────────────────────────────────────────────

// ── 服务端时间校准 ──────────────────────────────────────────
const timeDiff = ref(0)
if (!USE_MOCK) {
  try {
    const { data: st } = await useSeckillServerTimeApi()
    if (st.value?.timestamp) timeDiff.value = st.value.timestamp - Date.now()
  } catch {}
}

// ── 商品详情 ─────────────────────────────────────────────────
const goodsData = ref(USE_MOCK ? (MOCK_GOODS_MAP[id] || null) : null)

if (!USE_MOCK) {
  const { data, refresh } = await useSeckillGoodsDetailApi(id)
  await refresh()
  goodsData.value = data.value
}

const goods = computed(() => goodsData.value || null)

// ── 活动场次（用于倒计时） ───────────────────────────────────
const activeSession = ref(USE_MOCK ? MOCK_SESSION : null)

if (!USE_MOCK) {
  const { data: activityData } = await useSeckillActivityApi()
  const sessions = activityData.value?.sessions || []
  activeSession.value = sessions.find(s => s.id === goods.value?.session_id) || null
}

const correctedEndTime = computed(() => {
  if (!activeSession.value?.end_time) return 0
  return new Date(activeSession.value.end_time).getTime() - timeDiff.value
})

function handleEnd() {
  refresh()
}

// ── 课程大纲 ─────────────────────────────────────────────────
const outline = ref([])
if (USE_MOCK) {
  if (goods.value?.goods_type === 'course') outline.value = MOCK_OUTLINE
} else if (goods.value?.goods_type === 'course' && goods.value?.goods_id) {
  const { data: outlineData, refresh: refreshOutline } = await useCourseOutlineApi(goods.value.goods_id)
  await refreshOutline()
  outline.value = outlineData.value || []
}

// ── 按钮状态 ─────────────────────────────────────────────────
const btnState = computed(() => {
  if (!goods.value) return 'pending'
  if (goods.value.is_purchased) return 'purchased'
  if (activeSession.value?.status === 'pending') return 'pending'
  if (activeSession.value?.status === 'ended') return 'soldout'
  if (goods.value.quota > 0 && goods.value.sold_count >= goods.value.quota) return 'soldout'
  return 'active'
})

const btnText = computed(() => {
  switch (btnState.value) {
    case 'purchased': return '去学习'
    case 'pending':   return '即将开始'
    case 'soldout':   return `¥${goods.value?.original_price} 原价购买`
    case 'active':    return '立即抢购'
    default:          return '立即抢购'
  }
})

const btnClass = computed(() => ({
  'btn-active':    btnState.value === 'active',
  'btn-pending':   btnState.value === 'pending',
  'btn-soldout':   btnState.value === 'soldout',
  'btn-purchased': btnState.value === 'purchased',
}))

const remaining = computed(() => {
  if (!goods.value) return 0
  return Math.max(0, goods.value.quota - goods.value.sold_count)
})

// ── 操作 ─────────────────────────────────────────────────────
const loading = ref(false)

async function handleBuy() {
  if (btnState.value === 'purchased') {
    navigateTo(`/course/lesson/${goods.value.goods_id}`)
    return
  }
  if (btnState.value === 'soldout') {
    navigateTo(`/createorder?id=${goods.value.goods_id}&type=${goods.value.goods_type}`)
    return
  }

  // 检查登录
  const token = useCookie('token')
  if (!token.value) {
    navigateTo(`/login?redirect=/seckill/detail/${id}`)
    return
  }

  loading.value = true
  const { data: orderData, error } = await useCreateOrderApi({
    goods_id: goods.value.id,
    session_id: goods.value.session_id,
    type: 'flashsale',
  }, 'flashsale')
  loading.value = false

  if (error.value) return

  navigateTo(`/pay?no=${orderData.value.no}&from=seckill&title=${encodeURIComponent(goods.value.title)}&price=${goods.value.seckill_price}`)
}

function handleCart() {
  const { message } = createDiscreteApi(['message'])
  message.info('购物车功能即将上线')
}

function handlePreview() {
  if (goods.value?.goods_type === 'course') {
    navigateTo(`/course/lesson/${goods.value.goods_id}`)
  } else if (goods.value?.goods_type === 'book') {
    navigateTo(`/book/${goods.value.goods_id}/1`)
  }
}

// ── Tab ──────────────────────────────────────────────────────
const tabs = [
  { key: 'intro',   label: '课程介绍' },
  { key: 'outline', label: '课程大纲' },
  { key: 'teacher', label: '讲师介绍' },
  { key: 'review',  label: '用户评价' },
]
const activeTab = ref('intro')
</script>

<style scoped>
.detail-page {
  max-width: 1100px;
  margin: 24px auto;
  padding: 0 16px;
}

/* 两栏布局 */
.detail-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}
.detail-left  { flex: 1; min-width: 0; }
.detail-right { width: 360px; flex-shrink: 0; }

/* 封面 */
.cover-wrap {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  background: #f0f0f0;
  margin-bottom: 20px;
}
.cover-course { height: 220px; }
.cover-book   { height: 300px; }
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.preview-btn {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.6);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 8px 24px;
  font-size: 14px;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: all 0.2s;
}
.preview-btn:hover { background: rgba(244,63,94,0.85); }

/* 大纲 */
.outline-section { margin-top: 8px; }
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin: 0 0 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f43f5e;
}

/* 右侧 */
.goods-title {
  font-size: 20px;
  font-weight: 700;
  color: #111;
  margin: 0 0 12px;
  line-height: 1.4;
}
.teacher-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #6b7280;
}
.teacher-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}
.teacher-name { font-weight: 600; color: #374151; }
.teacher-rating { color: #f59e0b; }

/* 价格卡片 */
.price-card {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.price-main-row { margin-bottom: 6px; }
.price-seckill {
  font-size: 24px;
  font-weight: 800;
  color: #f43f5e;
}
.price-sub-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}
.price-original {
  font-size: 13px;
  color: #9ca3af;
  text-decoration: line-through;
}
.price-saved {
  font-size: 12px;
  color: #f59e0b;
  background: #fffbeb;
  padding: 1px 6px;
  border-radius: 4px;
}
.price-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 12px 0;
}
.countdown-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
}
.countdown-label { color: #6b7280; }
.quota-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  margin-bottom: 4px;
}
.quota-label { color: #6b7280; }
.quota-value { font-weight: 600; color: #f43f5e; }
.limit-row {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 6px;
}
.promise-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.promise-item { font-size: 13px; color: #374151; }

/* 按钮 */
.buy-btn {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 10px;
  transition: all 0.2s;
}
.btn-active {
  background: linear-gradient(135deg, #ff6b35, #f43f5e);
  color: #fff;
}
.btn-active:hover { opacity: 0.9; }
.btn-pending {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}
.btn-soldout {
  background: #f9fafb;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}
.btn-purchased {
  background: #ecfdf5;
  color: #059669;
}
.cart-btn {
  width: 100%;
  padding: 10px 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}
.cart-btn:hover { border-color: #f43f5e; color: #f43f5e; }

/* 下方 Tab */
.detail-tabs-wrap {
  margin-top: 32px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}
.detail-tabs {
  display: flex;
  border-bottom: 1px solid #f0f0f0;
}
.tab-btn {
  padding: 14px 24px;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.tab-btn:hover { color: #f43f5e; }
.tab-btn.active {
  color: #f43f5e;
  border-bottom-color: #f43f5e;
  font-weight: 600;
}
.tab-content { padding: 20px; }
.tab-intro { line-height: 1.8; color: #374151; }
.teacher-profile {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.teacher-avatar-lg {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.teacher-bio { font-size: 14px; color: #6b7280; margin-top: 6px; line-height: 1.6; }
.review-summary { margin-bottom: 16px; }
.review-rate { font-size: 16px; font-weight: 600; color: #f59e0b; }

.loading-wrap { padding: 40px; }
</style>
