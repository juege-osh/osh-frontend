<template>
  <div class="lesson-page">
    <!-- 顶部 -->
    <div class="topbar">
      <div class="topbar-left">
        <span class="back-link" @click="router.back()">← 返回目录</span>
        <template v-if="breadcrumb.chapter">
          <span class="bc-sep">›</span>
          <span class="bc-item">{{ breadcrumb.chapter }}</span>
          <span class="bc-sep">›</span>
          <span class="bc-current">{{ form.title }}</span>
        </template>
      </div>
      <div class="topbar-right">
        <span v-if="form.freeFlag === 1" class="free-badge" @click="form.freeFlag = 0">免费试看</span>
        <span v-if="form.durationStr" class="duration-badge">⏱ {{ form.durationStr }}</span>
        <button class="btn-save-top" :disabled="saving" @click="handleSave">💾 保存</button>
      </div>
    </div>

    <div v-if="loading" class="page-loading"><n-spin description="加载中..." /></div>

    <div v-else class="lesson-body">
      <!-- 左侧 -->
      <div class="left-col">
        <!-- 基本信息 -->
        <div class="card">
          <div class="card-title"><span class="dot">●</span> 基本信息</div>
          <div class="field-row">
            <span class="field-label">小节标题</span>
            <input v-model="form.title" class="field-input" placeholder="请输入小节标题" />
          </div>
          <div v-if="isVideo" class="field-row">
            <span class="field-label">时长</span>
            <input v-model="form.durationStr" class="field-input" placeholder="如 25:30" />
          </div>
          <div class="field-row">
            <span class="field-label">免费试看</span>
            <n-switch v-model:value="form.freeFlag" :checked-value="1" :unchecked-value="0" />
          </div>
        </div>

        <!-- 课程视频卡片（视频类型始终显示） -->
        <div v-if="isVideo" class="card video-card">
          <div class="card-title-row">
            <div class="card-title"><span class="dot">●</span> 课程视频</div>
            <span class="link-btn-blue" @click="scrollToTop">顶部展示</span>
          </div>

          <!-- 视频播放器：有 src 就播放，没有就黑屏占位 -->
          <div class="video-player-wrap">
            <video
              ref="videoEl"
              :src="videoUrl || undefined"
              controls
              class="video-player"
            />
            <!-- 无视频时的上传提示覆盖层 -->
            <div v-if="!videoUrl" class="video-overlay" @click="videoInputRef?.click()">
              <span class="overlay-upload-text">点此上传</span>
            </div>
            <!-- 上传进度覆盖层 -->
            <div v-if="videoUploading" class="video-overlay uploading">
              <n-spin size="medium" />
              <p style="margin-top:10px;color:#fff;font-size:13px">上传中 {{ uploadProgress }}%</p>
              <n-progress type="line" :percentage="uploadProgress" style="width:180px;margin-top:6px" />
            </div>
          </div>

          <!-- URL 输入行 -->
          <div class="url-row">
            <input
              v-model="videoUrl"
              class="url-input"
              placeholder="粘贴视频地址（MP4/M3U8/CDN）"
              @keyup.enter="refreshVideo"
            />
            <button class="btn-preview" @click="refreshVideo">预览</button>
          </div>
          <p class="video-tip">⊙ 支持 MP4、WebM、M3U8 等格式，建议使用 CDN 地址</p>
          <div class="video-type-row">
            <span class="vt-label">视频类型</span>
            <label class="vt-radio"><input type="radio" v-model="form.videoType" value="mp4" /> MP4</label>
            <label class="vt-radio"><input type="radio" v-model="form.videoType" value="m3u8" /> M3U8 (HLS)</label>
            <label class="vt-radio"><input type="radio" v-model="form.videoType" value="webm" /> WebM</label>
          </div>

          <input ref="videoInputRef" type="file" accept="video/*" style="display:none" @change="onVideoFileChange" />
        </div>
      </div>

      <!-- 右侧：课程文档 -->
      <div class="right-col">
        <div class="doc-card">
          <div class="doc-header">
            <div class="doc-title">📄 课程文档</div>
            <span class="link-btn-orange" @click="docTab = docTab === 'split' ? 'edit' : 'split'">
              {{ docTab === 'split' ? '收起下方展示' : '展开下方展示' }}
            </span>
          </div>

          <div class="doc-toolbar">
            <div class="toolbar-btns">
              <button class="tb-btn fw-bold">B</button>
              <button class="tb-btn fw-italic">I</button>
              <button class="tb-btn fw-underline">U</button>
              <select class="tb-select"><option>Please Se...</option></select>
              <button class="tb-btn">≡</button>
              <button class="tb-btn">1</button>
              <button class="tb-btn">&lt;&gt;</button>
              <button class="tb-btn">🔗</button>
              <button class="tb-btn">🖼</button>
            </div>
            <div class="tab-group">
              <span class="tab-btn" :class="{ active: docTab === 'edit' }" @click="docTab = 'edit'">编辑</span>
              <span class="tab-btn" :class="{ active: docTab === 'preview' }" @click="docTab = 'preview'">预览</span>
              <span class="tab-btn" :class="{ active: docTab === 'split' }" @click="docTab = 'split'">分屏</span>
            </div>
          </div>

          <div class="doc-body" :class="{ 'is-split': docTab === 'split' }">
            <div class="edit-pane" v-show="docTab !== 'preview'">
              <textarea v-model="form.content" class="doc-textarea" placeholder="在此输入课程文档内容..." />
            </div>
            <div class="preview-pane" v-show="docTab === 'preview' || docTab === 'split'">
              <div class="preview-inner" v-html="renderedContent" />
            </div>
          </div>

          <div class="doc-footer">
            <span class="char-count">字符数：{{ form.content?.length || 0 }}</span>
            <span class="shortcut-tip">Ctrl+S 快速保存</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <div class="lesson-footer">
      <button class="btn-cancel" @click="router.back()">取消</button>
      <button class="btn-save-main" :disabled="saving" @click="handleSave">💾 保存课程内容</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createDiscreteApi } from 'naive-ui';
import { fetchConfig } from '~/composables/useHttp';
import { getAuthHeaders, apiGetSectionVideo, apiUploadVideo, apiGetVideoUrls } from '~/composables/Api/Course/course';

const route = useRoute();
const router = useRouter();
const { message } = createDiscreteApi(['message']);

const sectionId = Number(route.params.id);
const courseId = Number(route.query.courseId);

const loading = ref(true);
const saving = ref(false);
const sectionData = ref<any>(null);
const videoUrl = ref('');
const videoRelativePath = ref(''); // 存 OSS relativePath，保存到数据库用
const videoEl = ref<HTMLVideoElement | null>(null);
const videoInputRef = ref<HTMLInputElement | null>(null);
const videoUploading = ref(false);
const uploadProgress = ref(0);
const docTab = ref<'edit' | 'preview' | 'split'>('edit');
const breadcrumb = reactive({ chapter: '' });

const form = reactive({
  title: '', freeFlag: 0, durationStr: '', content: '', videoType: 'mp4',
});

const isVideo = computed(() => {
  // 兼容多种字段名：sectionType、type、mediaType
  const s = sectionData.value;
  if (!s) return true; // 默认显示视频区域
  const t = s.sectionType || s.type || s.mediaType || '';
  // 如果明确是 text/textContent 类型才不显示视频
  return !['text', 'textContent', 'article'].includes(String(t).toLowerCase());
});

const renderedContent = computed(() => {
  if (!form.content) return '<p style="color:#bbb;padding:16px">暂无内容</p>';
  return form.content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br/>');
});

onMounted(async () => {
  await loadData();
  loading.value = false;
  window.addEventListener('keydown', onKeyDown);
});
onUnmounted(() => window.removeEventListener('keydown', onKeyDown));

function onKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
}

async function loadData() {
  try {
    const res: any = await $fetch(`/course/section/outline/${courseId}`, {
      baseURL: fetchConfig.baseURL, headers: getAuthHeaders(),
    });
    if (res?.code === 200) {
      for (const chapter of res.data || []) {
        const sections = chapter.children || chapter.sections || [];
        const found = sections.find((s: any) => s.id === sectionId);
        if (found) {
          sectionData.value = found;
          console.log('[lesson] sectionData:', JSON.stringify(found));
          breadcrumb.chapter = chapter.title || '';
          form.title = found.title || '';
          form.freeFlag = found.freeFlag || 0;
          form.content = found.textContent || found.content || '';
          if (found.duration) form.durationStr = fmtDuration(found.duration);
          break;
        }
      }
    }
    if (sectionData.value?.sectionType === 'video') {
      try {
        const vRes: any = await apiGetSectionVideo(sectionId);
        if (vRes?.code === 200 && vRes.data?.videoUrl) {
          // 优先用临时URL接口获取可播放地址
          try {
            const urlRes: any = await apiGetVideoUrls(sectionId, 60);
            if (urlRes?.code === 200 && urlRes.data) {
              videoUrl.value = urlRes.data[sectionId] || urlRes.data || vRes.data.videoUrl;
            } else {
              videoUrl.value = vRes.data.videoUrl;
            }
          } catch {
            videoUrl.value = vRes.data.videoUrl;
          }
          if (vRes.data.duration && !form.durationStr) form.durationStr = fmtDuration(vRes.data.duration);
        }      } catch {}
    }
  } catch { message.error('加载数据失败'); }
}

// 刷新视频（回车或点预览）
function refreshVideo() {
  if (videoEl.value && videoUrl.value) {
    videoEl.value.load();
  }
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

function onVideoFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) uploadVideo(f);
  (e.target as HTMLInputElement).value = '';
}
async function uploadVideo(file: File) {
  videoUploading.value = true; uploadProgress.value = 10;
  const t = setInterval(() => { if (uploadProgress.value < 85) uploadProgress.value += 4; }, 600);
  try {
    const res: any = await apiUploadVideo(file, file.name);
    clearInterval(t); uploadProgress.value = 100;
    if (res?.code === 200) {
      message.success('视频上传成功');
      // 存 relativePath 用于保存到数据库
      videoRelativePath.value = res.data?.relativePath || '';
      // 用临时URL展示播放
      videoUrl.value = res.data?.url || '';
    } else message.error(res?.msg || '上传失败');
  } catch { clearInterval(t); message.error('上传失败'); }
  finally { videoUploading.value = false; uploadProgress.value = 0; }
}

async function handleSave() {
  if (!form.title.trim()) { message.warning('请输入小节标题'); return; }
  saving.value = true;
  try {
    const endpoint = isVideo.value ? '/course/section/video/save' : '/course/section/textContent/save';
    const body: any = {
      id: sectionId,
      courseId,
      parentId: sectionData.value?.parentId || sectionData.value?.chapterId,
      title: form.title.trim(),
      freeFlag: form.freeFlag,
      sort: sectionData.value?.sort || 1,
      textContent: form.content,
      content: form.content,
    };
    if (isVideo.value) {
      body.mediaUrl = videoRelativePath.value || sectionData.value?.mediaUrl || 'pending';
      body.fileSize = sectionData.value?.fileSize || 0;
      body.duration = parseDuration(form.durationStr);
    }
    const res: any = await $fetch(endpoint, {
      method: 'POST', baseURL: fetchConfig.baseURL, headers: getAuthHeaders(), body,
    });
    if (res?.code === 200) message.success('保存成功');
    else message.error(res?.msg || '保存失败');
  } catch { message.error('保存失败'); }
  finally { saving.value = false; }
}

function fmtDuration(s: number) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
function parseDuration(str: string) {
  if (!str) return 0;
  const p = str.split(':');
  return p.length === 2 ? Number(p[0]) * 60 + Number(p[1]) : Number(str) || 0;
}
</script>

<style scoped>
/* 撑满整个视口，覆盖 layout */
.lesson-page {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  z-index: 50;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 顶部 */
.topbar {
  height: 50px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.topbar-left { display: flex; align-items: center; gap: 8px; font-size: 13px; min-width: 0; overflow: hidden; }
.back-link { color: #18a058; cursor: pointer; font-weight: 500; white-space: nowrap; flex-shrink: 0; }
.back-link:hover { text-decoration: underline; }
.bc-sep { color: #ccc; flex-shrink: 0; }
.bc-item { color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.bc-current { color: #333; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.free-badge { font-size: 12px; color: #18a058; border: 1px solid #18a058; padding: 2px 8px; border-radius: 3px; cursor: pointer; }
.duration-badge { font-size: 13px; color: #666; }
.btn-save-top {
  background: #18a058; color: #fff; border: none;
  border-radius: 4px; padding: 6px 18px; font-size: 13px; cursor: pointer; font-weight: 500;
}
.btn-save-top:hover { background: #0e7a3e; }
.btn-save-top:disabled { opacity: 0.6; cursor: not-allowed; }

.page-loading { flex: 1; display: flex; justify-content: center; align-items: center; }

/* 主体 */
.lesson-body {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 0;
  overflow: hidden;
  min-height: 0;
}

/* 左侧 */
.left-col {
  overflow-y: auto;
  padding: 14px 12px 14px 14px;
  border-right: 1px solid #e8e8e8;
  background: #f0f2f5;
}

/* 右侧 */
.right-col {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 14px 14px 14px 12px;
  min-height: 0;
}

/* 卡片 */
.card {
  background: #fff;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #e8e8e8;
}
.card-title {
  font-size: 14px; font-weight: 600; color: #333;
  margin-bottom: 14px; display: flex; align-items: center; gap: 6px;
}
.dot { color: #18a058; }
.card-title-row {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
}
.card-title-row .card-title { margin-bottom: 0; }
.link-btn-blue { font-size: 12px; color: #2080f0; cursor: pointer; }
.link-btn-blue:hover { text-decoration: underline; }
.link-btn-orange { font-size: 12px; color: #f57c00; cursor: pointer; }
.link-btn-orange:hover { text-decoration: underline; }

/* 表单 */
.field-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.field-label { font-size: 13px; color: #666; width: 56px; flex-shrink: 0; }
.field-input {
  flex: 1; border: 1px solid #d9d9d9; border-radius: 4px;
  padding: 6px 10px; font-size: 13px; outline: none; transition: border-color 0.2s;
}
.field-input:focus { border-color: #18a058; }

/* 视频卡片 */
.video-card { padding: 14px; }

.video-player-wrap {
  position: relative;
  width: 100%;
  background: #1a1a1a;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
  aspect-ratio: 16/9;
}
.video-player {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}
.video-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.video-overlay.uploading { background: rgba(0,0,0,0.7); }
.overlay-upload-text {
  color: #fff;
  font-size: 14px;
  background: rgba(255,255,255,0.15);
  padding: 8px 20px;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.3);
}
.overlay-upload-text:hover { background: rgba(255,255,255,0.25); }

.url-row { display: flex; gap: 6px; margin-bottom: 6px; }
.url-input {
  flex: 1; border: 1px solid #d9d9d9; border-radius: 4px;
  padding: 5px 8px; font-size: 12px; color: #555; outline: none;
}
.url-input:focus { border-color: #18a058; }
.btn-preview {
  background: #18a058; color: #fff; border: none;
  border-radius: 4px; padding: 5px 12px; font-size: 12px; cursor: pointer; white-space: nowrap;
}
.btn-preview:hover { background: #0e7a3e; }
.video-tip { font-size: 11px; color: #999; margin: 0 0 8px; }
.video-type-row { display: flex; align-items: center; gap: 14px; font-size: 12px; }
.vt-label { color: #666; }
.vt-radio { display: flex; align-items: center; gap: 4px; cursor: pointer; color: #555; }

/* 文档区 */
.doc-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  overflow: hidden;
  min-height: 0;
}
.doc-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
}
.doc-title { font-size: 14px; font-weight: 600; color: #333; }

.doc-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 12px; border-bottom: 1px solid #f0f0f0; background: #fafafa; flex-shrink: 0;
}
.toolbar-btns { display: flex; align-items: center; gap: 2px; }
.tb-btn {
  background: none; border: none; padding: 4px 7px; font-size: 13px;
  cursor: pointer; border-radius: 3px; color: #555;
}
.tb-btn:hover { background: #e8e8e8; }
.fw-bold { font-weight: bold; }
.fw-italic { font-style: italic; }
.fw-underline { text-decoration: underline; }
.tb-select {
  border: 1px solid #e0e0e0; border-radius: 3px; padding: 3px 6px;
  font-size: 12px; color: #666; background: #fff; cursor: pointer;
}
.tab-group { display: flex; }
.tab-btn {
  padding: 4px 12px; font-size: 13px; color: #666; cursor: pointer;
  border: 1px solid #e0e0e0; background: #fff; margin-left: -1px; transition: all 0.15s;
}
.tab-btn:first-child { border-radius: 4px 0 0 4px; }
.tab-btn:last-child { border-radius: 0 4px 4px 0; }
.tab-btn.active { background: #18a058; color: #fff; border-color: #18a058; z-index: 1; }

.doc-body { flex: 1; display: flex; overflow: hidden; min-height: 0; }
.edit-pane { flex: 1; display: flex; min-width: 0; }
.doc-body.is-split .edit-pane { border-right: 1px solid #f0f0f0; }
.doc-textarea {
  flex: 1; width: 100%; border: none; outline: none;
  padding: 16px; font-size: 14px; line-height: 1.7; resize: none;
  font-family: 'Courier New', monospace; color: #333; background: #fff;
}
.preview-pane { flex: 1; overflow-y: auto; padding: 16px; min-width: 0; }
.preview-inner { font-size: 14px; line-height: 1.7; color: #333; }

.doc-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 16px; border-top: 1px solid #f0f0f0; background: #fafafa; flex-shrink: 0;
}
.char-count { font-size: 12px; color: #999; }
.shortcut-tip { font-size: 12px; color: #bbb; }

/* 底部 */
.lesson-footer {
  height: 56px;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 20px; background: #fff; border-top: 1px solid #e8e8e8; flex-shrink: 0;
}
.btn-cancel {
  background: #fff; color: #666; border: 1px solid #d9d9d9;
  border-radius: 4px; padding: 7px 20px; font-size: 13px; cursor: pointer;
}
.btn-cancel:hover { border-color: #999; }
.btn-save-main {
  background: #18a058; color: #fff; border: none;
  border-radius: 4px; padding: 8px 24px; font-size: 14px; cursor: pointer; font-weight: 500;
}
.btn-save-main:hover { background: #0e7a3e; }
.btn-save-main:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
