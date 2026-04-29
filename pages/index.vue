<template>
  <div class="home-page">

    <!-- 公告栏 -->
    <section class="notice-section">
      <div class="notice-bar">
        <div class="notice-label">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1l1.8 3.6L14 5.6l-3 2.9.7 4.1L8 10.5l-3.7 2.1.7-4.1-3-2.9 4.2-.6z" stroke="white" stroke-width="1.3" stroke-linejoin="round" fill="rgba(255,255,255,0.2)"/>
          </svg>
          <span>公告</span>
        </div>
        <div class="notice-scroll-wrap">
          <div
            class="notice-scroll-track"
            :style="{ animationPlayState: noticePaused ? 'paused' : 'running' }"
            @mouseenter="noticePaused = true"
            @mouseleave="noticePaused = false"
          >
            <span class="notice-item" v-for="(n, i) in [...notices, ...notices]" :key="i">
              <span class="notice-dot" :style="{ background: n.color }"></span>
              {{ n.text }}
              <span class="notice-sep">｜</span>
            </span>
          </div>
        </div>
        <nuxt-link class="notice-more" to="/bbs/1/1">
          更多
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </nuxt-link>
      </div>
    </section>

    <!-- Hero Banner -->
    <section class="hero-section" @mouseenter="pauseCarousel" @mouseleave="resumeCarousel">

      <!-- 轮播内容 -->
      <div class="hero-content">
        <!-- 左箭头 -->
        <button class="carousel-arrow carousel-arrow-left" @click="prevSlide">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M11 5l-4 4 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- 卡片 -->
        <transition name="carousel-fade" mode="out-in">
          <div
            class="carousel-card"
            :key="carouselIndex"
            :style="{ background: carouselItems[carouselIndex].cardBg }"
          >
            <!-- 左侧主内容 -->
            <div class="carousel-card-left">
              <div class="carousel-card-icon" :style="{ background: carouselItems[carouselIndex].iconBg }">
                <span class="carousel-emoji">{{ carouselItems[carouselIndex].emoji }}</span>
              </div>
              <h3 class="carousel-card-title">{{ carouselItems[carouselIndex].title }}</h3>
              <p class="carousel-card-sub">{{ carouselItems[carouselIndex].subtitle }}</p>
              <button class="carousel-card-btn" @click="navigateTo(carouselItems[carouselIndex].path)">
                {{ carouselItems[carouselIndex].btnText }}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4 7h6M7 4l3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <!-- 右侧工具介绍（可选） -->
            <div class="carousel-card-right" v-if="carouselItems[carouselIndex].tools">
              <div class="carousel-tools-label">{{ carouselItems[carouselIndex].toolsLabel }}</div>
              <div class="carousel-tools-grid">
                <div
                  class="carousel-tool-item"
                  v-for="(tool, ti) in carouselItems[carouselIndex].tools"
                  :key="ti"
                >
                  <span class="carousel-tool-icon">{{ tool.icon }}</span>
                  <span class="carousel-tool-name">{{ tool.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <!-- 右箭头 -->
        <button class="carousel-arrow carousel-arrow-right" @click="nextSlide">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M7 5l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <!-- 指示点（悬浮在卡片底部） -->
        <div class="hero-footer">
          <div class="carousel-dots">
            <button
              v-for="(_, i) in carouselItems"
              :key="i"
              class="carousel-dot"
              :class="{ active: i === carouselIndex }"
              @click="goToSlide(i)"
            />
          </div>
        </div>
      </div>

    </section>



    <!-- 热门课程 -->
    <section class="content-section">
      <div class="section-container">
        <div class="section-header">
          <div class="section-title-group">
            <div class="section-tag">HOT</div>
            <h2 class="section-title">热门课程</h2>
            <p class="section-subtitle">精选高质量课程，助你快速提升技能</p>
          </div>
          <button class="btn-more" @click="navigateTo('/course/1')">
            查看全部
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="course-grid">
          <div
            v-for="(course, index) in mockCourses"
            :key="index"
            class="course-card"
            @click="navigateTo(`/detail/course/${course.id}`)"
          >
            <div class="course-cover" :style="{ background: course.bg }">
              <!-- 封面背景装饰 -->
              <div class="cover-deco-circle cover-deco-1"></div>
              <div class="cover-deco-circle cover-deco-2"></div>
              <!-- 技术标识 -->
              <div class="cover-tech-label">{{ course.tech }}</div>
              <!-- 课程标题 -->
              <div class="cover-title-block">
                <div class="cover-main-title">{{ course.coverTitle }}</div>
                <div class="cover-sub-title">{{ course.coverSub }}</div>
              </div>
              <!-- 热度火焰 -->
              <div class="cover-heat">🔥 {{ course.heatText }}</div>
              <div v-if="course.badge" class="course-badge" :class="course.badgeType">{{ course.badge }}</div>
            </div>
            <div class="course-body">
              <div class="course-tags">
                <span class="course-tag" v-for="tag in course.tags" :key="tag">{{ tag }}</span>
              </div>
              <h3 class="course-title">{{ course.title }}</h3>
              <div class="course-meta">
                <span class="course-students">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="4" r="2" stroke="currentColor" stroke-width="1.2"/>
                    <path d="M2 11c0-2 2-3.5 5-3.5s5 1.5 5 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
                  </svg>
                  {{ course.students }}人学习
                </span>
                <span class="course-level" :class="course.levelClass">{{ course.level }}</span>
              </div>
              <div class="course-footer">
                <div class="course-price">
                  <span class="price-current" v-if="course.price > 0">¥{{ course.price }}</span>
                  <span class="price-free" v-else>免费</span>
                  <span class="price-origin" v-if="course.originPrice">¥{{ course.originPrice }}</span>
                </div>
                <div class="course-rating">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="#f59e0b">
                    <path d="M6.5 1l1.5 3.5H12l-3 2 1 3.5-3-2-3 2 1-3.5-3-2h4L6.5 1z"/>
                  </svg>
                  <span>{{ course.rating }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能亮点 -->
    <section class="features-section">
      <div class="section-container">
        <div class="features-header">
          <h2 class="section-title">为什么选择我们</h2>
          <p class="section-subtitle">专注于提供最优质的在线学习体验</p>
        </div>
        <div class="features-grid">
          <div class="feature-card" v-for="(feat, i) in features" :key="i">
            <div class="feat-icon" :style="{ background: feat.bg }">
              <component :is="feat.icon" />
            </div>
            <h3 class="feat-title">{{ feat.title }}</h3>
            <p class="feat-desc">{{ feat.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 活动专区 -->
    <section class="promo-section">
      <div class="section-container">
        <div class="section-header" style="margin-bottom:28px">
          <div class="section-title-group">
            <div class="section-tag" style="background:linear-gradient(135deg,#ef4444,#f97316)">活动</div>
            <h2 class="section-title">活动专区</h2>
            <p class="section-subtitle">限时优惠，错过不再有</p>
          </div>
        </div>
        <div class="promo-expand-grid">

          <!-- 秒杀专区 -->
          <div class="promo-expand-card promo-flashsale">
            <div class="pec-header">
              <div class="pec-header-left">
                <span class="pec-badge">⚡ 限时特惠</span>
                <h3 class="pec-title">秒杀专区</h3>
                <p class="pec-sub">每日精选，低至1折</p>
              </div>
              <button class="pec-more-btn" @click="navigateTo('/list/flashsale/1')">查看全部 →</button>
            </div>
            <div class="pec-list">
              <div
                v-for="(item, i) in flashsaleItems"
                :key="i"
                class="pec-item"
                @click="navigateTo(`/detail/course/${item.id}`)"
              >
                <div class="pec-rank" :class="i < 3 ? 'rank-top' : ''">{{ i + 1 }}</div>
                <div class="pec-cover" :style="{ background: item.bg }">{{ item.emoji }}</div>
                <div class="pec-info">
                  <div class="pec-name">{{ item.title }}</div>
                  <div class="pec-meta">
                    <span class="pec-students">{{ item.students }}人学习</span>
                    <span class="pec-heat">🔥 {{ item.heat }}</span>
                  </div>
                </div>
                <div class="pec-price-col">
                  <span class="pec-sale-price">¥{{ item.salePrice }}</span>
                  <span class="pec-origin-price">¥{{ item.originPrice }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 拼团专区 -->
          <div class="promo-expand-card promo-group">
            <div class="pec-header">
              <div class="pec-header-left">
                <span class="pec-badge">👥 拼团优惠</span>
                <h3 class="pec-title">拼团专区</h3>
                <p class="pec-sub">邀友同学，价格更低</p>
              </div>
              <button class="pec-more-btn" @click="navigateTo('/list/group/1')">查看全部 →</button>
            </div>
            <div class="pec-list">
              <div
                v-for="(item, i) in groupItems"
                :key="i"
                class="pec-item"
                @click="navigateTo(`/detail/course/${item.id}`)"
              >
                <div class="pec-rank" :class="i < 3 ? 'rank-top' : ''">{{ i + 1 }}</div>
                <div class="pec-cover" :style="{ background: item.bg }">{{ item.emoji }}</div>
                <div class="pec-info">
                  <div class="pec-name">{{ item.title }}</div>
                  <div class="pec-meta">
                    <span class="pec-students">{{ item.groupCount }}人已拼</span>
                    <span class="pec-heat">🔥 {{ item.heat }}</span>
                  </div>
                </div>
                <div class="pec-price-col">
                  <span class="pec-sale-price">¥{{ item.groupPrice }}</span>
                  <span class="pec-origin-price">¥{{ item.originPrice }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 在线考试 -->
          <div class="promo-expand-card promo-exam">
            <div class="pec-header">
              <div class="pec-header-left">
                <span class="pec-badge">📝 备考利器</span>
                <h3 class="pec-title">热门题库</h3>
                <p class="pec-sub">海量真题，模拟实战</p>
              </div>
              <button class="pec-more-btn" @click="navigateTo('/paper/1')">查看全部 →</button>
            </div>
            <div class="pec-list">
              <div
                v-for="(item, i) in examItems"
                :key="i"
                class="pec-item"
                @click="navigateTo('/paper/1')"
              >
                <div class="pec-rank" :class="i < 3 ? 'rank-top' : ''">{{ i + 1 }}</div>
                <div class="pec-cover pec-cover-exam" :style="{ background: item.bg }">{{ item.emoji }}</div>
                <div class="pec-info">
                  <div class="pec-name">{{ item.title }}</div>
                  <div class="pec-meta">
                    <span class="pec-students">{{ item.count }}道题</span>
                    <span class="pec-heat">🔥 {{ item.heat }}</span>
                  </div>
                </div>
                <div class="pec-price-col">
                  <span class="pec-pass-rate">通过率 {{ item.passRate }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- 课程套餐对比 -->
    <section class="pricing-section">
      <div class="section-container">
        <div class="features-header">
          <h2 class="section-title" style="color:#1e1b4b">选择适合你的套餐</h2>
          <p class="section-subtitle">不同档次满足不同学习需求，随时升级，终身受益</p>
        </div>

        <div class="pricing-layout">

          <!-- 左三列：免费 / 付费 / VIP -->
          <div class="pricing-left">
            <div class="pricing-top-row">

              <!-- 免费 & 付费 -->
              <div class="pricing-card2" v-for="(plan, i) in basicPlans" :key="i">
                <div class="p2-header">
                  <div class="p2-icon" :style="{ background: plan.bg }">{{ plan.emoji }}</div>
                  <h3 class="p2-name">{{ plan.name }}</h3>
                  <p class="p2-tagline">{{ plan.tagline }}</p>
                </div>
                <div class="p2-price">
                  <span v-if="plan.price === 0" class="p2-price-free">免费</span>
                  <template v-else>
                    <span class="p2-price-num">¥18</span>
                    <span class="p2-price-range-sep"> ~ </span>
                    <span class="p2-price-num">¥99</span>
                    <span class="p2-price-unit"> / 门</span>
                  </template>
                </div>
                <ul class="p2-features">
                  <li v-for="(feat, j) in plan.features" :key="j" class="p2-feat" :class="{ 'p2-feat-no': !feat.included }">
                    <span class="p2-feat-icon" :class="feat.included ? 'p2-check' : 'p2-cross'">
                      {{ feat.included ? '✓' : '✗' }}
                    </span>
                    {{ feat.text }}
                  </li>
                </ul>
                <button class="p2-btn" :style="{ color: plan.btnColor, borderColor: plan.btnColor }" @click="navigateTo(plan.action)">
                  {{ plan.btnText }}
                </button>
              </div>

              <!-- VIP -->
              <div class="pricing-card2">
                <div class="p2-header">
                  <div class="p2-icon" style="background: linear-gradient(135deg, #a855f7, #7c3aed)">👑</div>
                  <h3 class="p2-name">VIP 会员</h3>
                  <p class="p2-tagline">全站畅学，尊享特权</p>
                </div>
                <div class="p2-price">
                  <span class="p2-price-num">¥188</span>
                  <span class="p2-price-unit">/ 年</span>
                </div>
                <ul class="p2-features">
                  <li v-for="(feat, j) in vipFeatures" :key="j" class="p2-feat">
                    <span class="p2-feat-icon p2-check">✓</span>{{ feat }}
                  </li>
                </ul>
                <button class="p2-btn p2-btn-vip" @click="navigateTo('/course/1')">立即开通 VIP</button>
              </div>

            </div>
          </div>

          <!-- 右侧：小班专属 -->
          <div class="pricing-class-card">
            <!-- 金色奖章装饰 -->
            <div class="class-medal">🏅</div>
            <div class="class-top-tag">⭐ 强烈推荐</div>
            <h3 class="class-title">觉哥就业小班</h3>
            <p class="class-sub">就业培训 · 面试指导 · 专人专属规划</p>
            <div class="class-price-row">
              <span class="class-price-main">¥2199</span>
              <span class="class-price-unit">起 / 永久</span>
            </div>
            <div class="class-highlights">
              <div class="class-hl" v-for="(h, i) in classHighlights" :key="i">
                <span class="class-hl-icon">{{ h.icon }}</span>
                <div>
                  <div class="class-hl-title">{{ h.title }}</div>
                  <div class="class-hl-desc">{{ h.desc }}</div>
                </div>
              </div>
            </div>
            <ul class="class-feat-list">
              <li v-for="(f, i) in classFeatures" :key="i">
                <span class="p2-feat-icon p2-check" style="background:#a78bfa22;color:#a78bfa">✓</span>{{ f }}
              </li>
            </ul>
            <button class="class-cta-btn" @click="navigateTo('/course/1')">
              立即报名小班 →
            </button>
            
          </div>

        </div>
      </div>
    </section>

    <!-- 广告位 -->
    <section class="ad-section">
      <div class="section-container">
        <div class="ad-wrapper" :class="{ 'ad-expanded': adExpanded }">
          <!-- 收起状态：标题栏 -->
          <div class="ad-bar" @click="adExpanded = !adExpanded">
            <div class="ad-bar-left">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="6" width="28" height="20" rx="3" stroke="currentColor" stroke-width="1.8"/>
                <path d="M10 22l4-8 3 5 2-3 3 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="11" cy="13" r="1.5" fill="currentColor"/>
              </svg>
              <span class="ad-bar-text">广告位招租</span>
              <span class="ad-bar-badge">Banner · 970×250</span>
            </div>
            <div class="ad-bar-toggle">
              <span class="ad-toggle-label">{{ adExpanded ? '收起' : '展开' }}</span>
              <svg class="ad-toggle-icon" :class="{ 'rotated': adExpanded }" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <!-- 展开内容区 -->
          <div class="ad-content" v-show="adExpanded">
            <div class="ad-content-inner">
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="6" width="28" height="20" rx="3" stroke="#cbd5e1" stroke-width="1.8"/>
                <path d="M10 22l4-8 3 5 2-3 3 6" stroke="#cbd5e1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="11" cy="13" r="1.5" fill="#cbd5e1"/>
              </svg>
              <p class="ad-content-tip">此处为预留广告位，尺寸 970×250</p>
              <p class="ad-content-sub">可投放 Banner 图片、视频或自定义 HTML 内容</p>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup>
import { h, ref, computed, onMounted, onUnmounted } from 'vue'

useHead({
  title: '开源助手',
  meta: [
    { name: 'description', content: '汇聚优质课程、电子书、考试题库与答疑社区，助你高效成长' },
    { name: 'keywords', content: '在线课程,电子书,考试,答疑,学习平台' },
  ],
})

// ===== 功能轮播数据 =====
const carouselItems = [
  {
    emoji: '📝',
    iconBg: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    cardBg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
    title: '题库考试系统',
    subtitle: '在线刷题、模拟考试、错题复盘，提升学习效率',
    btnText: '进入考试',
    path: '/paper/1',
  },
  {
    emoji: '💬',
    iconBg: 'linear-gradient(135deg, #10b981, #059669)',
    cardBg: 'linear-gradient(135deg, #0c4a6e 0%, #075985 50%, #0369a1 100%)',
    title: '学习答疑社区',
    subtitle: '遇到问题随时提问，老师与同学共同解答',
    btnText: '去提问',
    path: '/question_answer/1',
  },
  {
    emoji: '⚡',
    iconBg: 'linear-gradient(135deg, #ef4444, #f97316)',
    cardBg: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 50%, #7c3aed 100%)',
    title: '限时秒杀课程',
    subtitle: '热门课程限时低价，错过恢复原价',
    btnText: '立即抢购',
    path: '/list/flashsale/1',
  },
  {
    emoji: '👥',
    iconBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    cardBg: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #2563eb 100%)',
    title: '拼团优惠学习',
    subtitle: '邀请好友一起学，享受更低价格',
    btnText: '发起拼团',
    path: '/list/group/1',
  },
  {
    emoji: '🚀',
    iconBg: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    cardBg: 'linear-gradient(135deg, #3b0764 0%, #7e22ce 50%, #a21caf 100%)',
    title: '精选开源项目',
    subtitle: '真实项目案例，边学边练，提升实战能力',
    btnText: '查看项目',
    path: '/openproject/list',
  },
  {
    emoji: '🌐',
    iconBg: 'linear-gradient(135deg, #14b8a6, #06b6d4)',
    cardBg: 'linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #0891b2 100%)',
    title: '实用网站导航',
    subtitle: '程序员常用工具站点，一站式收藏',
    btnText: '立即查看',
    path: '/usefull/list',
  },
  {
    emoji: '🔧',
    iconBg: 'linear-gradient(135deg, #f97316, #f59e0b)',
    cardBg: 'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)',
    title: '开发效率工具',
    subtitle: '常用在线工具集合，提升开发与学习效率',
    btnText: '使用工具',
    path: '/tool',
    toolsLabel: '网站内部工具类',
    tools: [
      { icon: '📄', name: 'PDF 转 Word / Excel' },
      { icon: '🎬', name: '在线视频总结' },
      { icon: '🤖', name: 'AI 简历生成' },
      { icon: '🖼️', name: '图片压缩转换' },
      { icon: '📝', name: '在线 Markdown' },
      { icon: '🔗', name: '短链接生成' },
    ],
  },
  {
    emoji: '📡',
    iconBg: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    cardBg: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
    title: '技术信息差',
    subtitle: '精选行业资源、趋势机会与学习路线',
    btnText: '查看内容',
    path: '/info_gap/1',
  },
  {
    emoji: '🎯',
    iconBg: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    cardBg: 'linear-gradient(135deg, #2e1065 0%, #6b21a8 50%, #9333ea 100%)',
    title: '学习套餐选择',
    subtitle: '付费课、VIP会员、小班专属，按需选择',
    btnText: '选择套餐',
    path: '/course/1',
  },
  {
    emoji: '🔐',
    iconBg: 'linear-gradient(135deg, #64748b, #475569)',
    cardBg: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%)',
    title: '内部学习入口',
    subtitle: '会员专属资源与内部课程统一入口',
    btnText: '进入内部站',
    path: '/site',
  },
]

const carouselIndex = ref(0)
let carouselTimer = null

// 全球一线城市美景图片（Unsplash）
const cityImages = [
  'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=800&q=80', // 东京
  'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80', // 巴黎
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80', // 纽约
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80', // 伦敦
  'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=80', // 悉尼
  'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80', // 迪拜
  'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80', // 新加坡
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80', // 上海
  'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80', // 香港
  'https://images.unsplash.com/photo-1543832923-44667a44c804?w=800&q=80', // 首尔
]

const cityNames = [
  '🗼 东京', '🗼 巴黎', '🗽 纽约', '🎡 伦敦',
  '🦘 悉尼', '🏙️ 迪拜', '🦁 新加坡', '🏮 上海',
  '🌃 香港', '🌸 首尔',
]

const cardBgList = [
  'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',  // 淡紫
  'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',  // 淡绿
  'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',  // 淡黄
  'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',  // 淡蓝
  'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',  // 淡粉
  'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',  // 天蓝
  'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',  // 浅绿
  'linear-gradient(135deg, #fdf4ff 0%, #f5d0fe 100%)',  // 淡紫粉
  'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',  // 淡橙
  'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',  // 浅灰
]

function getCardBg(index) {
  return cardBgList[index % cardBgList.length]
}

function startCarousel() {
  carouselTimer = setInterval(() => {
    carouselIndex.value = (carouselIndex.value + 1) % carouselItems.length
  }, 4000)
}

function pauseCarousel() {
  clearInterval(carouselTimer)
}

function resumeCarousel() {
  startCarousel()
}

function nextSlide() {
  carouselIndex.value = (carouselIndex.value + 1) % carouselItems.length
}

function prevSlide() {
  carouselIndex.value = (carouselIndex.value - 1 + carouselItems.length) % carouselItems.length
}

function goToSlide(i) {
  carouselIndex.value = i
}

onMounted(() => {
  startCarousel()
})

onUnmounted(() => {
  clearInterval(carouselTimer)
})

// ===== 封面颜色 =====
const coverColors = [
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
]

// SVG icon helpers
const IconCourse = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('rect', { x: '3', y: '4', width: '16', height: '14', rx: '2', stroke: 'white', 'stroke-width': '1.5' }),
  h('path', { d: 'M7 9h8M7 13h5', stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
])
const IconBook = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('path', { d: 'M4 3h14a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z', stroke: 'white', 'stroke-width': '1.5' }),
  h('path', { d: 'M11 3v16', stroke: 'white', 'stroke-width': '1.5' }),
])
const IconExam = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('rect', { x: '5', y: '2', width: '12', height: '18', rx: '2', stroke: 'white', 'stroke-width': '1.5' }),
  h('path', { d: 'M8 8h6M8 12h6M8 16h3', stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
])
const IconQA = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('circle', { cx: '11', cy: '11', r: '8', stroke: 'white', 'stroke-width': '1.5' }),
  h('path', { d: 'M11 7v4M11 15h.01', stroke: 'white', 'stroke-width': '2', 'stroke-linecap': 'round' }),
])
const IconProject = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('path', { d: 'M4 10l7-6 7 6', stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  h('path', { d: 'M11 4v14M6 14h10', stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
])
const IconTool = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('path', { d: 'M17 8l-5 5-5-5', stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  h('circle', { cx: '11', cy: '11', r: '8', stroke: 'white', 'stroke-width': '1.5' }),
])
const IconInfo = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('path', { d: 'M3 6h16M3 11h10M3 16h7', stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
  h('circle', { cx: '17', cy: '15', r: '3', stroke: 'white', 'stroke-width': '1.5' }),
  h('path', { d: 'M19.5 17.5l2 2', stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
])
const IconWebsite = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('rect', { x: '3', y: '4', width: '16', height: '14', rx: '2', stroke: 'white', 'stroke-width': '1.5' }),
  h('path', { d: 'M3 8h16', stroke: 'white', 'stroke-width': '1.5' }),
  h('circle', { cx: '6.5', cy: '6', r: '1', fill: 'white' }),
  h('circle', { cx: '9.5', cy: '6', r: '1', fill: 'white' }),
])
const IconInternal = () => h('svg', { width: 22, height: 22, viewBox: '0 0 22 22', fill: 'none' }, [
  h('circle', { cx: '11', cy: '11', r: '8', stroke: 'white', 'stroke-width': '1.5' }),
  h('path', { d: 'M3 11h16M11 3c-2.5 2.5-2.5 13.5 0 16M11 3c2.5 2.5 2.5 13.5 0 16', stroke: 'white', 'stroke-width': '1.5' }),
])

const quickNavs = [
  { name: '精品课程', desc: '1000+ 视频课程', path: '/course/1', bg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', icon: IconCourse },
  { name: '电子书库', desc: '500+ 电子书籍', path: '/list/book/1', bg: 'linear-gradient(135deg, #06b6d4, #3b82f6)', icon: IconBook },
  { name: '在线考试', desc: '海量题库练习', path: '/paper/1', bg: 'linear-gradient(135deg, #f59e0b, #ef4444)', icon: IconExam },
  { name: '答疑社区', desc: '专家在线解答', path: '/question_answer/1', bg: 'linear-gradient(135deg, #10b981, #059669)', icon: IconQA },
  { name: '开源项目', desc: '优质开源资源', path: '/openproject/list', bg: 'linear-gradient(135deg, #8b5cf6, #ec4899)', icon: IconProject },
  { name: '实用工具', desc: '效率提升工具', path: '/tool', bg: 'linear-gradient(135deg, #f97316, #f59e0b)', icon: IconTool },
  { name: '信息差', desc: '发现认知盲区', path: '/info_gap/1', bg: 'linear-gradient(135deg, #0ea5e9, #6366f1)', icon: IconInfo },
  { name: '实用网站', desc: '精选优质网站', path: '/usefull/list', bg: 'linear-gradient(135deg, #14b8a6, #06b6d4)', icon: IconWebsite },
  { name: '内部网站', desc: '内部专属资源', path: '/site', bg: 'linear-gradient(135deg, #64748b, #475569)', icon: IconInternal },
]

const mockCourses = [
  { id: 1, title: 'Vue 3 + TypeScript 全栈开发实战', tech: 'Vue 3', coverTitle: '全栈开发', coverSub: 'Vue3 · TypeScript · Vite', heatText: '12.4K人学', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', tags: ['前端', 'Vue3'], students: '12.4K', level: '中级', levelClass: 'level-mid', price: 199, originPrice: 399, rating: '4.9', badge: '热门', badgeType: 'badge-hot' },
  { id: 2, title: 'Python 数据分析与机器学习入门', tech: 'Python', coverTitle: '机器学习', coverSub: 'Python · Pandas · sklearn', heatText: '8.2K人学', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', tags: ['Python', 'AI'], students: '8.2K', level: '入门', levelClass: 'level-easy', price: 0, originPrice: null, rating: '4.8', badge: '免费', badgeType: 'badge-free' },
  { id: 3, title: 'Docker + K8s 云原生部署实践', tech: 'K8s', coverTitle: '云原生', coverSub: 'Docker · Kubernetes · CI/CD', heatText: '5.6K人学', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', tags: ['运维', 'DevOps'], students: '5.6K', level: '高级', levelClass: 'level-hard', price: 299, originPrice: 599, rating: '4.7', badge: '新课', badgeType: 'badge-new' },
  { id: 4, title: 'React 18 + Next.js 企业级项目', tech: 'React', coverTitle: '企业级开发', coverSub: 'React18 · Next.js · Redux', heatText: '9.1K人学', bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', tags: ['前端', 'React'], students: '9.1K', level: '中级', levelClass: 'level-mid', price: 249, originPrice: 499, rating: '4.9', badge: null, badgeType: '' },
  { id: 5, title: 'MySQL 性能优化与高可用架构', tech: 'MySQL', coverTitle: '数据库优化', coverSub: 'MySQL · 索引 · 主从复制', heatText: '6.8K人学', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', tags: ['数据库', 'MySQL'], students: '6.8K', level: '高级', levelClass: 'level-hard', price: 179, originPrice: 359, rating: '4.6', badge: null, badgeType: '' },
  { id: 6, title: 'Go 语言微服务开发从零到一', tech: 'Go', coverTitle: '微服务架构', coverSub: 'Go · gRPC · 微服务', heatText: '4.3K人学', bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', tags: ['后端', 'Go'], students: '4.3K', level: '中级', levelClass: 'level-mid', price: 229, originPrice: 459, rating: '4.8', badge: '秒杀', badgeType: 'badge-sale' },
  { id: 7, title: 'UI/UX 设计系统与组件库搭建', tech: 'UI/UX', coverTitle: '设计系统', coverSub: 'Figma · 组件库 · 设计规范', heatText: '3.9K人学', bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', tags: ['设计', 'UI'], students: '3.9K', level: '入门', levelClass: 'level-easy', price: 0, originPrice: null, rating: '4.7', badge: '免费', badgeType: 'badge-free' },
  { id: 8, title: 'Java Spring Boot 3.x 实战教程', tech: 'Java', coverTitle: 'Spring Boot', coverSub: 'Java · Spring · MyBatis', heatText: '15.2K人学', bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', tags: ['后端', 'Java'], students: '15.2K', level: '中级', levelClass: 'level-mid', price: 199, originPrice: 399, rating: '4.9', badge: '热门', badgeType: 'badge-hot' },
]

// Feature icons
// 活动专区数据
const flashsaleItems = [
  { id: 10, title: 'Vue 3 全栈开发实战', emoji: '⚡', bg: 'linear-gradient(135deg,#667eea,#764ba2)', students: '12.4K', heat: '极热', salePrice: 19, originPrice: 199 },
  { id: 11, title: 'Python 机器学习入门', emoji: '🐍', bg: 'linear-gradient(135deg,#f093fb,#f5576c)', students: '8.2K', heat: '火爆', salePrice: 9, originPrice: 99 },
  { id: 12, title: 'Docker 云原生实践', emoji: '🐳', bg: 'linear-gradient(135deg,#4facfe,#00f2fe)', students: '5.6K', heat: '热门', salePrice: 29, originPrice: 299 },
  { id: 13, title: 'React 18 企业级项目', emoji: '⚛️', bg: 'linear-gradient(135deg,#43e97b,#38f9d7)', students: '9.1K', heat: '热门', salePrice: 24, originPrice: 249 },
  { id: 14, title: 'MySQL 性能优化', emoji: '🗄️', bg: 'linear-gradient(135deg,#fa709a,#fee140)', students: '6.8K', heat: '较热', salePrice: 17, originPrice: 179 },
]

const groupItems = [
  { id: 20, title: 'Go 微服务开发从零到一', emoji: '🚀', bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', groupCount: '3.2K', heat: '极热', groupPrice: 99, originPrice: 229 },
  { id: 21, title: 'Java Spring Boot 3.x', emoji: '☕', bg: 'linear-gradient(135deg,#a1c4fd,#c2e9fb)', groupCount: '5.8K', heat: '火爆', groupPrice: 89, originPrice: 199 },
  { id: 22, title: 'UI/UX 设计系统搭建', emoji: '🎨', bg: 'linear-gradient(135deg,#ffecd2,#fcb69f)', groupCount: '2.1K', heat: '热门', groupPrice: 0, originPrice: 0 },
  { id: 23, title: 'Kubernetes 运维实战', emoji: '☸️', bg: 'linear-gradient(135deg,#667eea,#764ba2)', groupCount: '1.9K', heat: '热门', groupPrice: 129, originPrice: 299 },
  { id: 24, title: 'TypeScript 高级编程', emoji: '📘', bg: 'linear-gradient(135deg,#4facfe,#00f2fe)', groupCount: '4.4K', heat: '较热', groupPrice: 79, originPrice: 179 },
]

const examItems = [
  { id: 30, title: '前端面试题精选 500 道', emoji: '💻', bg: 'linear-gradient(135deg,#667eea,#764ba2)', count: '500', heat: '极热', passRate: '72%' },
  { id: 31, title: 'Java 后端面试宝典', emoji: '☕', bg: 'linear-gradient(135deg,#f093fb,#f5576c)', count: '680', heat: '火爆', passRate: '68%' },
  { id: 32, title: 'MySQL 数据库考题库', emoji: '🗄️', bg: 'linear-gradient(135deg,#43e97b,#38f9d7)', count: '320', heat: '热门', passRate: '81%' },
  { id: 33, title: 'Linux 运维认证题库', emoji: '🐧', bg: 'linear-gradient(135deg,#fa709a,#fee140)', count: '420', heat: '热门', passRate: '65%' },
  { id: 34, title: 'Python 编程基础测验', emoji: '🐍', bg: 'linear-gradient(135deg,#a18cd1,#fbc2eb)', count: '280', heat: '较热', passRate: '88%' },
]

// 套餐对比数据
const basicPlans = [
  {
    name: '免费',
    emoji: '🎁',
    tagline: '零门槛学习，网站专属功能',
    bg: 'linear-gradient(135deg, #10b981, #059669)',
    price: 0,
    unit: '',
    btnText: '立即免费学习',
    btnColor: '#10b981',
    action: '/course/1',
    features: [
      { text: '免费公开课程', included: true },
      { text: '电子书下载', included: true },
      { text: '社区答疑参与', included: true },
      { text: '基础题库练习', included: true },
      { text: '信息差发布', included: true },
      { text: '开源项目学习', included: true },
      { text: '实用网站浏览', included: true },
      { text: '付费精品课程', included: false },
      { text: 'VIP 专属内容', included: false },
      { text: '觉哥包就业小班服务', included: false },
    ],
  },
  {
    name: '付费课程',
    emoji: '📚',
    tagline: '按需购买，灵活学习',
    bg: 'linear-gradient(135deg, #f59e0b, #f97316)',
    price: 18,
    unit: '- 99 / 门',
    btnText: '浏览付费课程',
    btnColor: '#f97316',
    action: '/course/1',
    features: [
      { text: '免费功能', included: true },
      { text: '付费精品课程', included: true },
      { text: '付费专属课程考试', included: true },
      { text: '付费专属课程答疑', included: true },
      { text: 'VIP 专属内容', included: false },
      { text: '觉哥包就业小班服务', included: false },
    ],
  },
]

const adExpanded = ref(false)

// 公告栏数据
const noticePaused = ref(false)
const notices = [
  { text: '🎉 平台全新改版上线，体验更流畅！欢迎反馈意见', color: '#6366f1' },
  { text: '📚 新增 500+ 电子书，涵盖前端、后端、AI 方向', color: '#10b981' },
  { text: '⚡ 秒杀专区每日 10:00 准时开抢，低至 1 折', color: '#ef4444' },
  { text: '👥 拼团活动进行中，邀请好友最高享 7 折优惠', color: '#f59e0b' },
  { text: '🏆 答疑社区上线，专家在线实时解答你的问题', color: '#8b5cf6' },
  { text: '🔥 Vue3 + TypeScript 全栈实战课程限时特惠 ¥19', color: '#ec4899' },
]

const vipPeriod = ref('year')
const vipPeriods = [
  { key: 'year', label: '年度', price: 188, unit: '年', save: null },
]
const vipCurrentPrice = computed(() => vipPeriods.find(p => p.key === vipPeriod.value)?.price)
const vipCurrentLabel = computed(() => vipPeriods.find(p => p.key === vipPeriod.value)?.unit)
const vipFeatures = ['全站免费 + 付费课程', 'VIP 专属直播课', '专属题库全解锁', '优先答疑通道', '学习进度云同步','内部网站浏览']

// 小班专属亮点
const classHighlights = [
  { icon: '👥', title: '试用期包过-就业全流程陪伴', desc: '针对每个人技术路径规划,提供面试指导-入职-试用期技术支持' },
  { icon: '💬', title: '小班专属技术培训', desc: '每周定期培训，模拟答复' },
  { icon: '📋', title: '公司级商用项目实战', desc: '支持商用级项目实战带教，中-高级开发技术路线实践' },
]
const classFeatures = ['含全部付费课程权限', '网站全功能权限', '专人带教 + 小班技术培训', '简历指导+模拟面试+入职服务', '试用期陪伴', '终身回看']

// Feature icons
const FeatIcon1 = () => h('svg', { width: 28, height: 28, viewBox: '0 0 28 28', fill: 'none' }, [
  h('path', { d: 'M14 3l10 5.5v11L14 25 4 19.5v-11L14 3z', stroke: 'white', 'stroke-width': '1.5', 'stroke-linejoin': 'round' }),
  h('path', { d: 'M14 3v22M4 8.5l10 6 10-6', stroke: 'white', 'stroke-width': '1.5' }),
])
const FeatIcon2 = () => h('svg', { width: 28, height: 28, viewBox: '0 0 28 28', fill: 'none' }, [
  h('circle', { cx: '14', cy: '14', r: '10', stroke: 'white', 'stroke-width': '1.5' }),
  h('path', { d: 'M14 8v6l4 3', stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
])
const FeatIcon3 = () => h('svg', { width: 28, height: 28, viewBox: '0 0 28 28', fill: 'none' }, [
  h('circle', { cx: '10', cy: '10', r: '4', stroke: 'white', 'stroke-width': '1.5' }),
  h('circle', { cx: '20', cy: '10', r: '4', stroke: 'white', 'stroke-width': '1.5' }),
  h('path', { d: 'M4 22c0-3 2.5-5 6-5s6 2 6 5M14 22c0-3 2.5-5 6-5s6 2 6 5', stroke: 'white', 'stroke-width': '1.5', 'stroke-linecap': 'round' }),
])
const FeatIcon4 = () => h('svg', { width: 28, height: 28, viewBox: '0 0 28 28', fill: 'none' }, [
  h('path', { d: 'M14 3l2.5 7H23l-5.5 4 2 7L14 17l-5.5 4 2-7L5 10h6.5L14 3z', fill: 'white', stroke: 'white', 'stroke-width': '1', 'stroke-linejoin': 'round' }),
])

const features = [
  { title: '系统化课程体系', desc: '从入门到精通，覆盖前端、后端、运维、AI 等多个技术方向，循序渐进地提升你的技能。', bg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', icon: FeatIcon1 },
  { title: '随时随地学习', desc: '支持多端同步，PC、手机、平板均可流畅学习，利用碎片时间高效提升。', bg: 'linear-gradient(135deg, #06b6d4, #3b82f6)', icon: FeatIcon2 },
  { title: '活跃学习社区', desc: '加入数万名学习者，互相交流、答疑解惑，共同成长，不再孤独学习。', bg: 'linear-gradient(135deg, #10b981, #059669)', icon: FeatIcon3 },
  { title: '名师精心打造', desc: '所有课程均由行业一线专家录制，内容实战导向，学完即可上手项目。', bg: 'linear-gradient(135deg, #f59e0b, #ef4444)', icon: FeatIcon4 },
]
</script>

<style scoped>
/* ===== 全局变量 ===== */
.home-page {
  --accent: #3b82f6;
  --accent-light: rgba(59, 130, 246, 0.1);
  --surface: #ffffff;
  --surface-2: #f8fafc;
  --border: #e2e8f0;
  --text-1: #0f172a;
  --text-2: #334155;
  --text-3: #3b82f6;
  background: linear-gradient(180deg, #faf5ff 0%, #f5f3ff 100%);
  min-height: 100vh;
  padding-top: 0;
  margin-top: 0;
}

/* ===== Hero Banner ===== */
.hero-section {
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid #cbd5e1;
  min-height: 480px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: linear-gradient(180deg, #e0f7fa 0%, #b2ebf2 50%, #e0f2fe 100%);
}

/* 内容层（箭头 + 卡片） */
.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: stretch;
  width: 100%;
  padding: 0;
  box-sizing: border-box;
  flex: 1;
  overflow: hidden;
}

/* 底部指示点 - 悬浮在卡片上 */
.hero-footer {
  position: absolute;
  bottom: 16px;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 左右箭头 - 悬浮在卡片上 */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  border: none;
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  backdrop-filter: blur(4px);
}

.carousel-arrow-left {
  left: 20px;
}

.carousel-arrow-right {
  right: 20px;
}

.carousel-arrow:hover {
  background: #ffffff;
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
}

/* 轮播卡片 */
.carousel-card {
  flex: 1;
  border-radius: 0;
  padding: 52px 80px 52px 120px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0;
  box-sizing: border-box;
  transition: filter 0.3s ease;
  cursor: default;
  align-self: stretch;
  position: relative;
  overflow: hidden;
}

/* 卡片内装饰光晕 */
.carousel-card::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  pointer-events: none;
}

.carousel-card::after {
  content: '';
  position: absolute;
  bottom: -80px;
  left: 30%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  pointer-events: none;
}

.carousel-card:hover {
  filter: brightness(1.08);
  transform: translateY(-2px);
}

/* 卡片左右布局 */
.carousel-card-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
  flex: 0 0 45%;
}

.carousel-card-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
  padding-left: 48px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
}

.carousel-tools-label {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.carousel-tools-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.carousel-tool-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  backdrop-filter: blur(4px);
  transition: background 0.2s ease;
}

.carousel-tool-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.carousel-tool-icon {
  font-size: 22px;
  line-height: 1;
}

.carousel-tool-name {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

/* 卡片内文字 */
.carousel-card-title {
  font-size: 36px;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
  line-height: 1.2;
  text-shadow: 0 2px 12px rgba(0,0,0,0.2);
}

.carousel-card-sub {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.7;
}

.carousel-card-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: rgba(255, 255, 255, 0.95);
  color: #4f46e5;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.carousel-card-btn:hover {
  background: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

/* 图标 */
.carousel-card-icon {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  flex-shrink: 0;
}

.carousel-emoji {
  font-size: 40px;
  line-height: 1;
}

/* 指示点 */
.carousel-dots {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.carousel-dot.active {
  width: 24px;
  border-radius: 4px;
  background: white;
  border-color: white;
}

/* 过渡动画 */
.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.carousel-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.carousel-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 左右箭头 */
.hero-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(124, 58, 237, 0.2);
  color: #7c3aed;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0.15);
}

.hero-arrow:hover {
  background: #ffffff;
  border-color: #7c3aed;
  box-shadow: 0 6px 24px rgba(124, 58, 237, 0.3);
  transform: translateY(-50%) scale(1.08);
}

.hero-arrow-left { left: 40px; }
.hero-arrow-right { right: 40px; }

/* 轮播内容居中 */
.hero-slide-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 700px;
  padding: 60px 40px;
  cursor: pointer;
}

.hero-slide-icon {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  margin-bottom: 24px;
}

.hero-slide-emoji {
  font-size: 52px;
  line-height: 1;
}

.hero-slide-title {
  font-size: 42px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 16px;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.hero-slide-sub {
  font-size: 18px;
  color: #475569;
  margin: 0 0 32px;
  line-height: 1.6;
  max-width: 560px;
}

.hero-slide-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
}

.hero-slide-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(99, 102, 241, 0.5);
}

/* 底部指示点 */
.hero-dots {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.hero-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.2);
  border: 2px solid rgba(124, 58, 237, 0.3);
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.hero-dot.active {
  width: 32px;
  height: 10px;
  border-radius: 5px;
  background: #7c3aed;
  border-color: #7c3aed;
}

/* 轮播过渡动画 */
.hero-slide-enter-active,
.hero-slide-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.hero-slide-enter-from {
  opacity: 0;
  transform: translateX(60px);
}

.hero-slide-leave-to {
  opacity: 0;
  transform: translateX(-60px);
}

/* 过渡动画 */
.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.carousel-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.carousel-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}



.section-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 90px;
}

.quick-nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.quick-nav-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(124, 58, 237, 0.15);
  border-color: var(--accent);
}

.qn-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qn-info {
  flex: 1;
}

.qn-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-1);
  margin-bottom: 2px;
}

.qn-desc {
  font-size: 13px;
  color: var(--text-3);
}

.qn-arrow {
  color: var(--text-3);
  transition: transform 0.2s ease;
}

.quick-nav-card:hover .qn-arrow {
  transform: translateX(3px);
  color: #7c3aed;
}

/* ===== 热门课程 ===== */
.content-section {
  padding: 60px 0;
  background: #fafafa;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}


.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 32px;
}

.section-title-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: linear-gradient(135deg, #db2777, #f107a3);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 4px;
  letter-spacing: 0.05em;
  width: fit-content;
}

.section-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-1);
  margin: 0;
}

.section-subtitle {
  font-size: 14px;
  color: var(--text-3);
  margin: 0;
}

.btn-more {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-2);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-more:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}
.btn-more svg {
  transition: transform 0.2s ease;
}

.btn-more:hover svg {
  transform: translateX(3px);
}

/* ===== 课程卡片 ===== */
.course-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.course-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s ease;
}

.course-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  border-color: transparent;
}

.course-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 14px;
}

/* 封面装饰圆 */
.cover-deco-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.cover-deco-1 {
  width: 100px;
  height: 100px;
  top: -30px;
  right: -30px;
  background: rgba(255, 255, 255, 0.1);
}

.cover-deco-2 {
  width: 60px;
  height: 60px;
  bottom: -10px;
  left: 20px;
  background: rgba(255, 255, 255, 0.07);
}

.cover-tech-label {
  position: relative;
  z-index: 1;
  display: inline-block;
  padding: 3px 10px;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.05em;
  width: fit-content;
}

.cover-title-block {
  position: relative;
  z-index: 1;
}

.cover-main-title {
  font-size: 18px;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  margin-bottom: 4px;
}

.cover-sub-title {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.cover-heat {
  position: absolute;
  bottom: 12px;
  right: 12px;
  z-index: 1;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  padding: 3px 8px;
  border-radius: 100px;
}

.course-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  color: white;
}

.badge-hot { background: linear-gradient(135deg, #ef4444, #f97316); }
.badge-free { background: linear-gradient(135deg, #10b981, #059669); }
.badge-new { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
.badge-sale { background: linear-gradient(135deg, #f59e0b, #ef4444); }

.course-body {
  padding: 16px;
}

.course-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.course-tag {
  padding: 2px 8px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-2);
  font-weight: 500;
}

.course-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-1);
  margin: 0 0 10px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.course-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.course-students {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-3);
}

.course-level {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
}

.level-easy { background: #dcfce7; color: #16a34a; }
.level-mid { background: #fef3c7; color: #d97706; }
.level-hard { background: #fee2e2; color: #dc2626; }

.course-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-current {
  font-size: 18px;
  font-weight: 700;
  color: #ef4444;
}

.price-free {
  font-size: 16px;
  font-weight: 700;
  color: #10b981;
}

.price-origin {
  font-size: 12px;
  color: var(--text-3);
  text-decoration: line-through;
  margin-left: 6px;
}

.course-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-2);
}

/* ===== 功能亮点 ===== */
.features-section {
  padding: 60px 0;
  background: linear-gradient(180deg, #faf5ff 0%, #f5f3ff 100%);
  border-top: 2px solid #ede9fe;
  border-bottom: 2px solid #ede9fe;
}

.features-header {
  text-align: center;
  margin-bottom: 48px;
}

.features-header .section-title {
  font-size: 30px;
  margin-bottom: 10px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.feature-card {
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  text-align: center;
  transition: all 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
}

.feat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.feat-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-1);
  margin: 0 0 10px;
}

.feat-desc {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.7;
  margin: 0;
}

/* ===== 套餐对比 ===== */
.pricing-section {
  padding: 60px 0;
  background: linear-gradient(180deg, #f5f3ff 0%, #faf5ff 100%);
  border-top: 2px solid #ede9fe;
  border-bottom: 2px solid #ede9fe;
}

.pricing-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: stretch;
}

/* ===== 新套餐卡样式 ===== */
.pricing-card2 {
  background: #fff;
  border: 1px solid #e9d5ff;
  border-radius: 16px;
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(124,58,237,0.06);
  transition: all 0.2s ease;
}

.pricing-card2:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(124,58,237,0.12);
}

.p2-header {
  text-align: center;
  margin-bottom: 16px;
}

.p2-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  margin: 0 auto 10px;
}

.p2-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e1b4b;
  margin: 0 0 3px;
}

.p2-tagline {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.p2-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  padding: 12px 0;
  border-top: 1px solid #f3e8ff;
  border-bottom: 1px solid #f3e8ff;
  margin-bottom: 14px;
}

.p2-price-free {
  font-size: 24px;
  font-weight: 800;
  color: #10b981;
}

.p2-price-num {
  font-size: 26px;
  font-weight: 800;
  color: #1e1b4b;
}

.p2-price-range-sep {
  font-size: 20px;
  font-weight: 700;
  color: #94a3b8;
  margin: 0 2px;
}

.p2-price-unit {
  font-size: 12px;
  color: #94a3b8;
}

.p2-features {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  flex: 1;
}

.p2-feat {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
}

.p2-feat-no {
  color: #9ca3af;
}

.p2-feat-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.p2-check {
  background: #dcfce7;
  color: #16a34a;
}

.p2-cross {
  background: #fee2e2;
  color: #dc2626;
}

.p2-btn {
  width: 100%;
  padding: 11px;
  background: transparent;
  border: 1.5px solid;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.p2-btn:hover {
  opacity: 0.8;
}

.p2-btn-vip {
  background: linear-gradient(135deg, #7c3aed, #a855f7) !important;
  border-color: transparent !important;
  color: white !important;
}

.p2-btn-vip:hover {
  opacity: 0.9 !important;
  box-shadow: 0 4px 14px rgba(124,58,237,0.4);
}

/* VIP tabs */
.vip-tabs2 {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-bottom: 4px;
  justify-content: center;
}

.vip-tab2 {
  position: relative;
  padding: 5px 10px;
  background: #f3e8ff;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #7c3aed;
  cursor: pointer;
  transition: all 0.2s ease;
}

.vip-tab2:hover {
  background: #ede9fe;
}

.vip-tab2-active {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  color: white !important;
}

.vip-tab2-save {
  display: block;
  font-size: 9px;
  font-weight: 700;
  margin-top: 1px;
  opacity: 0.9;
}

/* ===== 小班专属新样式 ===== */
.pricing-class-card {
  position: relative;
  background: linear-gradient(160deg, #f5f3ff 0%, #ede9fe 60%, #ddd6fe 100%);
  border-radius: 18px;
  padding: 24px 20px 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(79,70,229,0.15);
  border: 1px solid #c4b5fd;
}

.pricing-class-card::before {
  content: '';
  position: absolute;
  top: -40px;
  right: -40px;
  width: 160px;
  height: 160px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  pointer-events: none;
}

.class-medal {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 40px;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
}

.class-top-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 100px;
  margin-bottom: 14px;
  width: fit-content;
}

.class-title {
  font-size: 26px;
  font-weight: 800;
  color: #1e1b4b;
  margin: 0 0 4px;
}

.class-sub {
  font-size: 14px;
  color: #475569;
  margin: 0 0 14px;
}

.class-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e9d5ff;
}

.class-price-main {
  font-size: 36px;
  font-weight: 800;
  color: #7c3aed;
}

.class-price-unit {
  font-size: 16px;
  font-weight: 600;
  color: #1e1b4b;
  background: none;
}

.class-highlights {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.class-hl {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.class-hl-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 1px;
}

.class-hl-title {
  font-size: 15px;
  font-weight: 600;
  color: #1e1b4b;
  margin-bottom: 1px;
}

.class-hl-desc {
  font-size: 13px;
  color: #64748b;
}

.class-feat-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.class-feat-list li {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 14px;
  color: #334155;
}

.class-cta-btn {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(245,158,11,0.4);
  margin-bottom: 8px;
}

.class-cta-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(245,158,11,0.55);
}

.class-note {
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  margin: 0;
}

.pricing-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pricing-top-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  flex: 1;
}

.pricing-top-row .pricing-card {
  display: flex;
  flex-direction: column;
}

.pricing-top-row .pricing-card .pricing-features {
  flex: 1;
}

.pricing-class-card {
  position: relative;
  background: #ffffff;
  border-radius: 18px;
  padding: 28px 24px 24px;
  overflow: hidden;
  border: 2px solid #6366f1;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
  display: flex;
  flex-direction: column;
}

.pricing-card {
  position: relative;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 14px;
  padding: 18px 16px 16px;
  transition: all 0.25s ease;
}

.pricing-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.pricing-vip-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: center;
}

.pricing-vip-inner {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.pricing-header {
  text-align: center;
  margin-bottom: 12px;
}

.pricing-vip-card .pricing-header {
  margin-bottom: 0;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.pricing-vip-card .pricing-icon {
  margin: 0;
}

.pricing-vip-card .pricing-name,
.pricing-vip-card .pricing-tagline {
  text-align: left;
}

.pricing-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin: 0 auto 8px;
}

.pricing-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-1);
  margin: 0 0 2px;
}

.pricing-tagline {
  font-size: 11px;
  color: var(--text-3);
  margin: 0;
}

.vip-period-tabs {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.vip-tab {
  position: relative;
  padding: 6px 14px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.vip-tab:hover {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.vip-tab-active {
  background: linear-gradient(135deg, #7c3aed, #db2777);
  border-color: transparent;
  color: white;
}

.vip-save {
  position: absolute;
  top: -8px;
  right: -4px;
  padding: 1px 5px;
  background: #ef4444;
  color: white;
  font-size: 9px;
  font-weight: 700;
  border-radius: 4px;
}

.pricing-vip-card .pricing-price {
  border: none;
  padding: 0;
  margin: 0;
  flex-shrink: 0;
}

.pricing-price {
  text-align: center;
  padding: 10px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 3px;
}

.price-tag {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-1);
}

.price-tag.price-free {
  color: #10b981;
  font-size: 20px;
}

.price-unit {
  font-size: 12px;
  color: var(--text-3);
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0 0 14px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.pricing-features-vip {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px 16px;
  margin: 0;
  flex: 1;
}

.pricing-features-vip .pricing-feat-item {
  width: auto;
}

.pricing-feat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-2);
}

.pricing-feat-item.feat-disabled {
  color: var(--text-3);
  text-decoration: line-through;
  opacity: 0.5;
}

.feat-icon {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  background: #dcfce7;
  color: #16a34a;
}

.feat-disabled .feat-icon {
  background: #fee2e2;
  color: #dc2626;
}

.pricing-btn {
  width: 100%;
  padding: 9px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-2);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.pricing-btn:hover {
  background: var(--accent-light);
  border-color: var(--accent);
  color: var(--accent);
}

.pricing-btn-featured {
  background: linear-gradient(135deg, #7c3aed, #db2777);
  border-color: transparent;
  color: white;
}

.pricing-btn-featured:hover {
  background: linear-gradient(135deg, #6d28d9, #be185d);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.5);
}

/* 小班专属卡 */
.pricing-class-card::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 100, 100, 0.3) 0%, transparent 70%);
  pointer-events: none;
}

.class-card-top-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: white;
  font-size: 12px;
  font-weight: 700;
  border-radius: 100px;
  margin-bottom: 16px;
}

.class-card-header {
  margin-bottom: 16px;
}

.class-card-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.class-card-title {
  font-size: 22px;
  font-weight: 800;
  color: white;
  margin: 0 0 4px;
}

.class-card-sub {
  font-size: 13px;
  color: rgba(255,255,255,0.55);
  margin: 0;
}

.class-card-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.class-price-main {
  font-size: 32px;
  font-weight: 800;
  color: #fbbf24;
}

.class-price-unit {
  font-size: 16px;
  font-weight: 600;
  color: #1e1b4b;
  background: none;
}

.class-card-highlights {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  flex: 1;
}

.class-highlight {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.class-highlight-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

.class-highlight-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  margin-bottom: 2px;
}

.class-highlight-desc {
  font-size: 11px;
  color: rgba(255,255,255,0.45);
}

.class-card-divider {
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin-bottom: 14px;
}

.class-card-features {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.class-card-features li {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: rgba(255,255,255,0.75);
}

.class-card-features .feat-icon {
  background: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.class-card-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 10px;
}

.class-card-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.class-card-note {
  text-align: center;
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  margin: 0;
}

@media (max-width: 1100px) {
  .pricing-layout {
    grid-template-columns: 1fr;
  }
  .pricing-vip-card {
    grid-template-columns: 1fr;
  }
  .pricing-vip-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .pricing-top-row {
    grid-template-columns: 1fr;
  }
}

/* ===== 活动专区 ===== */
.promo-section {
  padding: 60px 0;
  background: #ffffff;
  border-top: 2px solid #f0eeff;
  border-bottom: 2px solid #f0eeff;
}

.promo-expand-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: start;
}

.promo-expand-card {
  border-radius: 16px;
  overflow: hidden;
}

.promo-flashsale {
  background: linear-gradient(160deg, #1e1b4b 0%, #312e81 100%);
}

.promo-group {
  background: linear-gradient(160deg, #064e3b 0%, #065f46 100%);
}

.promo-exam {
  background: linear-gradient(160deg, #7c2d12 0%, #9a3412 100%);
}

.pec-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.pec-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pec-badge {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(255,255,255,0.15);
  border-radius: 100px;
  font-size: 11px;
  color: rgba(255,255,255,0.85);
  width: fit-content;
}

.pec-title {
  font-size: 20px;
  font-weight: 800;
  color: white;
  margin: 0;
}

.pec-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  margin: 0;
}

.pec-more-btn {
  padding: 6px 14px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  color: rgba(255,255,255,0.8);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.pec-more-btn:hover {
  background: rgba(255,255,255,0.22);
}

.pec-list {
  padding: 8px 0;
}

.pec-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.pec-item:hover {
  background: rgba(255,255,255,0.06);
}

.pec-rank {
  width: 20px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255,255,255,0.3);
  flex-shrink: 0;
}

.rank-top {
  color: #f59e0b;
}

.pec-cover {
  width: 40px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.pec-info {
  flex: 1;
  min-width: 0;
}

.pec-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
}

.pec-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pec-students {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}

.pec-heat {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}

.pec-price-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.pec-sale-price {
  font-size: 15px;
  font-weight: 700;
  color: #fbbf24;
}

.pec-origin-price {
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  text-decoration: line-through;
}

.pec-pass-rate {
  font-size: 12px;
  font-weight: 600;
  color: #6ee7b7;
}

@media (max-width: 1100px) {
  .promo-expand-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== 公告栏 ===== */
.notice-section {
  padding: 6px 32px;
  margin-top: 0;
  background: transparent;
}

.notice-bar {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 12px;
  display: flex;
  align-items: center;
  height: 40px;
  gap: 0;
  overflow: hidden;
  background: linear-gradient(90deg, #fef9c3 0%, #fef3c7 40%, #fce7f3 100%);
  border: 1.5px solid #fbbf24;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.15);
  animation: notice-bar-in 0.5s ease both;
}

@keyframes notice-bar-in {
  from { opacity: 0; transform: translateY(-100%); }
  to   { opacity: 1; transform: translateY(0); }
}

.notice-label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px 4px 10px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  border-radius: 0 8px 8px 0;
  color: white;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
  margin-right: 16px;
  letter-spacing: 0.08em;
  text-shadow: 0 1px 3px rgba(0,0,0,0.2);
  box-shadow: 2px 0 12px rgba(249, 115, 22, 0.35);
  animation: label-pulse 3s ease-in-out infinite;
}

@keyframes label-pulse {
  0%, 100% { box-shadow: 2px 0 12px rgba(249, 115, 22, 0.35); }
  50%       { box-shadow: 2px 0 20px rgba(249, 115, 22, 0.6); }
}

.notice-scroll-wrap {
  flex: 1;
  overflow: hidden;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
}

.notice-scroll-track {
  display: flex;
  align-items: center;
  white-space: nowrap;
  animation: notice-scroll 32s linear infinite;
}

@keyframes notice-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.notice-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  padding-right: 8px;
  cursor: default;
  transition: color 0.2s ease;
}

.notice-item:hover {
  color: #d97706;
}

.notice-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  animation: dot-blink 2s ease-in-out infinite;
}

@keyframes dot-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.4); }
}

.notice-sep {
  color: #d97706;
  margin: 0 16px 0 8px;
  font-size: 14px;
  opacity: 0.5;
}

.notice-more {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #b45309;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  border-left: 1.5px solid #fbbf24;
  margin-left: 16px;
  transition: color 0.15s ease, gap 0.2s ease;
}

.notice-more:hover {
  color: #92400e;
  gap: 6px;
}

/* ===== 广告位 ===== */
.ad-section {
  padding: 0 0 80px;
}

.ad-wrapper {
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  background: #f8fafc;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ad-wrapper:hover {
  border-color: #94a3b8;
}

.ad-wrapper.ad-expanded {
  border-color: #94a3b8;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.ad-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  user-select: none;
  background: #f8fafc;
  transition: background 0.15s ease;
}

.ad-bar:hover {
  background: #f1f5f9;
}

.ad-bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #94a3b8;
}

.ad-bar-text {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
}

.ad-bar-badge {
  font-size: 11px;
  color: #cbd5e1;
  padding: 2px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 100px;
  background: white;
}

.ad-bar-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #94a3b8;
  font-size: 12px;
}

.ad-toggle-icon {
  transition: transform 0.25s ease;
}

.ad-toggle-icon.rotated {
  transform: rotate(180deg);
}

.ad-content {
  border-top: 1.5px dashed #e2e8f0;
  background: white;
}

.ad-content-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px 24px;
  text-align: center;
  min-height: 200px;
}

.ad-content-tip {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
}

.ad-content-sub {
  font-size: 12px;
  color: #cbd5e1;
  margin: 0;
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  background: transparent;
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.35);
}

.btn-outline.btn-lg {
  padding: 16px 36px;
  font-size: 16px;
}

/* ===== 响应式 ===== */
@media (max-width: 1024px) {
  .feature-nav {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
  .feature-nav-icon {
    font-size: 28px;
    width: 44px;
    height: 44px;
  }
  .feature-nav-label {
    font-size: 13px;
  }
  .hero-title {
    font-size: 40px;
  }
  .course-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .hero-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .hero-carousel {
    display: none;
  }
  .hero-title {
    font-size: 38px;
  }
  .quick-nav-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .promo-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 0 48px;
    border-radius: 0;
    margin: 0;
  }
  .hero-center {
    padding: 40px 16px 32px;
  }
  .feature-nav {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 32px;
  }
  .feature-nav-item {
    padding: 12px 8px;
  }
  .feature-nav-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
  }
  .feature-nav-label {
    font-size: 12px;
  }
  .hero-title {
    font-size: 32px;
  }
  .quick-nav-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .course-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .promo-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 32px 0 40px;
    border-radius: 0;
    margin: 0;
  }
  .hero-center {
    padding: 32px 12px 28px;
  }
  .feature-nav {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-top: 24px;
  }
  .feature-nav-item {
    padding: 10px 6px;
  }
  .feature-nav-icon {
    font-size: 20px;
    width: 36px;
    height: 36px;
  }
  .feature-nav-label {
    font-size: 11px;
  }
  .hero-title {
    font-size: 28px;
  }
  .hero-desc {
    font-size: 14px;
  }
  .quick-nav-grid {
    grid-template-columns: 1fr;
  }
  .course-grid {
    grid-template-columns: 1fr;
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
  .cta-title {
    font-size: 26px;
  }
  .cta-card {
    padding: 48px 24px;
  }
}
</style>

<!-- 太空风格全局覆盖（不用 scoped，通过 data-theme 属性控制） -->
<style>
/* ===== 太空风格 ===== */
[data-theme="space"] body,
[data-theme="space"] {
  --space-bg: #020817;
  --space-surface: #0d1117;
  --space-surface-2: #161b22;
  --space-border: rgba(48, 54, 61, 0.8);
  --space-text-1: #e6edf3;
  --space-text-2: #8b949e;
  --space-text-3: #484f58;
  --space-accent: #58a6ff;
}

/* 页面背景 */
[data-theme="space"] .home-page {
  background: #020817 !important;
  --accent: #58a6ff;
  --accent-light: rgba(88, 166, 255, 0.1);
  --surface: #0d1117;
  --surface-2: #161b22;
  --border: rgba(48, 54, 61, 0.8);
  --text-1: #e6edf3;
  --text-2: #8b949e;
  --text-3: #484f58;
}

/* Hero */
[data-theme="space"] .hero-section {
  background: radial-gradient(ellipse at 20% 50%, #0d2137 0%, #020817 40%, #000510 100%) !important;
  position: relative;
}

[data-theme="space"] .hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.8) 0%, transparent 100%),
    radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.9) 0%, transparent 100%),
    radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.7) 0%, transparent 100%),
    radial-gradient(1px 1px at 85% 70%, rgba(255,255,255,0.5) 0%, transparent 100%),
    radial-gradient(1px 1px at 20% 80%, rgba(255,255,255,0.6) 0%, transparent 100%),
    radial-gradient(1px 1px at 60% 85%, rgba(255,255,255,0.4) 0%, transparent 100%),
    radial-gradient(2px 2px at 40% 30%, rgba(88,166,255,0.6) 0%, transparent 100%),
    radial-gradient(2px 2px at 75% 15%, rgba(88,166,255,0.5) 0%, transparent 100%),
    radial-gradient(1.5px 1.5px at 90% 50%, rgba(255,255,255,0.7) 0%, transparent 100%);
  pointer-events: none;
  z-index: 0;
}

[data-theme="space"] .blob-1 { background: #1d4ed8 !important; opacity: 0.2 !important; }
[data-theme="space"] .blob-2 { background: #0ea5e9 !important; opacity: 0.15 !important; }
[data-theme="space"] .blob-3 { background: #6366f1 !important; opacity: 0.12 !important; }

[data-theme="space"] .hero-badge {
  background: rgba(88, 166, 255, 0.1) !important;
  border-color: rgba(88, 166, 255, 0.3) !important;
  color: #79c0ff !important;
}

[data-theme="space"] .badge-dot { background: #58a6ff !important; }

[data-theme="space"] .hero-highlight {
  background: linear-gradient(135deg, #58a6ff, #79c0ff, #a5d6ff) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

[data-theme="space"] .hero-desc { color: #8b949e !important; }

[data-theme="space"] .btn-primary {
  background: linear-gradient(135deg, #1d4ed8, #0ea5e9) !important;
  box-shadow: 0 4px 20px rgba(14, 165, 233, 0.4) !important;
}

[data-theme="space"] .btn-primary:hover {
  box-shadow: 0 8px 28px rgba(14, 165, 233, 0.55) !important;
}

[data-theme="space"] .stat-num { color: #79c0ff !important; }

/* 快捷导航 */
[data-theme="space"] .quick-nav-card {
  background: #0d1117 !important;
  border-color: rgba(48, 54, 61, 0.8) !important;
}

[data-theme="space"] .quick-nav-card:hover {
  border-color: #58a6ff !important;
  box-shadow: 0 8px 24px rgba(88, 166, 255, 0.15) !important;
}

[data-theme="space"] .qn-name { color: #e6edf3 !important; }
[data-theme="space"] .qn-desc { color: #484f58 !important; }

/* 区块标题 */
[data-theme="space"] .section-title { color: #e6edf3 !important; }
[data-theme="space"] .section-subtitle { color: #8b949e !important; }
[data-theme="space"] .section-tag {
  background: linear-gradient(135deg, #1d4ed8, #0ea5e9) !important;
}

/* 课程卡片 */
[data-theme="space"] .course-card {
  background: #0d1117 !important;
  border-color: rgba(48, 54, 61, 0.8) !important;
}

[data-theme="space"] .course-card:hover {
  box-shadow: 0 12px 32px rgba(88, 166, 255, 0.12) !important;
}

[data-theme="space"] .course-title { color: #e6edf3 !important; }
[data-theme="space"] .course-tag {
  background: #161b22 !important;
  border-color: rgba(48, 54, 61, 0.8) !important;
  color: #8b949e !important;
}

/* 功能亮点 */
[data-theme="space"] .features-section {
  background: linear-gradient(180deg, #020817 0%, #0d1117 100%) !important;
}

[data-theme="space"] .feature-card {
  background: #0d1117 !important;
  border-color: rgba(48, 54, 61, 0.8) !important;
}

[data-theme="space"] .feat-title { color: #e6edf3 !important; }
[data-theme="space"] .feat-desc { color: #8b949e !important; }

/* 套餐区 */
[data-theme="space"] .pricing-section {
  background: linear-gradient(180deg, #0d1117 0%, #020817 100%) !important;
}

[data-theme="space"] .pricing-card {
  background: #0d1117 !important;
  border-color: rgba(48, 54, 61, 0.8) !important;
}

[data-theme="space"] .pricing-name { color: #e6edf3 !important; }
[data-theme="space"] .pricing-tagline { color: #484f58 !important; }
[data-theme="space"] .price-tag { color: #e6edf3 !important; }
[data-theme="space"] .price-tag.price-free { color: #3fb950 !important; }
[data-theme="space"] .pricing-price { border-color: rgba(48, 54, 61, 0.8) !important; }
[data-theme="space"] .pricing-feat-item { color: #8b949e !important; }
[data-theme="space"] .pricing-btn {
  background: #161b22 !important;
  border-color: rgba(48, 54, 61, 0.8) !important;
  color: #8b949e !important;
}

[data-theme="space"] .pricing-btn:hover {
  border-color: #58a6ff !important;
  color: #58a6ff !important;
  background: rgba(88, 166, 255, 0.08) !important;
}

[data-theme="space"] .pricing-btn-featured {
  background: linear-gradient(135deg, #1d4ed8, #0ea5e9) !important;
  color: white !important;
}

[data-theme="space"] .pricing-class-card {
  background: linear-gradient(160deg, #020817 0%, #0d2137 50%, #0c1a3a 100%) !important;
  border-color: rgba(88, 166, 255, 0.25) !important;
  box-shadow: 0 8px 32px rgba(88, 166, 255, 0.15) !important;
}

[data-theme="space"] .class-card-btn {
  background: linear-gradient(135deg, #1d4ed8, #0ea5e9) !important;
  box-shadow: 0 4px 16px rgba(14, 165, 233, 0.4) !important;
}

[data-theme="space"] .vip-tab-active {
  background: linear-gradient(135deg, #1d4ed8, #0ea5e9) !important;
}

/* CTA */
[data-theme="space"] .cta-card {
  background: radial-gradient(ellipse at center, #0d2137 0%, #020817 70%) !important;
  border: 1px solid rgba(88, 166, 255, 0.15);
}

[data-theme="space"] .cta-blob-1 { background: #1d4ed8 !important; }
[data-theme="space"] .cta-blob-2 { background: #0ea5e9 !important; }

/* 导航栏太空风格 */
[data-theme="space"] .navbar {
  background: linear-gradient(180deg, #020817 0%, #0d1117 100%) !important;
  border-bottom-color: rgba(88, 166, 255, 0.1) !important;
}

[data-theme="space"] .nav-item.active {
  color: #58a6ff !important;
  background: rgba(88, 166, 255, 0.08) !important;
}

[data-theme="space"] .nav-item.active::after {
  background: #58a6ff !important;
}

[data-theme="space"] .btn-login {
  background: linear-gradient(135deg, #1d4ed8, #0ea5e9) !important;
}
</style>
