<template>
  <div class="notif-wrapper" ref="wrapperRef">
    <!-- 铃铛按钮 -->
    <button class="bell-btn" @click="togglePanel" :class="{ active: panelOpen }" title="消息通知">
      <BellIcon class="bell-icon" :class="{ ringing: unreadCount > 0 }" />
      <span v-if="unreadCount > 0" class="badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- 下拉面板 -->
    <Transition name="notif-panel">
      <div v-if="panelOpen" class="notif-panel">
        <!-- 头部 -->
        <div class="panel-header">
          <span class="panel-title">消息通知</span>
          <div class="panel-actions">
            <button v-if="unreadCount > 0" class="action-btn" @click="markAllRead">
              <CheckAllIcon /><span>全部已读</span>
            </button>
            <button v-if="notifications.length > 0" class="action-btn danger" @click="clearAll">
              <TrashIcon /><span>清空</span>
            </button>
          </div>
        </div>

        <!-- 连接状态 -->
        <div v-if="wsStatus !== 'connected'" class="status-bar" :class="wsStatus">
          <span class="status-dot" />
          <span>{{ statusText }}</span>
        </div>

        <!-- 消息列表 -->
        <div class="notif-list">
          <div v-if="notifications.length === 0" class="empty-state">
            <EmptyBellIcon class="empty-icon" />
            <p>暂无消息通知</p>
          </div>

          <div
            v-for="msg in notifications"
            :key="msg.id"
            class="notif-item"
            :class="{ unread: !msg.read }"
            @click="handleItemClick(msg)"
          >
            <span v-if="!msg.read" class="unread-dot" />
            <div class="item-icon">
              <component :is="getIcon(msg.type)" />
            </div>
            <div class="item-body">
              <div class="item-title">{{ msg.title }}</div>
              <div class="item-content" v-if="msg.content">{{ msg.content }}</div>
              <div class="item-time">{{ formatTime(msg.createTime) }}</div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, h } from 'vue'

const { notifications, unreadCount, wsStatus, markAllRead, markRead, clearAll } = useWebSocket()

const panelOpen = ref(false)
const wrapperRef = ref(null)

function togglePanel() {
  panelOpen.value = !panelOpen.value
}

function handleOutsideClick(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    panelOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick, true))
onBeforeUnmount(() => document.removeEventListener('click', handleOutsideClick, true))

function handleItemClick(msg) {
  markRead(msg.id)
  if (msg.jumpUrl) {
    panelOpen.value = false
    navigateTo(msg.jumpUrl)
  }
}

function getIcon(type) {
  return SystemIcon
}

const statusText = computed(() => ({
  connecting: '连接中…',
  disconnected: '未连接',
  error: '连接异常',
}[wsStatus.value] || ''))

function formatTime(raw) {
  if (!raw) return ''
  try {
    const date = Array.isArray(raw)
      ? new Date(raw[0], raw[1] - 1, raw[2], raw[3] || 0, raw[4] || 0, raw[5] || 0)
      : new Date(raw)
    const diff = Date.now() - date
    if (diff < 60_000) return '刚刚'
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
  } catch { return '' }
}

// ── 图标 ──────────────────────────────────────────────────────────────────────
const BellIcon = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  h('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
])
const CheckAllIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M2 12l5 5L17 7M7 12l5 5 5-5', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
])
const TrashIcon = () => h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none' }, [
  h('polyline', { points: '3 6 5 6 21 6', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' }),
  h('path', { d: 'M19 6l-1 14H6L5 6', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  h('path', { d: 'M10 11v6M14 11v6', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round' }),
  h('path', { d: 'M9 6V4h6v2', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
])
const SystemIcon = () => h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' }, [
  h('circle', { cx: '12', cy: '12', r: '9', stroke: 'currentColor', 'stroke-width': '1.8' }),
  h('path', { d: 'M12 8v4M12 16h.01', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round' }),
])
const EmptyBellIcon = () => h('svg', { width: 40, height: 40, viewBox: '0 0 24 24', fill: 'none' }, [
  h('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
  h('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }),
])
</script>

<style scoped>
.notif-wrapper { position: relative; display: flex; align-items: center; }

.bell-btn {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 38px; height: 38px;
  background: rgba(148,163,184,0.08); border: 1px solid rgba(148,163,184,0.12);
  border-radius: 8px; cursor: pointer; color: #94a3b8; transition: all 0.2s ease;
}
.bell-btn:hover, .bell-btn.active {
  background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: #6366f1;
}

@keyframes ring {
  0%,100% { transform: rotate(0deg); }
  10%,30%,50%,70% { transform: rotate(-12deg); }
  20%,40%,60%,80% { transform: rotate(12deg); }
}
.bell-icon.ringing { animation: ring 2s ease-in-out infinite; transform-origin: top center; }

.badge {
  position: absolute; top: -4px; right: -4px;
  min-width: 18px; height: 18px; padding: 0 4px;
  background: #ef4444; color: #fff; font-size: 11px; font-weight: 600;
  line-height: 18px; text-align: center; border-radius: 9px;
  border: 2px solid #1a1d29; pointer-events: none;
}

.notif-panel {
  position: absolute; top: calc(100% + 10px); right: 0;
  width: 360px; max-height: 520px;
  background: #1e2130; border: 1px solid rgba(99,102,241,0.15);
  border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  display: flex; flex-direction: column; overflow: hidden; z-index: 2000;
}
.notif-panel-enter-active, .notif-panel-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.notif-panel-enter-from, .notif-panel-leave-to { opacity: 0; transform: translateY(-8px) scale(0.97); }

.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px 12px; border-bottom: 1px solid rgba(148,163,184,0.08); flex-shrink: 0;
}
.panel-title { font-size: 14px; font-weight: 600; color: #e2e8f0; }
.panel-actions { display: flex; gap: 8px; }
.action-btn {
  display: flex; align-items: center; gap: 4px; padding: 4px 8px;
  background: transparent; border: 1px solid rgba(148,163,184,0.15);
  border-radius: 5px; color: #94a3b8; font-size: 12px; cursor: pointer; transition: all 0.15s ease;
}
.action-btn:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); color: #6366f1; }
.action-btn.danger:hover { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: #ef4444; }

.status-bar { display: flex; align-items: center; gap: 6px; padding: 6px 16px; font-size: 12px; flex-shrink: 0; }
.status-bar.connecting { background: rgba(245,158,11,0.08); color: #f59e0b; }
.status-bar.disconnected { background: rgba(148,163,184,0.06); color: #94a3b8; }
.status-bar.error { background: rgba(239,68,68,0.08); color: #ef4444; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.connecting .status-dot { animation: pulse 1.2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

.notif-list { flex: 1; overflow-y: auto; padding: 4px 0; }
.notif-list::-webkit-scrollbar { width: 4px; }
.notif-list::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 2px; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 24px; color: #475569; gap: 12px;
}
.empty-icon { color: #334155; }
.empty-state p { font-size: 13px; margin: 0; }

.notif-item {
  position: relative; display: flex; align-items: flex-start; gap: 10px;
  padding: 12px 16px; cursor: pointer; transition: background 0.15s ease;
  border-bottom: 1px solid rgba(148,163,184,0.05);
}
.notif-item:last-child { border-bottom: none; }
.notif-item:hover { background: rgba(99,102,241,0.06); }
.notif-item.unread { background: rgba(99,102,241,0.04); }

.unread-dot {
  position: absolute; left: 6px; top: 50%; transform: translateY(-50%);
  width: 5px; height: 5px; border-radius: 50%; background: #6366f1; flex-shrink: 0;
}

.item-icon {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; background: rgba(99,102,241,0.12);
  border-radius: 8px; color: #6366f1; flex-shrink: 0; margin-top: 2px;
}

.item-body { flex: 1; min-width: 0; }
.item-title { font-size: 13px; color: #e2e8f0; margin-bottom: 4px; line-height: 1.4; font-weight: 500; }
.item-content {
  font-size: 12px; color: #94a3b8; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; line-height: 1.5;
}
.item-time { font-size: 11px; color: #475569; margin-top: 4px; }
</style>
