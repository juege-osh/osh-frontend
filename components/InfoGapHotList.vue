<template>
  <div class="hot-wrap">
    <div class="hot-title">精品推荐</div>

    <div v-if="pending" class="hot-panel hot-state">
      加载中...
    </div>

    <div v-else-if="items.length === 0" class="hot-panel hot-state">
      暂无推荐内容
    </div>

    <div
      v-else
      ref="viewportRef"
      class="hot-carousel"
      :style="viewportStyle"
      @mouseenter="pauseScroll"
      @mouseleave="resumeScroll"
    >
      <div class="hot-scroll-track" :style="trackStyle">
        <div ref="listRef" class="hot-list">
          <div
            v-for="(item, index) in items"
            :key="item.id ?? `origin-${index}`"
            class="hot-slide"
            @click="handleDetail(item.id)"
          >
            <div class="slide-title">
              <span class="slide-order">{{ index + 1 }}.</span>
              <span>{{ item.title || '未命名信息差' }}</span>
            </div>

            <div class="slide-tag-row">
              <span
                class="slide-category"
                @click.stop="handleTagSearch(item.tag)"
              >
                [{{ item.tag || '未分类' }}]
              </span>
              <div v-if="item.extraTags.length" class="slide-extra-tags">
                <span
                  v-for="tag in item.extraTags"
                  :key="`${item.id}-${tag}`"
                  class="slide-extra-tag"
                  @click.stop="handleTagSearch(tag)"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="slide-footer">
              <div class="slide-stats-row">
                <span>阅读 {{ item.readCount || item.viewCount || 0 }}</span>
                <span>点赞 {{ item.goodCount || 0 }}</span>
                <span>收藏 {{ item.collectCount || 0 }}</span>
              </div>
              <div class="slide-meta-row">
                <span>{{ item.nickname || '匿名用户' }}</span>
                <span>{{ formatTime(item.updateTime || item.createTime) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="shouldLoop" class="hot-list hot-list-clone" aria-hidden="true">
          <div
            v-for="(item, index) in items"
            :key="`clone-${item.id ?? index}-${index}`"
            class="hot-slide"
            @click="handleDetail(item.id)"
          >
            <div class="slide-title">
              <span class="slide-order">{{ index + 1 }}.</span>
              <span>{{ item.title || '未命名信息差' }}</span>
            </div>

            <div class="slide-tag-row">
              <span
                class="slide-category"
                @click.stop="handleTagSearch(item.tag)"
              >
                [{{ item.tag || '未分类' }}]
              </span>
              <div v-if="item.extraTags.length" class="slide-extra-tags">
                <span
                  v-for="tag in item.extraTags"
                  :key="`clone-${item.id}-${tag}`"
                  class="slide-extra-tag"
                  @click.stop="handleTagSearch(tag)"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="slide-footer">
              <div class="slide-stats-row">
                <span>阅读 {{ item.readCount || item.viewCount || 0 }}</span>
                <span>点赞 {{ item.goodCount || 0 }}</span>
                <span>收藏 {{ item.collectCount || 0 }}</span>
              </div>
              <div class="slide-meta-row">
                <span>{{ item.nickname || '匿名用户' }}</span>
                <span>{{ formatTime(item.updateTime || item.createTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const SCROLL_SPEED = 100; // px/s，数值越大滚动越快
const LIST_GAP = 8;
const VIEWPORT_OFFSET = 128;

const pending = ref(false);
const items = ref([]);
const viewportRef = ref(null);
const listRef = ref(null);
const scrollOffset = ref(0);
const originalListHeight = ref(0);
const viewportHeight = ref(0);
const isPaused = ref(false);

let rafId = null;
let lastFrameTime = 0;

const normalizeText = (value) => {
  const text = String(value ?? '').trim();
  return text.toLowerCase() === 'null' ? '' : text;
};

const loopDistance = computed(() => (
  originalListHeight.value > 0 ? originalListHeight.value + LIST_GAP : 0
));

const shouldLoop = computed(() => (
  items.value.length > 1 && loopDistance.value > viewportHeight.value
));

const trackStyle = computed(() => ({
  transform: `translate3d(0, -${scrollOffset.value}px, 0)`,
}));

const viewportStyle = computed(() => (
  viewportHeight.value > 0 ? { height: `${viewportHeight.value}px` } : {}
));

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

const buildExtraTags = (item = {}) => {
  return [item.tag1, item.tag2, item.tag3]
    .map((tag) => normalizeText(tag))
    .filter(Boolean);
};

const handleDetail = (id) => {
  if (!id) return;
  navigateTo(`/detail/info_gap/${id}`);
};

const handleTagSearch = (tag) => {
  const keyword = normalizeText(tag);
  if (!keyword) return;

  navigateTo({
    path: '/info_gap/1',
    query: {
      type: 'hot',
      title: keyword,
      search: '1',
    },
  });
};

const stopAutoScroll = () => {
  if (!process.client || rafId === null) return;
  window.cancelAnimationFrame(rafId);
  rafId = null;
  lastFrameTime = 0;
};

const tick = (timestamp) => {
  if (!shouldLoop.value || loopDistance.value <= 0) {
    stopAutoScroll();
    scrollOffset.value = 0;
    return;
  }

  if (!lastFrameTime) {
    lastFrameTime = timestamp;
  }

  const delta = timestamp - lastFrameTime;
  lastFrameTime = timestamp;

  if (!isPaused.value) {
    scrollOffset.value += (SCROLL_SPEED * delta) / 1000;

    if (scrollOffset.value >= loopDistance.value) {
      scrollOffset.value -= loopDistance.value;
    }
  }

  rafId = window.requestAnimationFrame(tick);
};

const startAutoScroll = () => {
  if (!process.client) return;

  stopAutoScroll();

  if (!shouldLoop.value) {
    scrollOffset.value = 0;
    return;
  }

  rafId = window.requestAnimationFrame(tick);
};

const measureScroll = async () => {
  await nextTick();

  if (!viewportRef.value || !listRef.value) return;

  originalListHeight.value = listRef.value.offsetHeight;
  const maxVisibleHeight = process.client
    ? Math.max(window.innerHeight - VIEWPORT_OFFSET, 0)
    : originalListHeight.value;
  viewportHeight.value = maxVisibleHeight > 0
    ? Math.min(originalListHeight.value, maxVisibleHeight)
    : originalListHeight.value;

  if (!shouldLoop.value) {
    scrollOffset.value = 0;
  }

  startAutoScroll();
};

const pauseScroll = () => {
  isPaused.value = true;
};

const resumeScroll = () => {
  isPaused.value = false;
};

const handleResize = () => {
  measureScroll();
};

const loadHotInfoGapList = async () => {
  pending.value = true;

  try {
    const { data, error } = await useHttpGet(
      'info-gap-hot-widget',
      '/info_gap/recommend',
      {
        watch: false,
        $: true,
      }
    );

    if (error.value) {
      throw error.value;
    }

    const rows = Array.isArray(data.value)
      ? data.value
      : (data.value?.rows || data.value?.data || []);

    items.value = rows.map((item) => ({
      ...item,
      extraTags: buildExtraTags(item),
    }));
  } catch (err) {
    items.value = [];
  } finally {
    pending.value = false;
  }
};

watch(items, () => {
  measureScroll();
}, { flush: 'post' });

onMounted(() => {
  measureScroll();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  stopAutoScroll();
  if (process.client) {
    window.removeEventListener('resize', handleResize);
  }
});

await loadHotInfoGapList();
</script>

<style scoped>
.hot-wrap {
  width: 100%;
  position: sticky;
  top: 84px;
  align-self: start;
}

.hot-title {
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.hot-panel {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
}

.hot-state {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 14px;
}

.hot-carousel {
  overflow: hidden;
}

.hot-scroll-track {
  display: flex;
  flex-direction: column;
  gap: 8px;
  will-change: transform;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hot-slide {
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.hot-slide:hover {
  border-color: #cbd5e1;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.slide-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  line-height: 1.5;
  word-break: break-word;
}

.slide-order {
  margin-right: 6px;
  color: #64748b;
}

.slide-tag-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}

.slide-category {
  font-size: 13px;
  color: #0b7285;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.2s ease;
}

.slide-category:hover {
  color: #095c6b;
}

.slide-extra-tags {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
}

.slide-extra-tag {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.slide-extra-tag:hover {
  border-color: #94a3b8;
  background: #e2e8f0;
  color: #0f172a;
}

.slide-footer {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #98a2b3;
  line-height: 1.6;
  border-top: 1px solid #e5e7eb;
  padding-top: 8px;
}

.slide-stats-row,
.slide-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
