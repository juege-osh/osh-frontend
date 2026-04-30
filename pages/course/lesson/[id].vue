<template>
  <div class="lesson-page">
    <!-- 顶部导航 -->
    <div class="topbar">
      <div class="topbar-left">
        <span class="back-link" @click="router.back()">← 返回目录</span>
        <template v-if="breadcrumb.chapter">
          <span class="bc-sep">›</span>
          <span class="bc-item">{{ breadcrumb.chapter }}</span>
          <span class="bc-sep">›</span>
          <span class="bc-current">{{ form.title || '小节编辑' }}</span>
        </template>
      </div>
      <div class="topbar-right">
        <span v-if="form.freeFlag === 1" class="free-badge">免费试看</span>
        <span v-if="form.durationStr" class="duration-badge">⏱ {{ form.durationStr }}</span>
        <button class="btn-save-top" :class="{ loading: saving }" :disabled="saving" @click="handleSave">
          {{ saving ? '保存中...' : '💾 保存' }}
        </button>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="page-loading">
      <n-spin size="large" description="加载小节数据..." />
    </div>

    <!-- 主体 -->
    <div v-else class="lesson-body">
      <!-- 左侧面板 -->
      <div class="left-col">
        <!-- 基本信息卡片 -->
        <div class="card">
          <div class="card-title">
            <span class="dot green">●</span> 基本信息
          </div>
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
            <n-switch v-model:value="form.freeFlag" :checked-value="1" :unchecked-value="0">
              <template #checked>是</template>
              <template #unchecked>否</template>
            </n-switch>
          </div>
        </div>

        <!-- 视频卡片 -->
        <div v-if="isVideo" class="card video-card">
          <div class="card-title-row">
            <div class="card-title"><span class="dot green">●</span> 课程视频</div>
            <span class="action-text blue" @click="scrollToTop">顶部展示</span>
          </div>

          <!-- 播放器 / 上传区 -->
          <div class="video-wrap">
            <!-- 有有效视频：显示播放器 -->
            <template v-if="validVideoUrl">
              <video ref="videoEl" :src="validVideoUrl" controls class="video-player" />
              <div class="video-actions">
                <button class="btn-reupload" @click="videoInputRef?.click()">🔄 重新上传</button>
              </div>
            </template>

            <!-- 无视频：上传区 -->
            <div v-else class="upload-zone" @click="videoInputRef?.click()" @dragover.prevent @drop.prevent="onVideoDrop">
              <template v-if="!videoUploading">
                <div class="upload-icon">⬆</div>
                <p class="upload-hint">点击或拖拽视频文件上传</p>
                <p class="upload-sub">支持 MP4 / MOV / AVI，建议 ≤ 2GB</p>
              </template>
              <template v-else>
                <n-spin size="medium" />
                <p class="upload-progress-text">上传中 {{ uploadProgress }}%</p>
                <n-progress type="line" :percentage="uploadProgress" style="width:200px;margin-top:6px" />
              </template>
            </div>
          </div>

          <!-- URL 输入 -->
          <div class="url-row">
            <input v-model="videoUrl" class="url-input" placeholder="或粘贴视频地址（MP4/M3U8/CDN）" @keyup.enter="refreshVideo" />
            <button class="btn-sm-green" @click="refreshVideo">预览</button>
          </div>
          <p class="video-tip">⊙ 支持 MP4、WebM、M3U8 格式，建议使用 CDN 地址</p>
          <div class="video-type-row">
            <span class="vt-label">视频类型</span>
            <label class="vt-radio"><input type="radio" v-model="form.videoType" value="mp4" /> MP4</label>
            <label class="vt-radio"><input type="radio" v-model="form.videoType" value="m3u8" /> M3U8 (HLS)</label>
            <label class="vt-radio"><input type="radio" v-model="form.videoType" value="webm" /> WebM</label>
          </div>
          <input ref="videoInputRef" type="file" accept="video/*" style="display:none" @
                 
                 ="onVideoFileChange" />
        </div>
      </div>

      <!-- 右侧：文档编辑器 -->
      <div class="right-col">
        <DocEditor
          v-model="form.content"
          placeholder="在此输入课程文档内容..."
          style="height:100%;border:1px solid #e8e8e8;border-radius:6px;"
        />
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="lesson-footer">
      <button class="btn-cancel" @click="router.back()">取消</button>
      <div class="footer-right">
        <span class="save-tip">Ctrl+S 快速保存</span>
        <button class="btn-save-main" :disabled="saving" @click="handleSave">
          💾 保存课程内容
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { createDiscreteApi, NSwitch } from 'naive-ui';
import { fetchConfig } from '~/composables/useHttp';
import { getAuthHeaders, apiUploadVideo } from '~/composables/Api/Course/course';
import DocEditor from '~/components/Course/edit/DocEditor.vue';

const route = useRoute();
const router = useRouter();
const { message } = createDiscreteApi(['message']);

const sectionId = Number(route.params.id);
const courseId = Number(route.query.courseId);
// chapterId 从 URL query 传入，作为 parentId 的兜底
const chapterIdFromQuery = Number(route.query.chapterId) || 0;

// 状态
const loading = ref(true);
const saving = ref(false);
const sectionData = ref<any>(null);
const breadcrumb = reactive({ chapter: '' });

// 视频
const videoUrl = ref('');
const videoRelativePath = ref('');
const videoEl = ref<HTMLVideoElement | null>(null);
const videoInputRef = ref<HTMLInputElement | null>(null);
const videoUploading = ref(false);
const uploadProgress = ref(0);

// 表单
const form = reactive({
  title: '',
  freeFlag: 0,
  durationStr: '',
  content: '',
  videoType: 'mp4',
});

// 是否视频类型
const isVideo = computed(() => {
  const s = sectionData.value;
  if (!s) return true;
  const t = String(s.sectionType || s.type || '').toLowerCase();
  return !['text', 'textcontent', 'article'].includes(t);
});

// 有效视频URL（过滤 pending 占位）
const validVideoUrl = computed(() => {
  const url = videoUrl.value;
  if (!url) return '';
  if (url.includes('osh/pending') || url === 'pending') return '';
  return url;
});

// 初始化
onMounted(async () => {
  await loadData();
  loading.value = false;
  window.addEventListener('keydown', onKeyDown);
});
onUnmounted(() => window.removeEventListener('keydown', onKeyDown));

function onKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    handleSave();
  }
}

// 加载小节数据（从大纲接口）
async function loadData() {
  try {
    const res: any = await $fetch(`/course/section/outline/${courseId}`, {
      baseURL: fetchConfig.baseURL,
      headers: getAuthHeaders(),
    });
    if (res?.code === 200) {
      for (const chapter of res.data || []) {
        const sections = chapter.children || chapter.sections || [];
        // 用字符串比较，避免雪花ID精度问题
        const found = sections.find((s: any) => String(s.id) === String(sectionId));
        if (found) {
          const resolvedParentId = found.parentId || found.chapterId || found.parent_id || chapter.id || chapter.sectionId || chapterIdFromQuery;
          sectionData.value = { ...found, parentId: resolvedParentId };
          breadcrumb.chapter = chapter.title || '';
          form.title = found.title || '';
          form.freeFlag = found.freeFlag ?? 0;
          form.content = found.textContent || found.content || '';
          if (found.duration) form.durationStr = fmtDuration(found.duration);
          if (found.mediaUrl) videoUrl.value = found.mediaUrl;
          return;
        }
      }
    }
  } catch (e) {
    console.error('[lesson] loadData error:', e);
    message.error('加载数据失败');
    return;
  }

  // 大纲遍历找不到时，直接查单个小节接口
  try {
    const res2: any = await $fetch(`/course/section/detail/${sectionId}`, {
      baseURL: fetchConfig.baseURL,
      headers: getAuthHeaders(),
    });
    if (res2?.code === 200 && res2.data) {
      const found = res2.data;
      const resolvedParentId = found.parentId || found.chapterId || chapterIdFromQuery || null;
      sectionData.value = { ...found, parentId: resolvedParentId };
      form.title = found.title || '';
      form.freeFlag = found.freeFlag ?? 0;
      form.content = found.textContent || found.content || '';
      if (found.duration) form.durationStr = fmtDuration(found.duration);
      if (found.mediaUrl) videoUrl.value = found.mediaUrl;
      return;
    }
  } catch {}

  // 最终兜底：至少保证 parentId 有值，不影响保存
  sectionData.value = {
    parentId: chapterIdFromQuery || null,
    sort: 1,
    freeFlag: 0,
    fileSize: 0,
    duration: 0,
  };
}

// 视频上传
function onVideoDrop(e: DragEvent) {
  const f = e.dataTransfer?.files?.[0];
  if (f) uploadVideo(f);
}
function onVideoFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) uploadVideo(f);
  (e.target as HTMLInputElement).value = '';
}

async function uploadVideo(file: File) {
  videoUploading.value = true;
  uploadProgress.value = 10;
  const timer = setInterval(() => {
    if (uploadProgress.value < 85) uploadProgress.value += 4;
  }, 600);
  try {
    const res: any = await apiUploadVideo(file, file.name);
    clearInterval(timer);
    uploadProgress.value = 100;
    if (res?.code === 200) {
      videoRelativePath.value = res.data?.relativePath || '';
      videoUrl.value = res.data?.url || '';
      message.success('视频上传成功');
      // 后台静默保存
      autoSaveVideo();
    } else {
      message.error(res?.msg || '上传失败');
    }
  } catch {
    clearInterval(timer);
    message.error('视频上传失败');
  } finally {
    videoUploading.value = false;
    uploadProgress.value = 0;
  }
}

// 上传后静默保存 relativePath 到数据库
async function autoSaveVideo() {
  if (!videoRelativePath.value) return;
  try {
    await $fetch('/course/section/video/save', {
      method: 'POST',
      baseURL: fetchConfig.baseURL,
      headers: getAuthHeaders(),
      body: {
        id: sectionId,
        courseId,
        parentId: sectionData.value?.parentId,
        title: form.title.trim() || sectionData.value?.title,
        freeFlag: form.freeFlag,
        sort: sectionData.value?.sort || 1,
        mediaUrl: videoRelativePath.value, // 只传 relativePath
        fileSize: sectionData.value?.fileSize || 0,
        duration: parseDuration(form.durationStr),
      },
    });
  } catch {}
}

// 刷新视频播放
function refreshVideo() {
  if (videoEl.value) videoEl.value.load();
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 保存小节（更新，因为 id 存在后端走 update）
async function handleSave() {
  if (!form.title.trim()) { message.warning('请输入小节标题'); return; }
  saving.value = true;
  try {
    const isVid = isVideo.value;
    const endpoint = isVid ? '/course/section/video/save' : '/course/section/textContent/save';
    const parentId = sectionData.value?.parentId || chapterIdFromQuery || null;
    console.log('[lesson] handleSave parentId:', parentId, 'sectionData:', JSON.stringify(sectionData.value));
    if (!parentId) {
      message.error('无法获取父章节ID，请返回目录重新进入');
      saving.value = false;
      return;
    }
    const body: any = {
      id: sectionId,
      courseId,
      parentId,
      title: form.title.trim(),
      freeFlag: form.freeFlag,
      sort: sectionData.value?.sort || 1,
      textContent: form.content,
      content: form.content,
    };
    if (isVid) {
      // 只有新上传了视频才传 relativePath，否则不传 mediaUrl，后端保持数据库原值
      if (videoRelativePath.value) {
        body.mediaUrl = videoRelativePath.value;
      }
      body.fileSize = sectionData.value?.fileSize || 0;
      body.duration = parseDuration(form.durationStr);
    }
    const res: any = await $fetch(endpoint, {
      method: 'POST',
      baseURL: fetchConfig.baseURL,
      headers: getAuthHeaders(),
      body,
    });
    if (res?.code === 200) {
      message.success('保存成功 ✓');
    } else {
      message.error(res?.msg || '保存失败');
    }
  } catch {
    message.error('保存失败，请重试');
  } finally {
    saving.value = false;
  }
}

// 工具函数
function fmtDuration(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
function parseDuration(str: string) {
  if (!str) return 0;
  const p = str.split(':');
  return p.length === 2 ? Number(p[0]) * 60 + Number(p[1]) : Number(str) || 0;
}
</script>

<style scoped>
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
  height: 52px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.topbar-left { display: flex; align-items: center; gap: 8px; font-size: 13px; min-width: 0; overflow: hidden; }
.back-link { color: #18a058; cursor: pointer; font-weight: 500; white-space: nowrap; flex-shrink: 0; }
.back-link:hover { text-decoration: underline; }
.bc-sep { color: #ddd; flex-shrink: 0; }
.bc-item { color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
.bc-current { color: #333; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.free-badge { font-size: 12px; color: #18a058; border: 1px solid #18a058; padding: 2px 8px; border-radius: 10px; }
.duration-badge { font-size: 13px; color: #888; }
.btn-save-top {
  background: #18a058; color: #fff; border: none;
  border-radius: 5px; padding: 7px 18px; font-size: 13px; cursor: pointer; font-weight: 500;
  transition: background 0.2s;
}
.btn-save-top:hover { background: #0e7a3e; }
.btn-save-top:disabled, .btn-save-top.loading { opacity: 0.7; cursor: not-allowed; }

.page-loading { flex: 1; display: flex; justify-content: center; align-items: center; }

/* 主体布局 */
.lesson-body {
  flex: 1;
  display: grid;
  grid-template-columns: 290px 1fr;
  overflow: hidden;
  min-height: 0;
}

/* 左侧 */
.left-col {
  overflow-y: auto;
  padding: 14px;
  border-right: 1px solid #e8e8e8;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 右侧 */
.right-col {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 14px;
  min-height: 0;
}

/* 卡片 */
.card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.card-title {
  font-size: 14px; font-weight: 600; color: #222;
  margin-bottom: 14px; display: flex; align-items: center; gap: 6px;
}
.dot { font-size: 10px; }
.dot.green { color: #18a058; }
.card-title-row {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
}
.card-title-row .card-title { margin-bottom: 0; }
.action-text { font-size: 12px; cursor: pointer; }
.action-text.blue { color: #2080f0; }
.action-text.blue:hover { text-decoration: underline; }

/* 表单 */
.field-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.field-row:last-child { margin-bottom: 0; }
.field-label { font-size: 13px; color: #666; width: 56px; flex-shrink: 0; }
.field-input {
  flex: 1; border: 1px solid #d9d9d9; border-radius: 5px;
  padding: 7px 10px; font-size: 13px; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
}
.field-input:focus { border-color: #18a058; box-shadow: 0 0 0 2px rgba(24,160,88,0.1); }

/* 视频 */
.video-card { padding: 14px; }
.video-wrap {
  width: 100%;
  background: #111;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
  aspect-ratio: 16/9;
  position: relative;
}
.video-player { width: 100%; height: 100%; display: block; object-fit: contain; }
.video-actions {
  position: absolute; bottom: 8px; right: 8px;
}
.btn-reupload {
  background: rgba(0,0,0,0.5); color: #fff; border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px; padding: 4px 10px; font-size: 12px; cursor: pointer;
  backdrop-filter: blur(4px);
}
.btn-reupload:hover { background: rgba(0,0,0,0.7); }

.upload-zone {
  width: 100%; height: 100%;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  cursor: pointer; background: #1a1a1a; transition: background 0.2s;
}
.upload-zone:hover { background: #222; }
.upload-icon { font-size: 32px; color: #666; }
.upload-hint { margin: 8px 0 4px; font-size: 13px; color: #aaa; }
.upload-sub { font-size: 11px; color: #666; margin: 0; }
.upload-progress-text { margin-top: 10px; color: #ccc; font-size: 13px; }

.url-row { display: flex; gap: 6px; margin-bottom: 6px; }
.url-input {
  flex: 1; border: 1px solid #d9d9d9; border-radius: 4px;
  padding: 5px 8px; font-size: 12px; color: #555; outline: none;
}
.url-input:focus { border-color: #18a058; }
.btn-sm-green {
  background: #18a058; color: #fff; border: none;
  border-radius: 4px; padding: 5px 12px; font-size: 12px; cursor: pointer;
}
.btn-sm-green:hover { background: #0e7a3e; }
.video-tip { font-size: 11px; color: #999; margin: 0 0 8px; }
.video-type-row { display: flex; align-items: center; gap: 12px; font-size: 12px; }
.vt-label { color: #666; }
.vt-radio { display: flex; align-items: center; gap: 4px; cursor: pointer; color: #555; }

/* 底部 */
.lesson-footer {
  height: 58px;
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 20px; background: #fff; border-top: 1px solid #e8e8e8; flex-shrink: 0;
}
.footer-right { display: flex; align-items: center; gap: 12px; }
.save-tip { font-size: 12px; color: #bbb; }
.btn-cancel {
  background: #fff; color: #666; border: 1px solid #d9d9d9;
  border-radius: 5px; padding: 8px 20px; font-size: 13px; cursor: pointer;
}
.btn-cancel:hover { border-color: #999; color: #333; }
.btn-save-main {
  background: #18a058; color: #fff; border: none;
  border-radius: 5px; padding: 9px 26px; font-size: 14px; cursor: pointer; font-weight: 500;
  transition: background 0.2s;
}
.btn-save-main:hover { background: #0e7a3e; }
.btn-save-main:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
