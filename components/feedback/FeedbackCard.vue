<template>
  <div
    class="feedback-card"
    :class="{ pinned: pinned }"
    @click="$emit('click', item.id)"
  >
    <div v-if="pinned" class="pin-badge">置顶{{ item.pinOrder }}</div>
    <div class="card-header">
      <span class="category-icon">{{ resolveFeedbackCategoryIcon(item) }}</span>
      <span class="category-name">{{ item.categoryName }}</span>
      <span class="status-badge" :class="`status-${item.status}`">
        {{ resolveFeedbackStatusText(item.status) }}
      </span>
    </div>
    <h3 class="card-title">{{ item.title }}</h3>
    <div v-if="item.tags?.length" class="tag-row">
      <span v-for="tag in item.tags" :key="tag.id" class="feedback-tag">{{ tag.name }}</span>
    </div>
    <p class="card-content">
      {{ item.contentPreview || '' }}{{ item.contentPreview ? '...' : '' }}
    </p>
    <div class="card-footer">
      <div class="card-footer-meta">
        <span class="footer-user">👤 {{ resolvedUserName }}</span>
        <span class="footer-time">{{ resolvedTime }}</span>
      </div>
      <div class="card-footer-stats">
        <span class="stat-chip" title="点赞数">
          <span class="stat-icon">👍</span>{{ item.likeCount || 0 }}
        </span>
        <span class="stat-chip" title="评论数">
          <span class="stat-icon">💬</span>{{ item.commentCount || 0 }}
        </span>
        <span class="stat-chip" title="浏览数">
          <span class="stat-icon">👁</span>{{ item.viewCount || 0 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 反馈卡片组件
 * - 同时承载"置顶卡片"与"普通卡片":通过 pinned prop 切换边框 / 背景 / 角标
 * - 点击整张卡片向父级 emit('click', id) 由父级负责跳转,保持组件无路由耦合
 */
import { computed } from 'vue'
import {
  resolveFeedbackCategoryIcon,
  resolveFeedbackStatusText
} from '~/composables/assistant'

const props = defineProps({
  /** 反馈条目数据,字段沿用列表接口返回结构 */
  item: {
    type: Object,
    required: true
  },
  /** 是否为置顶样式（额外渲染 pin-badge 与置顶配色） */
  pinned: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const resolvedUserName = computed(() =>
  props.item?.userName || `用户${props.item?.userId || ''}`
)

const resolvedTime = computed(() => formatTime(props.item?.createTime))

/** 相对时间格式化:今天 / 昨天 / N 天前 / 具体日期 */
function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.feedback-card {
  display: flex;
  flex-direction: column;
  height: 232px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.feedback-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.feedback-card.pinned {
  border: 2px solid #ff9800;
  background: linear-gradient(135deg, #fff 0%, #fff8f0 100%);
  padding: 14px;
}

.pin-badge {
  display: inline-block;
  background: #ff9800;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 6px;
  height: 26px;
  margin-bottom: 8px;
  overflow: hidden;
}

.category-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.category-name {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  margin-left: auto;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.status-PENDING {
  background: #fff7e6;
  color: #d97706;
}

.status-PROCESSING {
  background: #e0f2fe;
  color: #0369a1;
}

.status-RESOLVED {
  background: #dcfce7;
  color: #15803d;
}

.status-CLOSED {
  background: #f3f4f6;
  color: #4b5563;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
  height: 22px;
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  height: 24px;
  margin: 0 0 8px 0;
  overflow: hidden;
}

.feedback-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 12px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 13px;
  line-height: 1;
  flex-shrink: 0;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-content {
  /*
   * 用 -webkit-line-clamp 截断 2 行;同时用 max-height 做物理裁剪兜底,
   * 防止在 flex 子项内 line-clamp 偶发失效时第 3 行半截字漏出。
   * line-height 1.55 × font-size 13px × 2 行 ≈ 40.3px
   */
  flex: 1 1 auto;
  min-height: 0;
  max-height: calc(13px * 1.55 * 2);
  font-size: 13px;
  color: #6b7280;
  line-height: 1.55;
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.card-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
  flex-shrink: 0;
}

.card-footer-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
  height: 16px;
}

.footer-user {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.footer-time {
  color: #9ca3af;
  flex-shrink: 0;
}

.card-footer-stats {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  height: 22px;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 11px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.stat-chip .stat-icon {
  font-size: 12px;
}
</style>
