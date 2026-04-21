<template>
  <div class="study-page">
    <!-- 顶部导航栏 -->
    <div class="study-topbar">
      <div class="topbar-left">
        <button class="btn-back" @click="$router.push('/course')">← 返回列表</button>
        <span class="topbar-sep">|</span>
        <span class="course-name">{{ data.title }}</span>
        <span v-if="currentSection.title" class="section-name-bar">
          <span class="sep-arrow">›</span>
          {{ currentSection.title }}
        </span>
      </div>
      <div class="topbar-right">
        <span v-if="currentSection.freeFlag === 1" class="badge-free">免费试看</span>
      </div>
    </div>

    <!-- 主体：左侧视频 + 右侧面板 -->
    <div class="study-body">
      <!-- 左侧：视频播放器 -->
      <div class="video-col">
        <!-- 播放器 -->
        <div class="player-box">
          <video
            v-if="currentVideoUrl"
            ref="videoEl"
            :src="currentVideoUrl"
            controls
            class="video-el"
            @ended="onVideoEnded"
          />
          <div v-else class="player-placeholder">
            <div class="placeholder-inner">
              <div class="play-icon-big">▶</div>
              <p class="placeholder-tip">{{ currentSection.title ? '视频加载中...' : '请从右侧选择章节开始学习' }}</p>
            </div>
          </div>
        </div>

        <!-- 视频信息栏 -->
        <div class="video-info-bar">
          <div class="vi-left">
            <span class="vi-title">{{ currentSection.title || '请选择章节' }}</span>
            <span v-if="currentSection.duration" class="vi-duration">
              ⏱ {{ fmtDuration(currentSection.duration) }}
            </span>
          </div>
          <button class="btn-qa" @click="showQaPanel = !showQaPanel">
            💬 {{ showQaPanel ? '收起问题' : '有疑问？' }}
          </button>
        </div>

        <!-- 问题面板（折叠式，在视频下方） -->
        <div v-if="showQaPanel" class="qa-panel">
          <div class="qa-panel-header">
            <span class="qa-panel-title">问题列表</span>
            <button class="qa-close" @click="showQaPanel = false">✕</button>
          </div>
          <div v-if="qaLoading" class="qa-loading">加载中...</div>
          <div v-else-if="qaList.length === 0" class="qa-empty">暂无问题，快来提第一个问题吧</div>
          <div v-else class="qa-list">
            <div
              v-for="q in qaList"
              :key="q.id"
              class="qa-item"
              @click="toggleQa(q.id)"
            >
              <div class="qa-item-header">
                <span class="qa-q-icon">Q</span>
                <span class="qa-q-text">{{ q.content }}</span>
                <span class="qa-toggle">{{ expandedQa.has(q.id) ? '▲' : '▼' }}</span>
              </div>
              <div v-if="expandedQa.has(q.id)" class="qa-answers">
                <div v-if="!q.answers || q.answers.length === 0" class="qa-no-answer">暂无回答</div>
                <div v-for="a in q.answers" :key="a.id" class="qa-answer-item">
                  <span class="qa-a-icon">A</span>
                  <span class="qa-a-text">{{ a.content }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：章节目录 + 资料 -->
      <div class="sidebar-col">
        <!-- 资料下载（折叠） -->
        <div class="sidebar-section">
          <div class="sidebar-header" @click="toggleMaterials">
            <span class="sidebar-title">📦 课程资料</span>
            <span class="sidebar-toggle">{{ showMaterials ? '▲' : '▼' }}</span>
          </div>
          <div v-if="showMaterials" class="mat-list">
            <div v-if="materialsLoading" class="mat-tip">加载中...</div>
            <div v-else-if="materials.length === 0" class="mat-tip">暂无资料</div>
            <div v-for="mat in materials" :key="mat.id" class="mat-row">
              <span class="mat-icon">📄</span>
              <span class="mat-name">{{ mat.materialName || mat.name }}</span>
              <button class="mat-dl" @click="downloadMat(mat)">下载</button>
            </div>
          </div>
        </div>

        <!-- 章节目录 -->
        <div class="sidebar-section outline-section">
          <div class="sidebar-header-static">
            <span class="sidebar-title">📋 课程目录</span>
            <span class="section-count">{{ totalSections }} 节</span>
          </div>
          <div v-if="outlineLoading" class="mat-tip">加载中...</div>
          <div v-else class="outline-list">
            <div
              v-for="(chapter, ci) in outline"
              :key="chapter.id"
              class="chapter-group"
            >
              <!-- 章标题 -->
              <div class="chapter-title-row" @click="toggleChapter(chapter.id)">
                <span class="ch-badge">第{{ ci + 1 }}章</span>
                <span class="ch-name">{{ chapter.title }}</span>
                <span class="ch-count">{{ (chapter.children || []).length }}节</span>
                <span class="ch-arrow">{{ collapsedChapters.has(chapter.id) ? '▶' : '▼' }}</span>
              </div>
              <!-- 小节列表 -->
              <div v-show="!collapsedChapters.has(chapter.id)" class="section-list">
                <div
                  v-for="(section, si) in chapter.children || []"
                  :key="section.id"
                  class="section-item"
                  :class="{ active: currentSection.id === section.id }"
                  @click="selectSection(section)"
                >
                  <span class="sec-num">{{ ci + 1 }}.{{ si + 1 }}</span>
                  <span class="sec-dot" :class="section.sectionType === 'video' ? 'dot-video' : 'dot-text'" />
                  <span class="sec-name">{{ section.title }}</span>
                  <span v-if="section.freeFlag === 1" class="sec-free">免费</span>
                  <span v-if="currentSection.id === section.id" class="sec-playing">▶</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { fetchConfig } from '~/composables/useHttp';
import { getAuthHeaders, apiGetMaterialUrl } from '~/composables/Api/Course/course';

const props = defineProps({
  data: { type: Object, required: true },
});

const route = useRoute();
const courseId = computed(() => props.data?.id || route.params.id);

// ===== 当前播放小节 =====
const currentSection = ref({});
const currentVideoUrl = ref('');
const videoEl = ref(null);

// ===== 大纲 =====
const outline = ref([]);
const outlineLoading = ref(false);
const collapsedChapters = ref(new Set());

const totalSections = computed(() =>
  outline.value.reduce((sum, ch) => sum + (ch.children?.length || 0), 0)
);

function toggleChapter(id) {
  const s = new Set(collapsedChapters.value);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  collapsedChapters.value = s;
}

async function loadOutline() {
  outlineLoading.value = true;
  try {
    const res = await $fetch(`/course/section/outline/${courseId.value}`, {
      baseURL: fetchConfig.baseURL,
      headers: getAuthHeaders(),
    });
    if (res?.code === 200) {
      outline.value = (res.data || []).map(ch => ({
        ...ch,
        children: (ch.children || ch.sections || []).map(s => ({
          ...s,
          parentId: s.parentId || s.chapterId || ch.id,
        })),
      }));

      // 优先：URL 传入的 sectionId 定位到指定小节
      const targetId = route.query.sectionId ? String(route.query.sectionId) : null;
      if (targetId) {
        for (const ch of outline.value) {
          const found = (ch.children || []).find(s => String(s.id) === targetId);
          if (found) {
            selectSection(found);
            return;
          }
        }
      }

      // 其次：选第一个有视频的小节
      for (const ch of outline.value) {
        for (const s of ch.children || []) {
          if (s.mediaUrl && !s.mediaUrl.includes('pending')) {
            selectSection(s);
            return;
          }
        }
      }
      // 最后：选第一个小节
      const first = outline.value[0]?.children?.[0];
      if (first) selectSection(first);
    }
  } catch {}
  finally { outlineLoading.value = false; }
}

function selectSection(section) {
  currentSection.value = section;
  currentVideoUrl.value = section.mediaUrl && !section.mediaUrl.includes('pending')
    ? section.mediaUrl : '';
  // 加载该小节的问题
  loadQa(section.id);
}

function onVideoEnded() {
  // 自动播放下一节
  for (let ci = 0; ci < outline.value.length; ci++) {
    const children = outline.value[ci].children || [];
    for (let si = 0; si < children.length; si++) {
      if (children[si].id === currentSection.value.id) {
        const next = children[si + 1] || outline.value[ci + 1]?.children?.[0];
        if (next) selectSection(next);
        return;
      }
    }
  }
}

// ===== 资料 =====
const showMaterials = ref(false);
const materials = ref([]);
const materialsLoading = ref(false);

async function toggleMaterials() {
  showMaterials.value = !showMaterials.value;
  if (showMaterials.value && materials.value.length === 0) {
    materialsLoading.value = true;
    try {
      const res = await $fetch(`/course/${courseId.value}/materials`, {
        baseURL: fetchConfig.baseURL,
        headers: getAuthHeaders(),
      });
      if (res?.code === 200) materials.value = res.data || [];
    } catch {}
    finally { materialsLoading.value = false; }
  }
}

async function downloadMat(mat) {
  const id = mat.id || mat.materialId;
  if (!id) { window.open(mat.fileUrl || mat.url, '_blank'); return; }
  try {
    const res = await apiGetMaterialUrl(id, 120);
    window.open(res?.code === 200 && res.data ? res.data : (mat.fileUrl || mat.url), '_blank');
  } catch { window.open(mat.fileUrl || mat.url, '_blank'); }
}

// ===== 问题列表 =====
const showQaPanel = ref(false);
const qaLoading = ref(false);
const qaList = ref([]);
const expandedQa = ref(new Set());

async function loadQa(sectionId) {
  if (!sectionId) return;
  qaLoading.value = true;
  qaList.value = [];
  try {
    const res = await $fetch(`/course/section/questions/${courseId.value}/${sectionId}`, {
      baseURL: fetchConfig.baseURL,
      headers: getAuthHeaders(),
    });
    if (res?.code === 200) {
      qaList.value = res.data?.rows || res.data?.list || res.data || [];
    }
  } catch {}
  finally { qaLoading.value = false; }
}

function toggleQa(id) {
  const s = new Set(expandedQa.value);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  expandedQa.value = s;
}

// ===== 工具 =====
function fmtDuration(sec) {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

onMounted(loadOutline);
</script>

<style scoped>
/* ===== 整体布局 ===== */
.study-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #0f0f0f;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ===== 顶部导航 ===== */
.study-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 52px;
  background: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
  flex-shrink: 0;
}
.topbar-left { display: flex; align-items: center; gap: 10px; min-width: 0; overflow: hidden; }
.btn-back {
  background: none; border: 1px solid #444; color: #ccc;
  border-radius: 4px; padding: 5px 12px; font-size: 13px;
  cursor: pointer; white-space: nowrap; transition: all 0.2s; flex-shrink: 0;
}
.btn-back:hover { border-color: #18a058; color: #18a058; }
.topbar-sep { color: #444; flex-shrink: 0; }
.course-name { font-size: 14px; font-weight: 600; color: #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.section-name-bar { font-size: 13px; color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sep-arrow { color: #555; margin-right: 4px; }
.topbar-right { flex-shrink: 0; }
.badge-free { font-size: 12px; color: #18a058; border: 1px solid #18a058; padding: 2px 8px; border-radius: 10px; }

/* ===== 主体 ===== */
.study-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* ===== 左侧视频区 ===== */
.video-col {
  flex: 4;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
}

.player-box {
  background: #000;
  width: 100%;
  aspect-ratio: 16/9;
  flex-shrink: 0;
}
.video-el {
  width: 100%;
  height: 100%;
  display: block;
  background: #000;
}
.player-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at center, #1a1a2e 0%, #000 100%);
}
.placeholder-inner { text-align: center; }
.play-icon-big { font-size: 64px; color: rgba(255,255,255,0.15); margin-bottom: 16px; }
.placeholder-tip { font-size: 14px; color: #666; }

/* 视频信息栏 */
.video-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
  flex-shrink: 0;
}
.vi-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.vi-title { font-size: 15px; font-weight: 600; color: #eee; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vi-duration { font-size: 12px; color: #666; flex-shrink: 0; }
.btn-qa {
  background: #ff8c00; color: #fff; border: none;
  border-radius: 5px; padding: 7px 16px; font-size: 13px;
  cursor: pointer; font-weight: 500; flex-shrink: 0; transition: background 0.2s;
}
.btn-qa:hover { background: #e07800; }

/* 问题面板 */
.qa-panel {
  background: #1a1a1a;
  border-bottom: 1px solid #2a2a2a;
  max-height: 320px;
  overflow-y: auto;
}
.qa-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #2a2a2a;
  position: sticky;
  top: 0;
  background: #1a1a1a;
  z-index: 1;
}
.qa-panel-title { font-size: 14px; font-weight: 600; color: #eee; }
.qa-close { background: none; border: none; color: #666; font-size: 16px; cursor: pointer; padding: 0 4px; }
.qa-close:hover { color: #ccc; }
.qa-loading, .qa-empty { padding: 20px; font-size: 13px; color: #666; text-align: center; }
.qa-list { padding: 8px 0; }
.qa-item { border-bottom: 1px solid #222; }
.qa-item:last-child { border-bottom: none; }
.qa-item-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.15s;
}
.qa-item-header:hover { background: #222; }
.qa-q-icon {
  width: 20px; height: 20px; border-radius: 50%;
  background: #ff8c00; color: #fff; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
}
.qa-q-text { flex: 1; font-size: 13px; color: #ccc; line-height: 1.5; }
.qa-toggle { font-size: 10px; color: #555; flex-shrink: 0; margin-top: 4px; }
.qa-answers { padding: 0 20px 12px 50px; }
.qa-no-answer { font-size: 12px; color: #555; }
.qa-answer-item { display: flex; gap: 8px; margin-top: 8px; }
.qa-a-icon {
  width: 20px; height: 20px; border-radius: 50%;
  background: #18a058; color: #fff; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.qa-a-text { font-size: 13px; color: #aaa; line-height: 1.5; }

/* ===== 右侧侧边栏 ===== */
.sidebar-col {
  flex: 1;
  min-width: 260px;
  max-width: 320px;
  background: #141414;
  border-left: 1px solid #2a2a2a;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-section {
  border-bottom: 1px solid #2a2a2a;
  flex-shrink: 0;
}
.outline-section {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.outline-section .outline-list {
  flex: 1;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}
.sidebar-header:hover { background: #1e1e1e; }
.sidebar-header-static {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #2a2a2a;
}
.sidebar-title { font-size: 13px; font-weight: 600; color: #ccc; }
.sidebar-toggle { font-size: 10px; color: #555; }
.section-count { font-size: 12px; color: #555; }

/* 资料列表 */
.mat-list { padding: 8px 12px 12px; }
.mat-tip { font-size: 12px; color: #555; padding: 8px 4px; }
.mat-row {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 4px; border-bottom: 1px solid #1e1e1e;
}
.mat-row:last-child { border-bottom: none; }
.mat-icon { font-size: 14px; flex-shrink: 0; }
.mat-name { flex: 1; font-size: 12px; color: #aaa; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mat-dl {
  background: none; border: 1px solid #18a058; color: #18a058;
  border-radius: 3px; padding: 2px 8px; font-size: 11px; cursor: pointer;
  flex-shrink: 0; transition: all 0.15s;
}
.mat-dl:hover { background: #18a058; color: #fff; }

/* 章节目录 */
.outline-list { overflow-y: auto; }
.chapter-group { border-bottom: 1px solid #1e1e1e; }
.chapter-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  background: #1a1a1a;
  user-select: none;
  transition: background 0.15s;
}
.chapter-title-row:hover { background: #222; }
.ch-badge {
  font-size: 10px; color: #18a058; border: 1px solid #18a058;
  padding: 1px 5px; border-radius: 3px; flex-shrink: 0;
}
.ch-name { flex: 1; font-size: 13px; font-weight: 600; color: #ddd; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ch-count { font-size: 11px; color: #555; flex-shrink: 0; }
.ch-arrow { font-size: 9px; color: #555; flex-shrink: 0; }

.section-list { background: #111; }
.section-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 10px 24px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #1a1a1a;
}
.section-item:last-child { border-bottom: none; }
.section-item:hover { background: #1a1a1a; }
.section-item.active { background: #0d2818; border-left: 3px solid #18a058; padding-left: 21px; }
.sec-num { font-size: 11px; color: #555; width: 24px; flex-shrink: 0; }
.sec-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.dot-video { background: #2080f0; }
.dot-text { background: #18a058; }
.sec-name { flex: 1; font-size: 13px; color: #bbb; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.section-item.active .sec-name { color: #18a058; font-weight: 500; }
.sec-free { font-size: 10px; color: #18a058; border: 1px solid #18a058; padding: 1px 4px; border-radius: 3px; flex-shrink: 0; }
.sec-playing { font-size: 10px; color: #18a058; flex-shrink: 0; }
</style>
