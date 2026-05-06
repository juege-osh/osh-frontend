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

        <!-- 字体大小 -->
        <div class="tb-dropdown tb-fontsize" @mousedown.prevent @click.stop="showFontSizeMenu = !showFontSizeMenu">
          <span class="tb-dropdown-label">{{ currentFontSize }}</span>
          <span class="tb-dropdown-arrow">▾</span>
          <div v-if="showFontSizeMenu" class="tb-dropdown-menu tb-fontsize-menu">
            <div v-for="size in fontSizes" :key="size.value" class="menu-item" :style="{ fontSize: size.px }" @mousedown.prevent @click="setFontSize(size.value)">{{ size.label }}</div>
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
        <!-- 背景色 -->
        <div class="tb-color-wrap" title="背景颜色">
          <span class="tb-color-icon tb-bg-icon" :style="{ background: currentBgColor }">A</span>
          <input type="color" class="tb-color-input" v-model="currentBgColor" @change="execCmd('hiliteColor', currentBgColor)" />
        </div>

        <div class="tb-divider" />

        <!-- 对齐 -->
        <button class="tb-btn" title="左对齐" @mousedown.prevent @click="execCmd('justifyLeft')">
          <svg width="14" height="14" viewBox="0 0 14 14"><line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" stroke-width="1.5"/><line x1="1" y1="7" x2="9" y2="7" stroke="currentColor" stroke-width="1.5"/><line x1="1" y1="11" x2="13" y2="11" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>
        <button class="tb-btn" title="居中" @mousedown.prevent @click="execCmd('justifyCenter')">
          <svg width="14" height="14" viewBox="0 0 14 14"><line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" stroke-width="1.5"/><line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" stroke-width="1.5"/><line x1="1" y1="11" x2="13" y2="11" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>
        <button class="tb-btn" title="右对齐" @mousedown.prevent @click="execCmd('justifyRight')">
          <svg width="14" height="14" viewBox="0 0 14 14"><line x1="1" y1="3" x2="13" y2="3" stroke="currentColor" stroke-width="1.5"/><line x1="5" y1="7" x2="13" y2="7" stroke="currentColor" stroke-width="1.5"/><line x1="1" y1="11" x2="13" y2="11" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>

        <div class="tb-divider" />

        <!-- 列表 -->
        <button class="tb-btn" title="无序列表" @mousedown.prevent @click="execCmd('insertUnorderedList')">
          <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="2" cy="4" r="1.2" fill="currentColor"/><line x1="5" y1="4" x2="13" y2="4" stroke="currentColor" stroke-width="1.5"/><circle cx="2" cy="8" r="1.2" fill="currentColor"/><line x1="5" y1="8" x2="13" y2="8" stroke="currentColor" stroke-width="1.5"/><circle cx="2" cy="12" r="1.2" fill="currentColor"/><line x1="5" y1="12" x2="11" y2="12" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>
        <button class="tb-btn" title="有序列表" @mousedown.prevent @click="execCmd('insertOrderedList')">
          <svg width="14" height="14" viewBox="0 0 14 14"><text x="1" y="5" font-size="5" fill="currentColor">1.</text><line x1="6" y1="4" x2="13" y2="4" stroke="currentColor" stroke-width="1.5"/><text x="1" y="9" font-size="5" fill="currentColor">2.</text><line x1="6" y1="8" x2="13" y2="8" stroke="currentColor" stroke-width="1.5"/><text x="1" y="13" font-size="5" fill="currentColor">3.</text><line x1="6" y1="12" x2="11" y2="12" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>

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

        <!-- 表格 -->
        <div class="tb-img-wrap">
          <button class="tb-btn" title="插入表格" @mousedown.prevent @click.stop="showTableMenu = !showTableMenu">⊞</button>
          <div v-if="showTableMenu" class="tb-table-menu" @click.stop>
            <div class="img-menu-title">插入表格</div>
            <div class="table-size-picker">
              <div v-for="r in 6" :key="r" class="table-row-picker">
                <div
                  v-for="c in 6"
                  :key="c"
                  class="table-cell-picker"
                  :class="{ hover: r <= tableHoverRow && c <= tableHoverCol }"
                  @mouseenter="tableHoverRow = r; tableHoverCol = c"
                  @mouseleave="tableHoverRow = 0; tableHoverCol = 0"
                  @click="insertTable(r, c)"
                />
              </div>
            </div>
            <div class="table-size-label">{{ tableHoverRow > 0 ? `${tableHoverRow} × ${tableHoverCol}` : '悬停选择大小' }}</div>
          </div>
        </div>

        <!-- 代码块 -->
        <button class="tb-btn" title="插入代码块" @mousedown.prevent @click="insertCodeBlock">
          <svg width="14" height="14" viewBox="0 0 14 14"><polyline points="4,3 1,7 4,11" stroke="currentColor" stroke-width="1.5" fill="none"/><polyline points="10,3 13,7 10,11" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="6" y1="2" x2="8" y2="12" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>

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

      <!-- 图片浮动工具栏 -->
      <div
        v-if="imgToolbar.visible"
        class="img-toolbar"
        :style="{ top: imgToolbar.top + 'px', left: imgToolbar.left + 'px' }"
        @mousedown.prevent
      >
        <button class="img-tb-btn" title="左对齐" @click="setImgAlign('left')">
          <svg width="13" height="13" viewBox="0 0 13 13"><rect x="0" y="1" width="13" height="2" rx="1" fill="currentColor"/><rect x="0" y="5.5" width="8" height="2" rx="1" fill="currentColor"/><rect x="0" y="10" width="13" height="2" rx="1" fill="currentColor"/></svg>
        </button>
        <button class="img-tb-btn" title="居中" @click="setImgAlign('center')">
          <svg width="13" height="13" viewBox="0 0 13 13"><rect x="0" y="1" width="13" height="2" rx="1" fill="currentColor"/><rect x="2.5" y="5.5" width="8" height="2" rx="1" fill="currentColor"/><rect x="0" y="10" width="13" height="2" rx="1" fill="currentColor"/></svg>
        </button>
        <button class="img-tb-btn" title="右对齐" @click="setImgAlign('right')">
          <svg width="13" height="13" viewBox="0 0 13 13"><rect x="0" y="1" width="13" height="2" rx="1" fill="currentColor"/><rect x="5" y="5.5" width="8" height="2" rx="1" fill="currentColor"/><rect x="0" y="10" width="13" height="2" rx="1" fill="currentColor"/></svg>
        </button>
        <div class="img-tb-divider" />
        <button class="img-tb-btn" title="25% 宽度" @click="setImgWidth('25%')">25%</button>
        <button class="img-tb-btn" title="50% 宽度" @click="setImgWidth('50%')">50%</button>
        <button class="img-tb-btn" title="75% 宽度" @click="setImgWidth('75%')">75%</button>
        <button class="img-tb-btn" title="100% 宽度" @click="setImgWidth('100%')">100%</button>
        <div class="img-tb-divider" />
        <button class="img-tb-btn img-tb-del" title="删除图片" @click="deleteSelectedImg">🗑</button>
      </div>

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
import { fetchConfig } from '~/composables/useHttp';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();
const emit = defineEmits(['update:modelValue']);

const editorRef = ref<HTMLDivElement | null>(null);
const showHeadingMenu = ref(false);
const showImgMenu = ref(false);
const showFontSizeMenu = ref(false);
const showTableMenu = ref(false);
const tableHoverRow = ref(0);
const tableHoverCol = ref(0);
const imgUrlInput = ref('');
const imgFileRef = ref<HTMLInputElement | null>(null);
const viewMode = ref<'edit' | 'preview' | 'split'>('edit');
const formatBrushActive = ref(false);
const formatBrushStyles = ref<any>(null);
const currentColor = ref('#333333');
const currentBgColor = ref('#ffff00');
const localHtml = ref('');
const isComposing = ref(false);

const fontSizes = [
  { label: '12px 小号', value: '1', px: '12px' },
  { label: '14px 正文', value: '2', px: '14px' },
  { label: '16px 中号', value: '3', px: '16px' },
  { label: '18px 大号', value: '4', px: '18px' },
  { label: '24px 特大', value: '5', px: '24px' },
  { label: '32px 超大', value: '6', px: '32px' },
];
const currentFontSize = ref('字号');

// 图片浮动工具栏
const imgToolbar = ref({ visible: false, top: 0, left: 0 });
const selectedImg = ref<HTMLImageElement | null>(null);

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
  document.addEventListener('click', () => {
    showHeadingMenu.value = false;
    showImgMenu.value = false;
    showFontSizeMenu.value = false;
    showTableMenu.value = false;
    imgToolbar.value.visible = false;
    selectedImg.value = null;
  });
  // onMounted 时 editorRef 已就绪，直接写入内容并绑定图片
  if (editorRef.value) {
    const val = props.modelValue || '';
    editorRef.value.innerHTML = val;
    localHtml.value = val;
    // 用 setTimeout 确保浏览器完成 DOM 渲染后再绑定
    setTimeout(() => bindAllImages(), 100);
  }
});

// 外部 modelValue 变化时同步（不用 immediate，onMounted 已处理初始值）
watch(() => props.modelValue, (val) => {
  if (!editorRef.value) return;
  // 只在编辑器没有焦点时同步，避免光标跳动
  if (document.activeElement !== editorRef.value) {
    editorRef.value.innerHTML = val || '';
    localHtml.value = val || '';
    setTimeout(() => bindAllImages(), 100);
  }
}, { immediate: false });

// 给编辑器内所有图片补上 doc-img class 并绑定缩放
function bindAllImages() {
  if (!editorRef.value) return;
  const imgs = editorRef.value.querySelectorAll<HTMLImageElement>('img');
  imgs.forEach((img) => {
    if (!img.classList.contains('doc-img')) {
      img.classList.add('doc-img');
      if (!img.style.width) img.style.width = '400px';
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.margin = '8px 0';
      img.style.borderRadius = '4px';
      img.draggable = false;
    }
    bindImgResize(img);
  });
}

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

// 将 File 对象上传到服务器，获取临时访问链接后插入图片
async function insertFileAsImage(file: File) {
  // 先插入占位图（loading 状态），避免用户等待时无反馈
  const editor = editorRef.value;
  if (!editor) return;

  // 创建占位 img，src 用 base64 透明像素，显示 loading 样式
  const placeholder = document.createElement('img');
  placeholder.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7kuIrkvKDkuK3igKY8L3RleHQ+PC9zdmc+';
  placeholder.style.cssText = 'width:400px;max-width:100%;height:auto;display:block;margin:8px 0;border-radius:4px;opacity:0.6;';
  placeholder.className = 'doc-img';
  placeholder.draggable = false;
  const br = document.createElement('br');

  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      range.insertNode(br);
      range.insertNode(placeholder);
      range.setStartAfter(br);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editor.appendChild(placeholder);
      editor.appendChild(br);
    }
  } else {
    editor.appendChild(placeholder);
    editor.appendChild(br);
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    // 获取 token（与 getAuthHeaders 保持一致）
    const token = useCookie('token');
    const tokenValue = token.value || (process.client ? localStorage.getItem('token') || '' : '');

    const response = await $fetch('/course/cover/upload', {
      method: 'POST',
      body: formData,
      baseURL: fetchConfig.baseURL,
      headers: {
        appid: fetchConfig.headers.appid,
        token: tokenValue,
      },
    }) as any;

    if (response?.code === 200 && response?.data) {
      // 用临时访问链接替换占位图
      // /course/cover/upload 返回 data.url（完整临时链接）和 data.relativePath（相对路径）
      const d = response.data;
      const previewUrl = d?.url || d?.fileUrl
        || (d?.relativePath ? `${fetchConfig.baseURL.replace('/pc', '')}${d.relativePath}` : null)
        || (typeof d === 'string' ? d : '');
      if (!previewUrl) throw new Error('未获取到图片链接');
      placeholder.src = previewUrl;
      placeholder.style.opacity = '1';
      // 将相对路径存到 data-src，方便后续识别
      if (d?.relativePath) {
        placeholder.dataset.src = d.relativePath;
      }
      bindImgResize(placeholder);
      syncContent();
    } else {
      throw new Error(response?.msg || '上传失败');
    }
  } catch (err: any) {
    // 上传失败：移除占位图，提示用户
    placeholder.parentNode?.removeChild(placeholder);
    br.parentNode?.removeChild(br);
    syncContent();
    if (process.client) {
      const { createDiscreteApi } = await import('naive-ui');
      const { message } = createDiscreteApi(['message']);
      message.error('图片上传失败：' + (err?.message || '未知错误'));
    }
  }
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
  img.dataset.rb = '1';
  img.removeEventListener('dragstart', preventDrag);
  img.removeEventListener('mousedown', startResize);
  img.removeEventListener('mousemove', updateImgCursor);
  img.removeEventListener('click', showImgToolbar);
  img.addEventListener('dragstart', preventDrag);
  img.addEventListener('mousedown', startResize);
  img.addEventListener('mousemove', updateImgCursor);
  img.addEventListener('click', showImgToolbar);
}

function showImgToolbar(e: Event) {
  e.stopPropagation();
  const img = e.currentTarget as HTMLImageElement;
  const imgRect = img.getBoundingClientRect();
  selectedImg.value = img;

  // 工具栏宽度约 260px，高度约 38px
  const toolbarW = 260;
  const toolbarH = 38;
  const gap = 6;

  // 默认显示在图片上方
  let top = imgRect.top - toolbarH - gap;
  let left = imgRect.left;

  // 上方空间不足时显示在图片下方
  if (top < 8) {
    top = imgRect.bottom + gap;
  }

  // 右侧超出视口时向左偏移
  if (left + toolbarW > window.innerWidth - 8) {
    left = window.innerWidth - toolbarW - 8;
  }

  // 左侧不能小于 8
  if (left < 8) left = 8;

  imgToolbar.value = { visible: true, top, left };
}

function setImgAlign(align: 'left' | 'center' | 'right') {
  const img = selectedImg.value;
  if (!img) return;
  if (align === 'center') {
    img.style.display = 'block';
    img.style.margin = '8px auto';
    img.style.float = '';
  } else if (align === 'left') {
    img.style.display = 'block';
    img.style.margin = '8px auto 8px 0';
    img.style.float = '';
  } else {
    img.style.display = 'block';
    img.style.margin = '8px 0 8px auto';
    img.style.float = '';
  }
  syncContent();
  imgToolbar.value.visible = false;
  selectedImg.value = null;
}

function setImgWidth(width: string) {
  const img = selectedImg.value;
  if (!img) return;
  img.style.width = width;
  img.style.maxWidth = '100%';
  syncContent();
  imgToolbar.value.visible = false;
  selectedImg.value = null;
}

function deleteSelectedImg() {
  const img = selectedImg.value;
  if (!img) return;
  img.parentNode?.removeChild(img);
  imgToolbar.value.visible = false;
  selectedImg.value = null;
  syncContent();
}

function preventDrag(e: Event) {
  e.preventDefault();
}

function updateImgCursor(e: MouseEvent) {
  const img = e.currentTarget as HTMLImageElement;
  const rect = img.getBoundingClientRect();
  const inResizeZone = e.clientX > rect.right - 40 && e.clientY > rect.bottom - 40;
  img.style.cursor = inResizeZone ? 'se-resize' : 'default';
}

function startResize(e: MouseEvent) {
  const img = e.currentTarget as HTMLImageElement;
  const rect = img.getBoundingClientRect();
  // 右下角 40px 区域触发缩放
  const inCorner = e.clientX > rect.right - 40 && e.clientY > rect.bottom - 40;
  if (!inCorner) return;
  e.preventDefault();
  e.stopPropagation();

  const startX = e.clientX;
  // offsetWidth 为 0 时用 getBoundingClientRect 的宽度兜底
  const startW = img.offsetWidth || rect.width || 400;

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

// 设置字体大小
function setFontSize(size: string) {
  showFontSizeMenu.value = false;
  editorRef.value?.focus();
  document.execCommand('fontSize', false, size);
  const sizeMap: Record<string, string> = { '1': '12px', '2': '14px', '3': '16px', '4': '18px', '5': '24px', '6': '32px' };
  currentFontSize.value = sizeMap[size] || '字号';
  onInput();
}

// 插入表格
function insertTable(rows: number, cols: number) {
  showTableMenu.value = false;
  tableHoverRow.value = 0;
  tableHoverCol.value = 0;
  let html = '<table style="border-collapse:collapse;width:100%;margin:8px 0;">';
  // 表头
  html += '<thead><tr>';
  for (let c = 0; c < cols; c++) {
    html += `<th style="border:1px solid #e0e0e0;padding:8px 12px;background:#f5f5f5;font-weight:600;text-align:left;">表头${c + 1}</th>`;
  }
  html += '</tr></thead><tbody>';
  // 数据行
  for (let r = 1; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) {
      html += `<td style="border:1px solid #e0e0e0;padding:8px 12px;">内容</td>`;
    }
    html += '</tr>';
  }
  html += '</tbody></table><p><br></p>';
  execCmd('insertHTML', html);
}

// 插入代码块
function insertCodeBlock() {
  const sel = window.getSelection();
  const selectedText = sel?.toString() || '';
  const code = selectedText || '// 在此输入代码';
  execCmd('insertHTML', `<pre style="background:#1e1e1e;color:#d4d4d4;padding:12px 16px;border-radius:6px;overflow-x:auto;margin:8px 0;font-family:monospace;font-size:13px;">${code}</pre><p><br></p>`);
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
.tb-bg-icon { color: #333; border-bottom: none !important; padding: 1px 3px; border-radius: 2px; }
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
.tb-fontsize { min-width: 52px; }
.tb-dropdown-label { flex: 1; font-size: 12px; }
.tb-dropdown-arrow { font-size: 9px; color: #999; }
.tb-dropdown-menu {
  position: absolute; top: calc(100% + 3px); left: 0;
  background: #fff; border: 1px solid #e0e0e0; border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 200; min-width: 140px; overflow: hidden;
}
.tb-fontsize-menu { min-width: 110px; }
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

/* 表格选择器 */
.tb-table-menu {
  position: absolute; top: calc(100% + 6px); left: 0;
  background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12); z-index: 300;
  padding: 14px; min-width: 180px;
}
.table-size-picker { display: flex; flex-direction: column; gap: 3px; margin: 8px 0; }
.table-row-picker { display: flex; gap: 3px; }
.table-cell-picker {
  width: 20px; height: 20px; border: 1px solid #e0e0e0; border-radius: 2px;
  cursor: pointer; transition: all 0.1s;
}
.table-cell-picker.hover { background: #d4edda; border-color: #18a058; }
.table-size-label { font-size: 12px; color: #888; text-align: center; margin-top: 4px; }

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
  position: relative;
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

/* 图片浮动工具栏 */
.img-toolbar {
  position: fixed;
  display: flex;
  align-items: center;
  gap: 2px;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  padding: 4px 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  z-index: 9999;
  user-select: none;
}
.img-tb-btn {
  min-width: 28px; height: 26px; padding: 0 6px;
  border: none; background: none; border-radius: 4px;
  font-size: 11px; color: #ccc; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.12s; white-space: nowrap;
}
.img-tb-btn:hover { background: #333; color: #fff; }
.img-tb-del:hover { background: #5a1a1a; color: #ff6b6b; }
.img-tb-divider { width: 1px; height: 16px; background: #333; margin: 0 2px; }

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
  position: relative;
}
.rich-editor :deep(img.doc-img:hover) {
  outline-color: #18a058;
}
/* 右下角缩放提示角标（伪元素无法直接加在 img 上，用 outline 渐变模拟） */
.rich-editor :deep(img.doc-img:hover) {
  outline: 2px solid #18a058;
  box-shadow: 2px 2px 0 2px #18a058, 0 1px 4px rgba(0,0,0,0.1);
  cursor: default;
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
