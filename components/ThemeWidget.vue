<template>
  <div class="theme-widget" :class="{ 'is-open': isOpen }">
    <!-- 展开的主题列表 -->
    <transition name="widget-slide">
      <div v-if="isOpen" class="theme-panel">
        <div class="theme-panel-title">切换风格</div>
        <div class="theme-list">
          <button
            v-for="theme in themes"
            :key="theme.key"
            class="theme-item"
            :class="{ 'is-active': currentTheme === theme.key }"
            @click="selectTheme(theme.key)"
          >
            <span class="theme-item-preview" :style="{ background: theme.preview }"></span>
            <span class="theme-item-icon">{{ theme.icon }}</span>
            <span class="theme-item-name">{{ theme.name }}</span>
            <span v-if="currentTheme === theme.key" class="theme-item-check">✓</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- 触发按钮 -->
    <button class="theme-trigger" @click="isOpen = !isOpen" :title="isOpen ? '收起' : '切换风格'">
      <span class="trigger-icon" :class="{ 'is-spinning': isOpen }">
        {{ currentThemeObj?.icon || '☀️' }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const { currentTheme, initTheme, setTheme } = useTheme()

const isOpen = ref(false)

const themes = [
  {
    key: 'default',
    name: '默认风格',
    icon: '☀️',
    preview: 'linear-gradient(135deg, #7c3aed, #db2777)',
  },
  {
    key: 'space',
    name: '太空风格',
    icon: '🌙',
    preview: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)',
  },
]

const currentThemeObj = computed(() => themes.find(t => t.key === currentTheme.value))

const selectTheme = (key) => {
  setTheme(key)
  isOpen.value = false
}

onMounted(() => {
  initTheme()
})
</script>

<style scoped>
.theme-widget {
  position: fixed;
  bottom: 32px;
  left: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

/* 触发按钮 */
.theme-trigger {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.theme-trigger:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.trigger-icon {
  display: block;
  transition: transform 0.4s ease;
  line-height: 1;
}

.trigger-icon.is-spinning {
  transform: rotate(180deg);
}

/* 展开面板 */
.theme-panel {
  background: rgba(20, 20, 40, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  padding: 14px;
  min-width: 160px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}

.theme-panel-title {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
  padding: 0 4px;
}

.theme-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.theme-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  text-align: left;
}

.theme-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
}

.theme-item.is-active {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.theme-item-preview {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  flex-shrink: 0;
}

.theme-item-icon {
  font-size: 15px;
  flex-shrink: 0;
}

.theme-item-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  flex: 1;
}

.theme-item-check {
  font-size: 12px;
  font-weight: 700;
  color: #a78bfa;
}

/* 动画 */
.widget-slide-enter-active,
.widget-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom left;
}

.widget-slide-enter-from,
.widget-slide-leave-to {
  opacity: 0;
  transform: scale(0.85) translateY(8px);
}
</style>
