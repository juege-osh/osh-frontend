<template>
  <div class="internal-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <n-icon size="22" color="#fff"><Globe /></n-icon>
        <span>内部网站</span>
      </div>
      <nav class="sidebar-nav">
        <nuxt-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="sidebar-item"
          :class="{ active: route.path === item.path }"
        >
          <n-icon size="16"><component :is="item.icon" /></n-icon>
          <span>{{ item.name }}</span>
        </nuxt-link>
      </nav>
      <div class="sidebar-footer">
        <nuxt-link to="/" class="sidebar-item back-btn">
          <n-icon size="16"><ArrowBack /></n-icon>
          <span>返回主站</span>
        </nuxt-link>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="internal-main">
      <!-- 顶部栏 -->
      <header class="internal-header">
        <div class="header-title">{{ currentTitle }}</div>
        <div class="header-right">
          <n-tag type="success" size="small" round>内部系统</n-tag>
          <n-avatar
            round
            size="small"
            :src="user?.avatar || 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'"
            style="margin-left:12px"
          />
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="internal-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { NIcon, NTag, NAvatar } from 'naive-ui'
import { Globe, List, Settings, ArrowBack, StatsChart } from '@vicons/ionicons5'

const route = useRoute()
const user = useUser()

const navItems = [
  { name: '网站列表', path: '/internal/sites', icon: List },
  { name: '状态总览', path: '/internal/dashboard', icon: StatsChart },
  { name: '设置', path: '/internal/settings', icon: Settings },
]

const titleMap = {
  '/internal/sites': '网站列表',
  '/internal/dashboard': '状态总览',
  '/internal/settings': '设置',
}
const currentTitle = computed(() => titleMap[route.path] || '内部网站')
</script>

<style scoped>
.internal-layout {
  display: flex;
  min-height: 100vh;
  background: #f0f2f5;
}

/* 侧边栏 */
.sidebar {
  width: 200px;
  min-height: 100vh;
  background: linear-gradient(180deg, #165d69 0%, #1a7a5e 100%);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255,255,255,0.15);
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
}

.sidebar-item:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
}

.sidebar-item.active {
  background: rgba(255,255,255,0.2);
  color: #fff;
  font-weight: 600;
}

.sidebar-footer {
  padding: 12px 8px;
  border-top: 1px solid rgba(255,255,255,0.15);
}

.back-btn {
  color: rgba(255,255,255,0.6);
}

/* 主内容 */
.internal-main {
  margin-left: 200px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.internal-header {
  height: 56px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.header-right {
  display: flex;
  align-items: center;
}

.internal-content {
  padding: 24px;
  flex: 1;
}
</style>
