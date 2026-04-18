<template>
  <div class="doc-editor" @click.stop>
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <!-- 标题下拉 -->
        <div class="tb-dropdown" @mousedown.prevent @click.stop="showHeadingMenu = !showHeadingMenu">
          <span class="tb-dropdown-label">{{ currentBlockLabel }}</span>
          <span class="tb-dropdown-arrow">▾</span>
          <div v-if="showHeadingMenu" class="tb-dropdown-menu">
            <div class="menu-item" @mousedown.prevent @click="execCmd('formatBlock', 'p')">正文</div>
            <div class="menu-item h1" @mousedown.prevent @click="execCmd('formatBlock', 'h1')">H1 一级标题</div>
            <div class="menu-item h2" @mousedown.prevent @click="execCmd('formatBlock', 'h2')">H2 二级标题</div>
            <div class="menu-item h3" @mousedown.prevent @click="execCmd('formatBlock', 'h3')">H3 三级标题</div>
            <div class="menu-item h4" @mousedown.prevent @click="execCmd('formatBlock', 'h4')">H4 四级标题</div>
            <div class="menu-item blockquote" @mousedown.prevent @click="execCmd('formatBlock', 'blockquote')">引用块</div>
            <div class="menu-item pre" @mousedown.prevent @click="execCmd('formatBlock', 'pre')">代码块</div>
          </div>
        </div>

        <div class="tb-divider" />

        <!-- 格式按钮 -->
        <button class="tb-btn bold" :class="{ active: states.bold }" title="加粗 (Ctrl+B)" @mousedown.prevent @click="execCmd('bold')"><b>B</b></button>
        <button class="tb-btn italic" :class="{ active: states.italic }" title="斜体 (Ctrl+I)" @mousedown.prevent @click="execCmd('italic')"><i>I</i></button>
        <button class="tb-btn underline" :class="{ active: states.underline }" title="下划线 (Ctrl+U)" @mousedown.prevent @click="execCmd('underline')"><u>U</u></button>
        <button class="tb-btn strikethrough" :class="{ active: states.strikethrough }" title="删除线" @mousedown.prevent @click="execCmd('strikeThrough')"><s>S</s></button>

        <div class="tb-divider" />

        <!-- 颜色 -->
        <div class="tb-color-wrap" title="文字颜色">
          <span class="tb-color-icon" :style="{ borderBottom: `3px solid ${currentColor}` }">A</span>
          <input type="color" class="tb-color-input" v-model="currentColor" @change="execCmd('foreColor', currentColor)" />
        </div>

        <div class="tb-divider" />

        <!-- 对齐 -->
        <button class="tb-btn" title="左对齐" @mousedown.prevent @click="execCmd('justifyLeft')">⬅</button>
        <button class="tb-btn" title="居中" @mousedown.prevent @click="execCmd('justifyCenter')">☰</button>
        <button class="tb-btn" title="右对齐" @mousedown.prevent @click="execCmd('justifyRight')">➡</button>

        <div class="tb-divider" />

        <!-- 列表 -->
        <button class="tb-btn" title="无序列表" @mousedown.prevent @click="execCmd('insertUnorderedList')">≡</button>
        <button class="tb-btn" title="有序列表" @mousedown.prevent @click="execCmd('insertOrderedList')">1.</button>

        <div class="tb-divider" />

        <!-- 缩进 -->
        <button class="tb-btn" title="增加缩进" @mousedown.prevent @click="execCmd('indent')">→</button>
        <button class="tb-btn" title="减少缩进" @mousedown.prevent @click="execCmd('outdent')">←</button>

        <div class="tb-divider" />

        <!-- 格式刷 -->
        <button class="tb-btn format-brush" :class="{ active: formatBrushActive }" title="格式刷" @mousedown.prevent @click="toggleFormatBrush">🖌</button>

        <!-- 链接 -->
        <button class="tb-btn" title="插入链接 (Ctrl+K)" @mousedown.prevent @click="insertLink">🔗</button>

        <!-- 图片 -->
        <div class="tb-img-wrap">
          <button class="tb-btn" title="插入图片" @mousedown.prevent @click.stop="showImgMenu = !showImgMenu">🖼</button>
          <div v-if="showImgMenu" class="tb-img-menu" @click.stop>
            <div class="img-menu-title">插入图片</div>
            <div class="img-menu-row">
              <input
                v-model="imgUrlInput"
                class="img-url-input"
                placeholder="粘贴图片链接..."
                @keyup.enter="insertImageByUrl"
              />
              <button class="img-btn-confirm" @mousedown.prevent @click="insertImageByUrl">插入</button>
            </div>
            <div class="img-menu-divider">或</div>
            <button class="img-btn-upload" @mousedown.prevent @click="imgFileRef?.click()">
              📁 从本地上传
            </button>
            <input ref="imgFileRef" type="file" accept="image/*" style="display:none" @change="handleImgUpload" />
          </div>
        </div>

        <!-- 分割线 -->
        <button class="tb-btn" title="插入分割线" @mousedown.prevent @click="insertHr">—</button>

        <!-- 清除格式 -->
        <button class="tb-btn" title="清除格式" @mousedown.prevent @click="execCmd('removeFormat')">✕</button>
      </div>

      <div class="toolbar-right">
        <div class="view-tabs">
          <span class="view-tab" :class="{ active: viewMode === 'edit' }" @click="viewMode = 'edit'">编辑</span>
          <span class="view-tab" :class="{ active: viewMode === 'preview' }" @click="viewMode = 'preview'">预览</span>
          <span class="view-tab" :class="{ active: viewMode === 'split' }" @click="viewMode = 'split'">分屏</span>
        </div>
      </div>
    </div>

    <!-- 编辑区 -->
    <div
      class="editor-body"
      :class="`mode-${viewMode}`"
      @drop.prevent="onEditorDrop"
      @dragover.prevent
    >
      <!-- 富文本编辑区 -->
      <div
        v-show="viewMode !== 'preview'"
        ref="editorRef"
        class="rich-editor"
        contenteditable="true"
        :data-placeholder="placeholder"
        @input="onInput"
        @keydown="onKeydown"
        @mouseup="updateStates"
        @keyup="updateStates"
        @focus="updateStates"
        @paste="onPaste"
      />
      <!-- 预览区 -->
      <div v-show="viewMode === 'preview' || viewMode === 'split'" class="preview-pane">
        <div class="preview-content" v-html="localHtml" />
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <span class="status-item">字符数：{{ charCount }}</span>
      <span class="status-tip">Ctrl+B 加粗 · Ctrl+I 斜体 · Ctrl+U 下划线 · Ctrl+K 链接</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();
const emit = defineEmits(['update:modelValue']);

const editorRef = ref<HTMLDivElement | null>(null);
const showHeadingMenu = ref(false);
const showImgMenu = ref(false);
const imgUrlInput = ref('');
const imgFileRef = ref<HTMLInputElement | null>(null);
const viewMode = ref<'edit' | 'preview' | 'split'>('edit');
const formatBrushActive = ref(false);
const formatBrushStyles = ref<any>(null);
const currentColor = ref('#333333');
const localHtml = ref('');
const isComposing = ref(false);

const states = ref({
  bold: false, italic: false, underline: false, strikethrough: false,
});

const charCount = computed(() => {
  return editorRef.value?.innerText?.length || 0;
});

const currentBlockLabel = computed(() => {
  const tag = document.queryCommandValue('formatBlock').toLowerCase();
  const map: Record<string, string> = { h1: 'H1', h2: 'H2', h3: 'H3', h4: 'H4', blockquote: '引用', pre: '代码块', p: '正文', div: '正文' };
  return map[tag] || '正文';
});

// 初始化内容
onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue;
    localHtml.value = props.modelValue;
    // 回显时给已有图片绑定缩放
    editorRef.value.querySelectorAll<HTMLImageElement>('img.doc-img').forEach(bindImgResize);
  }
  document.addEventListener('click', () => {
    showHeadingMenu.value = false;
    showImgMenu.value = false;
  });
});

// 外部 modelValue 变化时同步（仅初始化时）
watch(() => props.modelValue, (val) => {
  if (!editorRef.value) return;
  // 只在编辑器没有焦点时同步，避免光标跳动
  if (document.activeElement !== editorRef.value) {
    editorRef.value.innerHTML = val || '';
    localHtml.value = val || '';
  }
}, { immediate: false });

// 输入时同步
function onInput() {
  if (!editorRef.value) return;
  const html = editorRef.value.innerHTML;
  localHtml.value = html;
  emit('update:modelValue', html);
  updateStates();
}

// 更新工具栏状态
function updateStates() {
  states.value = {
    bold: document.queryCommandState('bold'),
    italic: document.queryCommandState('italic'),
    underline: document.queryCommandState('underline'),
    strikethrough: document.queryCommandState('strikeThrough'),
  };
}

// 执行富文本命令
function execCmd(cmd: string, value?: string) {
  showHeadingMenu.value = false;
  editorRef.value?.focus();
  document.execCommand(cmd, false, value);
  onInput();
  updateStates();
}

// 插入链接
function insertLink() {
  const url = window.prompt('请输入链接地址：', 'https://');
  if (url) {
    const text = window.getSelection()?.toString() || url;
    execCmd('insertHTML', `<a href="${url}" target="_blank">${text}</a>`);
  }
}

// ===== 图片插入 =====
// 通过 URL 插入图片
function insertImageByUrl() {
  const url = imgUrlInput.value.trim();
  if (!url) return;
  insertImgNode(url);
  imgUrlInput.value = '';
  showImgMenu.value = false;
}

// 本地上传图片
async function handleImgUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  showImgMenu.value = false;
  (e.target as HTMLInputElement).value = '';
  await insertFileAsImage(file);
}

// 拖拽图片到编辑器
function onEditorDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0];
  if (file && file.type.startsWith('image/')) {
    insertFileAsImage(file);
    return;
  }
  // 拖拽图片 URL
  const url = e.dataTransfer?.getData('text/uri-list') || e.dataTransfer?.getData('text/plain');
  if (url && /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(url)) {
    insertImgNode(url);
  }
}

// 粘贴处理：识别图片链接自动转为图片
function onPaste(e: ClipboardEvent) {
  // 粘贴图片文件
  const items = e.clipboardData?.items;
  if (items) {
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) insertFileAsImage(file);
        return;
      }
    }
  }
  // 粘贴文本：检测是否是图片链接
  const text = e.clipboardData?.getData('text/plain')?.trim();
  if (text && /^https?:\/\/.+\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$/i.test(text)) {
    e.preventDefault();
    insertImgNode(text);
  }
  // 其他粘贴走默认行为
}

// 将 File 对象读取为 DataURL 并插入（不走服务器，直接 base64 存储）
function insertFileAsImage(file: File) {
  return new Promise<void>((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) insertImgNode(dataUrl);
      resolve();
    };
    reader.readAsDataURL(file);
  });
}

// 核心：直接操作 DOM 插入 img 节点，不走 execCmd
function insertImgNode(src: string) {
  const editor = editorRef.value;
  if (!editor) return;
  editor.focus();

  // 创建图片节点
  const img = document.createElement('img');
  img.src = src;
  img.style.cssText = 'width:400px;max-width:100%;height:auto;display:block;margin:8px 0;border-radius:4px;cursor:default;';
  img.className = 'doc-img';
  img.draggable = false;

  // 创建换行节点
  const br = document.createElement('br');

  // 在光标位置插入，或追加到末尾
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    // 确保光标在编辑器内
    if (editor.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      range.insertNode(br);
      range.insertNode(img);
      range.setStartAfter(br);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editor.appendChild(img);
      editor.appendChild(br);
    }
  } else {
    editor.appendChild(img);
    editor.appendChild(br);
  }

  // 绑定缩放
  bindImgResize(img);

  // 同步内容
  syncContent();
}

// ===== 图片缩放（独立 overlay，不影响 contenteditable）=====

function bindImgResize(img: HTMLImageElement) {
  if (img.dataset.rb) return;
  img.dataset.rb = '1';
  img.addEventListener('dragstart', (e) => e.preventDefault());
  img.addEventListener('mousedown', startResize);
}

function startResize(e: MouseEvent) {
  const img = e.currentTarget as HTMLImageElement;
  const rect = img.getBoundingClientRect();
  // 整个图片区域都可以拖拽缩放（右下角 30px 区域）
  const inCorner = e.clientX > rect.right - 30 && e.clientY > rect.bottom - 30;
  if (!inCorner) return;
  e.preventDefault();
  e.stopPropagation();

  const startX = e.clientX;
  const startW = img.offsetWidth;

  img.style.outline = '2px solid #18a058';

  function onMove(ev: MouseEvent) {
    const newW = Math.max(60, startW + (ev.clientX - startX));
    img.style.width = `${newW}px`;
  }

  function onUp() {
    img.style.outline = '';
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    syncContent();
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// 同步编辑器内容到 modelValue
function syncContent() {
  if (!editorRef.value) return;
  const html = editorRef.value.innerHTML;
  localHtml.value = html;
  emit('update:modelValue', html);
  updateStates();
}

// 插入分割线
function insertHr() {
  execCmd('insertHTML', '<hr/>');
}

// 格式刷
function toggleFormatBrush() {
  if (!formatBrushActive.value) {
    // 记录当前选中文字的样式
    formatBrushStyles.value = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    };
    formatBrushActive.value = true;
    if (editorRef.value) editorRef.value.style.cursor = 'copy';
  } else {
    formatBrushActive.value = false;
    formatBrushStyles.value = null;
    if (editorRef.value) editorRef.value.style.cursor = '';
  }
}

// 应用格式刷
function applyFormatBrush() {
  if (!formatBrushStyles.value) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed) return;
  if (formatBrushStyles.value.bold !== document.queryCommandState('bold')) execCmd('bold');
  if (formatBrushStyles.value.italic !== document.queryCommandState('italic')) execCmd('italic');
  if (formatBrushStyles.value.underline !== document.queryCommandState('underline')) execCmd('underline');
  formatBrushActive.value = false;
  formatBrushStyles.value = null;
  if (editorRef.value) editorRef.value.style.cursor = '';
}

// 键盘快捷键
function onKeydown(e: KeyboardEvent) {
  const ctrl = e.ctrlKey || e.metaKey;

  // 格式刷：选中文字后松开鼠标触发
  if (formatBrushActive.value && e.type === 'mouseup') {
    applyFormatBrush();
    return;
  }

  if (ctrl && e.key === 'b') { e.preventDefault(); execCmd('bold'); return; }
  if (ctrl && e.key === 'i') { e.preventDefault(); execCmd('italic'); return; }
  if (ctrl && e.key === 'u') { e.preventDefault(); execCmd('underline'); return; }
  if (ctrl && e.key === 'k') { e.preventDefault(); insertLink(); return; }

  // 标题快捷键
  if (ctrl && e.key === '1') { e.preventDefault(); execCmd('formatBlock', 'h1'); return; }
  if (ctrl && e.key === '2') { e.preventDefault(); execCmd('formatBlock', 'h2'); return; }
  if (ctrl && e.key === '3') { e.preventDefault(); execCmd('formatBlock', 'h3'); return; }
  if (ctrl && e.key === '4') { e.preventDefault(); execCmd('formatBlock', 'h4'); return; }
  if (ctrl && e.key === '0') { e.preventDefault(); execCmd('formatBlock', 'p'); return; }

  // Tab 缩进
  if (e.key === 'Tab') {
    e.preventDefault();
    execCmd(e.shiftKey ? 'outdent' : 'indent');
    return;
  }
}
</script>

<style scoped>
.doc-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 2px;
}
.toolbar-left { display: flex; align-items: center; gap: 1px; flex-wrap: wrap; }
.toolbar-right { display: flex; align-items: center; }
.tb-divider { width: 1px; height: 16px; background: #e0e0e0; margin: 0 4px; }

.tb-btn {
  min-width: 26px; height: 26px; padding: 0 5px;
  border: none; background: none; border-radius: 3px;
  font-size: 13px; color: #444; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.12s;
}
.tb-btn:hover { background: #e8e8e8; }
.tb-btn.active { background: #d4edda; color: #18a058; }
.tb-btn.format-brush.active { background: #fff3cd; color: #856404; }

/* 颜色选择 */
.tb-color-wrap {
  position: relative; display: flex; align-items: center;
  cursor: pointer; padding: 0 4px;
}
.tb-color-icon { font-size: 14px; font-weight: 700; color: #333; }
.tb-color-input {
  position: absolute; opacity: 0; width: 100%; height: 100%;
  cursor: pointer; top: 0; left: 0;
}

/* 标题下拉 */
.tb-dropdown {
  position: relative; display: flex; align-items: center; gap: 3px;
  padding: 3px 7px; border: 1px solid #e0e0e0; border-radius: 3px;
  font-size: 12px; color: #555; cursor: pointer; background: #fff;
  min-width: 64px; user-select: none; height: 26px;
}
.tb-dropdown:hover { border-color: #18a058; }
.tb-dropdown-label { flex: 1; font-size: 12px; }
.tb-dropdown-arrow { font-size: 9px; color: #999; }
.tb-dropdown-menu {
  position: absolute; top: calc(100% + 3px); left: 0;
  background: #fff; border: 1px solid #e0e0e0; border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 200; min-width: 140px; overflow: hidden;
}
.menu-item {
  padding: 7px 12px; cursor: pointer; font-size: 13px; color: #333; transition: background 0.12s;
}
.menu-item:hover { background: #f0fdf4; color: #18a058; }
.menu-item.h1 { font-size: 18px; font-weight: 700; }
.menu-item.h2 { font-size: 16px; font-weight: 600; }
.menu-item.h3 { font-size: 14px; font-weight: 600; }
.menu-item.h4 { font-size: 13px; font-weight: 500; }
.menu-item.blockquote { border-left: 3px solid #18a058; padding-left: 9px; color: #555; }
.menu-item.pre { font-family: monospace; background: #f5f5f5; }

/* 视图切换 */
.view-tabs { display: flex; }
.view-tab {
  padding: 3px 9px; font-size: 12px; color: #666; cursor: pointer;
  border: 1px solid #e0e0e0; background: #fff; margin-left: -1px; transition: all 0.12s;
}
.view-tab:first-child { border-radius: 3px 0 0 3px; }
.view-tab:last-child { border-radius: 0 3px 3px 0; }
.view-tab.active { background: #18a058; color: #fff; border-color: #18a058; z-index: 1; }

/* 编辑区 */
.editor-body {
  flex: 1; display: flex; overflow: hidden; min-height: 0;
}
.mode-split .rich-editor { border-right: 1px solid #f0f0f0; }

/* 富文本编辑区 */
.rich-editor {
  flex: 1; overflow-y: auto; padding: 16px 20px;
  font-size: 14px; line-height: 1.8; color: #333; outline: none;
  min-height: 100px;
}
.rich-editor:empty::before {
  content: attr(data-placeholder);
  color: #bbb; pointer-events: none;
}

/* 富文本内容样式 */
.rich-editor :deep(h1) { font-size: 22px; font-weight: 700; margin: 14px 0 6px; border-bottom: 2px solid #f0f0f0; padding-bottom: 4px; }
.rich-editor :deep(h2) { font-size: 18px; font-weight: 600; margin: 12px 0 5px; }
.rich-editor :deep(h3) { font-size: 16px; font-weight: 600; margin: 10px 0 4px; color: #18a058; }
.rich-editor :deep(h4) { font-size: 14px; font-weight: 600; margin: 8px 0 3px; }
.rich-editor :deep(blockquote) {
  border-left: 3px solid #18a058; margin: 8px 0; padding: 6px 12px;
  background: #f0fdf4; color: #555; border-radius: 0 4px 4px 0;
}
.rich-editor :deep(pre) {
  background: #1e1e1e; color: #d4d4d4; padding: 12px 16px;
  border-radius: 6px; overflow-x: auto; margin: 8px 0; font-family: monospace; font-size: 13px;
}
.rich-editor :deep(a) { color: #18a058; text-decoration: underline; }
.rich-editor :deep(hr) { border: none; border-top: 2px solid #f0f0f0; margin: 12px 0; }
.rich-editor :deep(ul) { padding-left: 20px; }
.rich-editor :deep(ol) { padding-left: 20px; }
.rich-editor :deep(li) { margin: 2px 0; }

/* 预览区 */
.preview-pane { flex: 1; overflow-y: auto; padding: 16px 20px; min-width: 0; }
.preview-content { font-size: 14px; line-height: 1.8; color: #333; }
:deep(.preview-content h1) { font-size: 22px; font-weight: 700; margin: 14px 0 6px; border-bottom: 2px solid #f0f0f0; padding-bottom: 4px; }
:deep(.preview-content h2) { font-size: 18px; font-weight: 600; margin: 12px 0 5px; }
:deep(.preview-content h3) { font-size: 16px; font-weight: 600; margin: 10px 0 4px; color: #18a058; }
:deep(.preview-content blockquote) { border-left: 3px solid #18a058; margin: 8px 0; padding: 6px 12px; background: #f0fdf4; color: #555; border-radius: 0 4px 4px 0; }
:deep(.preview-content a) { color: #18a058; text-decoration: underline; }
:deep(.preview-content hr) { border: none; border-top: 2px solid #f0f0f0; margin: 12px 0; }
:deep(.preview-content ul) { padding-left: 20px; }
:deep(.preview-content ol) { padding-left: 20px; }

/* 图片插入菜单 */
.tb-img-wrap { position: relative; }
.tb-img-menu {
  position: absolute; top: calc(100% + 6px); left: 0;
  background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12); z-index: 300;
  padding: 14px; min-width: 280px;
}
.img-menu-title {
  font-size: 13px; font-weight: 600; color: #333; margin-bottom: 10px;
}
.img-menu-row { display: flex; gap: 6px; }
.img-url-input {
  flex: 1; border: 1px solid #d9d9d9; border-radius: 5px;
  padding: 7px 10px; font-size: 13px; outline: none;
  transition: border-color 0.2s;
}
.img-url-input:focus { border-color: #18a058; }
.img-btn-confirm {
  background: #18a058; color: #fff; border: none;
  border-radius: 5px; padding: 7px 14px; font-size: 13px;
  cursor: pointer; white-space: nowrap; font-weight: 500;
}
.img-btn-confirm:hover { background: #0e7a3e; }
.img-menu-divider {
  text-align: center; font-size: 12px; color: #bbb;
  margin: 10px 0; position: relative;
}
.img-menu-divider::before, .img-menu-divider::after {
  content: ''; position: absolute; top: 50%; width: 42%;
  height: 1px; background: #e8e8e8;
}
.img-menu-divider::before { left: 0; }
.img-menu-divider::after { right: 0; }
.img-btn-upload {
  width: 100%; background: #f5f5f5; border: 1px dashed #d9d9d9;
  border-radius: 5px; padding: 9px; font-size: 13px; color: #555;
  cursor: pointer; text-align: center; transition: all 0.2s;
}
.img-btn-upload:hover { border-color: #18a058; color: #18a058; background: #f0fdf4; }

/* 编辑区图片样式 */
.rich-editor :deep(img.doc-img) {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 8px 0;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  cursor: default;
  outline: 2px solid transparent;
  transition: outline-color 0.15s;
  user-select: none;
}
.rich-editor :deep(img.doc-img:hover) {
  outline-color: #18a058;
  cursor: se-resize;
}

/* 预览区图片 */
:deep(.preview-content img) {
  max-width: 100%; height: auto; display: block;
  margin: 8px 0; border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
}

/* 状态栏 */
.status-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 3px 14px; border-top: 1px solid #f0f0f0; background: #fafafa; flex-shrink: 0;
}
.status-item { font-size: 11px; color: #999; }
.status-tip { font-size: 11px; color: #bbb; }
</style>
