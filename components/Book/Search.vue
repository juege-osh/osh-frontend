<template>
    <div class="compact-filter">
        <n-space align="center" justify="space-between">
          <n-space>
            <n-select
                v-model:value="queryParams.tagIds"
                multiple
                filterable
                placeholder="按标签筛选 (可多选)"
                :options="tagOptions"
                style="width: 260px"
                @update:value="handleSearch"
            />
            <n-select
                v-model:value="queryParams.sortIds"
                filterable
                clearable
                placeholder="筛选（单选）"
                :options="sort"
                style="width: 260px"
                @update:value="singleSearch"
            />
            

          <n-input
            v-model:value="queryParams.keyword"
            placeholder="搜索电子书..."
            style="width: 220px"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <n-icon>
                <SearchOutline />
              </n-icon>
            </template>
          </n-input>
        </n-space>

        <n-button type="primary" @click="goToCreate">
          新增电子书
        </n-button>
      </n-space>
    </div>
</template>

<script setup>
import {
    NInput,
    NSelect,
    NSpace,
    NButton,
    NIcon
} from "naive-ui"
import { SearchOutline, Add } from '@vicons/ionicons5'


const queryParams = reactive({
  keyword: '',
  tagIds: [],
  tag: [],
  sortIds: null
});

const emit = defineEmits(['search', 'singlesearch'])

// 动态标签选项，初始预设常用标签，点击卡片标签时会自动追加
const tagOptions = reactive([
  { label: 'Vue3', value: 'Vue3' },
  { label: 'Nuxt3', value: 'Nuxt3' },
  { label: 'Node.js', value: 'Node.js' },
  { label: 'Python', value: 'Python' },
  { label: 'AI实战', value: 'AI实战' },
  { label: '信息差', value: '信息差' },
  { label: '人工智能', value: '人工智能' },
]);

const handleSearch = () => {
  queryParams.tag = [...queryParams.tagIds]
  emit('search', {
    keyword: queryParams.keyword,
    tag: queryParams.tag
  })
}

const singleSearch = (val) => {
  emit('singlesearch', { a: val ?? null });
};

// 供父组件调用：点击卡片标签时，将标签注入搜索框并触发搜索
const addTagAndSearch = (tagName) => {
  // 如果选项里没有这个标签，动态添加
  if (!tagOptions.find(t => t.value === tagName)) {
    tagOptions.push({ label: tagName, value: tagName })
  }
  // 如果还没选中，加入选中列表
  if (!queryParams.tagIds.includes(tagName)) {
    queryParams.tagIds.push(tagName)
  }
  // 触发搜索
  handleSearch()
}

defineExpose({ addTagAndSearch })


const sort = [
  { label: '免费', value: 'free' },
  { label: '付费积分付费', value: 'paid_score' },
  { label: '积分付费', value: 'score' },
  { label: '金币付费', value: 'gold' },
  { label: '金币付费小班专属', value: 'gold_small_class' },
  { label: '内部成员专属', value: 'internal' }
];



const goToCreate = () => {
  navigateTo('/book/CreateBook')
};
</script>

<style scoped>
.compact-filter {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-bottom: 24px;
}


</style>