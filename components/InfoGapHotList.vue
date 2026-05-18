<template>
  <div class="hot-wrap">
    <div class="hot-title">精品推荐</div>

    <div v-if="pending" class="hot-panel hot-state">
      加载中...
    </div>

    <div v-else-if="items.length === 0" class="hot-panel hot-state">
      暂无推荐内容
    </div>

    <n-carousel
      v-else
      class="hot-carousel"
      show-arrow
      autoplay
      :interval="3000"
      dot-type="line"
      trigger="hover"
    >
      <div
        v-for="item in items"
        :key="item.id"
        class="hot-slide"
      >
        <div class="slide-title">{{ item.title || '未命名信息差' }}</div>

        <div class="slide-tag-row">
          <span class="slide-category">[{{ item.tag || '未分类' }}]</span>
          <div v-if="item.extraTags.length" class="slide-extra-tags">
            <span
              v-for="tag in item.extraTags"
              :key="`${item.id}-${tag}`"
              class="slide-extra-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <div class="slide-content">
          {{ item.content || '暂无内容' }}
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
    </n-carousel>
  </div>
</template>

<script setup>
import { NCarousel } from 'naive-ui';

const pending = ref(false);
const items = ref([]);

const normalizeText = (value) => String(value || '').trim();

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
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
  height: 280px;
}

.hot-slide {
  height: 280px;
  box-sizing: border-box;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.slide-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  line-height: 1.5;
  word-break: break-word;
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
}

.slide-content {
  flex: 1;
  font-size: 14px;
  color: #475467;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  max-height: 88px;
}

.slide-footer {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: #98a2b3;
  line-height: 1.6;
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
  margin-bottom: 18px;
}

.slide-stats-row,
.slide-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
