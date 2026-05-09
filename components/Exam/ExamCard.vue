<template>
  <div class="exam-card" :class="{ selected }" @click="handleCardClick">
    <div v-if="selectable" class="select-check" @click.stop="$emit('select', item.id)">
      <span class="check-icon">{{ selected ? '✓' : '' }}</span>
    </div>
    <!-- 封面 / 顶部色块 -->
    <div class="card-cover" :style="coverStyle">
      <img v-if="item.cover" :src="item.cover" class="cover-img" />
      <div v-else class="cover-placeholder">
        <span class="cover-icon">📝</span>
      </div>

      <!-- 收藏按钮 -->
      <button class="fav-btn" @click.stop="$emit('collect', item)">
        <span :class="item.is_collected ? 'fav-active' : 'fav-default'">
          {{ item.is_collected ? '❤️' : '🤍' }}
        </span>
      </button>

      <!-- 已考过徽章 -->
      <div v-if="item.is_test" class="done-badge">✓ 已完成</div>

      <!-- 资源关联标签 -->
      <div v-if="item.resource_type" class="resource-badge">
        {{ item.resource_type === 'course' ? '📚 关联课程' : '📖 关联电子书' }}
      </div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-body">
      <h3 class="card-title">{{ item.title }}</h3>

      <!-- 标签 -->
      <div v-if="item.tags && item.tags.length" class="tag-row">
        <span v-for="tag in item.tags.slice(0, 3)" :key="tag" class="tag-chip">{{ tag }}</span>
      </div>

      <!-- 描述 -->
      <p v-if="item.description" class="card-desc">{{ item.description }}</p>

      <!-- 统计信息 -->
      <div class="card-stats">
        <div class="stat-item">
          <span class="stat-icon">📋</span>
          <span>{{ item.question_count }} 题</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">⏱</span>
          <span>{{ item.expire }} 分钟</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">🎯</span>
          <span>{{ item.pass_score }}/{{ item.total_score }} 分</span>
        </div>
        <div class="stat-item">
          <span class="stat-icon">❤️</span>
          <span>{{ item.collect_count || 0 }}</span>
        </div>
      </div>

      <!-- 底部操作区 -->
      <div class="card-footer">
        <button
          class="btn-start"
          :class="{ 'btn-done': item.is_test }"
          @click.stop="handleStart"
        >
          {{ item.is_test ? '再次挑战' : '立即参加' }}
        </button>

        <!-- 管理操作（有权限才显示） -->
        <div v-if="canEdit || canDelete" class="admin-actions" @click.stop>
          <button v-if="canEdit" class="btn-admin btn-edit" @click="$emit('edit', item)">编辑</button>
          <button v-if="canDelete" class="btn-admin btn-del" @click="$emit('delete', item)">删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { createDiscreteApi } from 'naive-ui'
import { useUser, canTakeExam } from '~/composables/useAuth'

const props = defineProps({
  item:        { type: Object, required: true },
  canEdit:     { type: Boolean, default: false },
  canDelete:   { type: Boolean, default: false },
  selectable:  { type: Boolean, default: false },
  selected:    { type: Boolean, default: false },
})
const emit = defineEmits(['collect', 'edit', 'delete', 'select'])

function handleCardClick() {
  if (props.selectable) {
    emit('select', props.item.id)
    return
  }
  handleStart()
}

// 封面渐变色（无封面时按 id 取色）
const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
]
const coverStyle = computed(() => {
  if (props.item.cover) return {}
  const idx = Number(props.item.id) % GRADIENTS.length
  return { background: GRADIENTS[idx] }
})

// 开始考试
function handleStart() {
  const { dialog, message } = createDiscreteApi(['dialog', 'message'])
  const user = useUser()
  if (!user.value) {
    message.warning('请先登录')
    return navigateTo('/login')
  }
  if (!canTakeExam()) {
    message.warning('需要 VIP 及以上等级才能参加考试')
    return
  }
  dialog.create({
    title: '参加考试',
    content: `即将开始「${props.item.title}」，共 ${props.item.question_count} 题，时长 ${props.item.expire} 分钟，确认参加？`,
    positiveText: '立即开始',
    negativeText: '取消',
    async onPositiveClick() {
      if (!canTakeExam()) {
        message.warning('需要 VIP 及以上等级才能参加考试')
        return true
      }
      const examId = props.item?.id
      if (examId == null || examId === '') {
        message.error('试卷信息不完整，无法进入考试')
        return true
      }
      await navigateTo(`/paper_test/${examId}`)
      return true
    },
  })
}
</script>

<style scoped>
.exam-card {
  position: relative;
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.exam-card.selected {
  box-shadow: 0 0 0 2px #d03050, 0 8px 24px rgba(0,0,0,0.1);
}
.select-check {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 4;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: rgba(255,255,255,0.95);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #d03050;
}
.exam-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.12);
}

/* ── 封面 ── */
.card-cover {
  position: relative;
  height: 160px;
  overflow: hidden;
  flex-shrink: 0;
}
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cover-icon { font-size: 56px; opacity: 0.7; }

/* 收藏按钮 */
.fav-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255,255,255,0.9);
  border: none;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: transform 0.15s;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.fav-btn:hover { transform: scale(1.15); }

/* 已完成徽章 */
.done-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(16, 185, 129, 0.9);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

/* 资源关联标签 */
.resource-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

/* ── 卡片内容 ── */
.card-body {
  padding: 16px 18px 18px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 标签 */
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.tag-chip {
  background: #ede9fe;
  color: #6366f1;
  font-size: 11px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 20px;
}

/* 描述 */
.card-desc {
  font-size: 13px;
  color: #888;
  margin: 0 0 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 统计 */
.card-stats {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}
.stat-icon { font-size: 13px; }

/* 底部 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}
.btn-start {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 3px 10px rgba(99, 102, 241, 0.35);
}
.btn-start:hover { opacity: 0.9; transform: translateY(-1px); }
.btn-start.btn-done {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 3px 10px rgba(16, 185, 129, 0.35);
}

/* 管理操作 */
.admin-actions {
  display: flex;
  gap: 6px;
}
.btn-admin {
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s;
}
.btn-edit {
  background: #f0f9ff;
  color: #0ea5e9;
  border: 1px solid #bae6fd;
}
.btn-edit:hover { background: #e0f2fe; }
.btn-del {
  background: #fff5f5;
  color: #ef4444;
  border: 1px solid #fecaca;
}
.btn-del:hover { background: #fee2e2; }
</style>
