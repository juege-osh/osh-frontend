<template>
  <section class="book-search-panel">
    <div class="hero-copy">
      <p class="hero-label">Curated Ebooks</p>
      <h2>电子书书库</h2>
      <p>按课程模块的使用方式重做了查询体验，支持关键词、标签、权限等级和排序的组合筛选。</p>
    </div>

    <div class="toolbar">
      <div class="field-group keyword-group inline-field">
        <label>关键词</label>
        <n-input
          v-model:value="draft.keyword"
          placeholder="搜索书名、简介、关键主题"
          clearable
          @keyup.enter="submitSearch"
        />
      </div>

      <div class="field-group inline-field">
        <label>标签</label>
        <n-select
          v-model:value="draft.tagNameList"
          :options="tagOptions"
          multiple
          filterable
          clearable
          placeholder="选择电子书标签"
        />
      </div>

      <div class="field-group inline-field small-field">
        <label>权限等级</label>
        <n-select
          v-model:value="draft.level"
          :options="levelOptions"
          clearable
          placeholder="全部等级"
        />
      </div>

      <div class="field-group inline-field small-field">
        <label>排序方式</label>
        <n-select
          v-model:value="draft.sortType"
          :options="sortOptions"
          clearable
          placeholder="默认推荐"
        />
      </div>

      <div class="toolbar-actions">
        <button class="ghost-btn" @click="resetSearch">重置</button>
        <button class="submit-btn" @click="submitSearch">搜索</button>
        <button v-if="canCreateBook" class="primary-btn" @click="goToCreate">新增电子书</button>
      </div>
    </div>

    <div class="action-row">
      <div class="chip-row">
        <button
          v-for="item in quickFilters"
          :key="item.label"
          class="quick-chip"
          @click="applyQuickFilter(item)"
        >
          {{ item.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { NInput, NSelect } from 'naive-ui'
import { apiGetBookTags } from '~/composables/Api/Book/book'

const props = defineProps({
  canCreateBook: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['search'])

const draft = reactive({
  keyword: '',
  tagNameList: [],
  level: null,
  sortType: null,
})

const tagOptions = ref([])

const levelOptions = [
  { label: '1 级权限', value: 1 },
  { label: '2 级权限', value: 2 },
  { label: '3 级权限', value: 3 },
  { label: '4 级权限', value: 4 },
  { label: '5 级权限', value: 5 },
]

const sortOptions = [
  { label: '默认推荐', value: 'default' },
  { label: '最新发布', value: 'latest' },
  { label: '最多购买', value: 'popular' },
  { label: '价格从低到高', value: 'priceAsc' },
  { label: '价格从高到低', value: 'priceDesc' },
]

const quickFilters = [
  { label: '免费优先', patch: { sortType: 'priceAsc' } },
  { label: '3级及以上', patch: { level: 3 } },
  { label: '最近上新', patch: { sortType: 'latest' } },
]

onMounted(async () => {
  try {
    const response = await apiGetBookTags()
    const tags = response?.data || response || []
    tagOptions.value = (tags || []).map((tag) => ({
      label: String(tag),
      value: String(tag),
    }))
  } catch (error) {
    console.error('load book tags failed', error)
    tagOptions.value = []
  }
})

function submitSearch() {
  emit('search', {
    keyword: draft.keyword.trim(),
    title: draft.keyword.trim(),
    tagNameList: [...draft.tagNameList],
    level: draft.level,
    sortType: draft.sortType || 'default',
  })
}

function resetSearch() {
  draft.keyword = ''
  draft.tagNameList = []
  draft.level = null
  draft.sortType = null
  submitSearch()
}

function applyQuickFilter(item) {
  Object.assign(draft, item.patch)
  submitSearch()
}

function goToCreate() {
  navigateTo('/book/CreateBook')
}
</script>

<style scoped>
.book-search-panel {
  position: relative;
  overflow: hidden;
  padding: 28px;
  border-radius: 32px;
  background:
    radial-gradient(circle at top right, rgba(255, 201, 98, 0.32), transparent 30%),
    radial-gradient(circle at left center, rgba(0, 184, 148, 0.18), transparent 36%),
    linear-gradient(140deg, #fffdf8 0%, #f3f6ff 48%, #eefaf7 100%);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 28px 70px rgba(28, 45, 84, 0.12);
}

.hero-copy {
  max-width: 760px;
}

.hero-label {
  margin: 0 0 10px;
  color: #0f766e;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 700;
}

.hero-copy h2 {
  margin: 0;
  font-size: clamp(28px, 4vw, 40px);
  line-height: 1.08;
  color: #10213a;
}

.hero-copy p:last-child {
  margin: 12px 0 0;
  color: #4b5563;
  line-height: 1.8;
}

.toolbar {
  margin-top: 24px;
  display: flex;
  align-items: end;
  gap: 14px;
  flex-wrap: wrap;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.inline-field {
  flex: 1 1 230px;
  min-width: 0;
}

.keyword-group {
  flex-basis: 320px;
}

.small-field {
  flex: 0 1 180px;
}

.field-group label {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
}

.submit-btn,
.ghost-btn,
.primary-btn,
.quick-chip {
  border: none;
  font: inherit;
}

.submit-btn {
  padding: 12px 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, #082f49 0%, #0f766e 100%);
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 0 0 auto;
}

.action-row {
  margin-top: 22px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 18px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-chip {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  color: #0f766e;
  cursor: pointer;
}

.ghost-btn,
.primary-btn {
  padding: 12px 18px;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
}

.ghost-btn {
  background: rgba(148, 163, 184, 0.12);
  color: #334155;
}

.primary-btn {
  background: linear-gradient(135deg, #ff9f4a 0%, #ff6b6b 100%);
  color: #fff;
  box-shadow: 0 14px 30px rgba(255, 107, 107, 0.25);
}

@media (max-width: 960px) {
  .book-search-panel {
    padding: 22px;
    border-radius: 24px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .action-row {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .toolbar-actions > button {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .toolbar-actions {
    flex-direction: column;
  }
}
</style>
