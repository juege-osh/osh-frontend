<template>
  <article class="book-card" @click="open">
    <div class="cover-shell">
      <UiImage :src="item.cover || defaultCover" class="book-cover" />
      <div class="cover-glow"></div>
      <span class="cover-level">Lv.{{ item.level || 1 }}</span>
      <span v-if="Number(item.price || 0) === 0" class="cover-badge free">免费</span>
      <span v-else class="cover-badge paid">付费</span>
    </div>

    <div class="card-body">
      <div class="card-top">
        <div class="title-block">
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc || item.description || '暂无简介，点击查看完整电子书详情。' }}</p>
        </div>

        <button
          class="favorite-btn"
          :class="{ active: favoriteActive }"
          @click.stop="toggleFavorite"
          :disabled="favoriteLoading"
        >
          {{ favoriteActive ? '已收藏' : '收藏' }}
        </button>
      </div>

      <div v-if="displayTags.length" class="tag-row">
        <span v-for="tag in displayTags" :key="tag" class="tag-chip">{{ tag }}</span>
      </div>

      <div class="stats-row">
        <div class="stat-box">
          <span>购买人数</span>
          <strong>{{ item.purchase_count || item.purchaseCount || item.sub_count || 0 }}</strong>
        </div>
        <div class="stat-box">
          <span>章节数</span>
          <strong>{{ item.chapterCount || '--' }}</strong>
        </div>
        <div class="stat-box">
          <span>权限等级</span>
          <strong>{{ item.level || 1 }}</strong>
        </div>
      </div>

      <div class="footer-row">
        <div class="price-block">
          <span class="price">{{ Number(item.price || 0) === 0 ? '免费' : `¥${item.price}` }}</span>
          <span v-if="item.t_price || item.tPrice" class="origin">¥{{ item.t_price || item.tPrice }}</span>
        </div>
        <button class="enter-btn">进入详情</button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { createDiscreteApi } from 'naive-ui'
import { useHasAuth } from '~/composables/useAuth'
import { apiFavoriteBook } from '~/composables/Api/Book/book'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['refresh'])

const { message } = createDiscreteApi(['message'])

const defaultCover = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect width='120' height='160' fill='%23edf2f7'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2364758b'%3EBOOK%3C/text%3E%3C/svg%3E"

const favoriteLoading = ref(false)
const favoriteActive = ref(false)

watch(
  () => props.item,
  (value) => {
    favoriteActive.value = Boolean(value?.favorited || value?.isFavorite || value?.collectionFlag === 1)
  },
  { immediate: true, deep: true }
)

const displayTags = computed(() => {
  const tags = props.item.tagNameList || props.item.tags || []
  return tags.slice(0, 3)
})

function open() {
  navigateTo(`/detail/book/${props.item.id}`)
}

function toggleFavorite() {
  useHasAuth(async () => {
    if (favoriteLoading.value) return
    favoriteLoading.value = true

    const nextStatus = favoriteActive.value ? 0 : 1

    try {
      const response = await apiFavoriteBook(props.item.id, nextStatus)
      if (response?.code && response.code !== 200) {
        throw new Error(response.msg || '收藏操作失败')
      }
      favoriteActive.value = nextStatus === 1
      message.success(nextStatus === 1 ? '已加入收藏' : '已取消收藏')
      emit('refresh')
    } catch (error) {
      console.error('toggle book favorite failed', error)
      message.error(error?.data?.msg || error?.message || '收藏操作失败')
    } finally {
      favoriteLoading.value = false
    }
  })
}
</script>

<style scoped>
.book-card {
  position: relative;
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  gap: 18px;
  padding: 18px;
  border-radius: 28px;
  background:
    linear-gradient(155deg, rgba(255, 255, 255, 0.96) 0%, rgba(246, 250, 255, 0.94) 100%);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.book-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.14);
  border-color: rgba(255, 107, 107, 0.2);
}

.cover-shell {
  position: relative;
  min-height: 220px;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(160deg, #09203f 0%, #537895 100%);
}

.book-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-glow {
  position: absolute;
  inset: auto -20% -28% 15%;
  height: 90px;
  background: radial-gradient(circle, rgba(255, 186, 104, 0.8), transparent 65%);
  filter: blur(18px);
}

.cover-level,
.cover-badge {
  position: absolute;
  left: 14px;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  backdrop-filter: blur(14px);
}

.cover-level {
  top: 14px;
  color: #f8fafc;
  background: rgba(15, 23, 42, 0.42);
}

.cover-badge {
  bottom: 14px;
  color: #10213a;
}

.cover-badge.free {
  background: rgba(187, 247, 208, 0.92);
}

.cover-badge.paid {
  background: rgba(254, 240, 138, 0.92);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.title-block h3 {
  margin: 0;
  font-size: 24px;
  line-height: 1.25;
  color: #10213a;
}

.title-block p {
  margin: 10px 0 0;
  color: #64748b;
  line-height: 1.75;
}

.favorite-btn,
.enter-btn {
  border: none;
  font: inherit;
}

.favorite-btn {
  flex-shrink: 0;
  padding: 10px 14px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.06);
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-btn.active {
  background: rgba(255, 107, 107, 0.12);
  color: #ef4444;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-chip {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.1);
  color: #0369a1;
  font-size: 12px;
  font-weight: 700;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.stat-box {
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 1) 0%, rgba(241, 245, 249, 0.92) 100%);
}

.stat-box span {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.stat-box strong {
  display: block;
  margin-top: 8px;
  color: #10213a;
  font-size: 22px;
}

.footer-row {
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.price-block {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.price {
  font-size: 28px;
  font-weight: 800;
  color: #ea580c;
}

.origin {
  color: #94a3b8;
  text-decoration: line-through;
}

.enter-btn {
  padding: 12px 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, #10213a 0%, #1d4ed8 100%);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 16px 30px rgba(29, 78, 216, 0.18);
}

@media (max-width: 860px) {
  .book-card {
    grid-template-columns: 1fr;
  }

  .cover-shell {
    min-height: 260px;
  }

  .card-top,
  .footer-row {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }
}
</style>
