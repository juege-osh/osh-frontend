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
                placeholder="筛选（单选）"
                :options="sort"
                style="width: 260px"
                @update:value="singleSearch"
                @click="handleSortClick"
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
  tag:[],
  sortIds:null
});

const emit = defineEmits(['search', 'singlesearch'])
const handleSearch = ()=>{ 
  queryParams.tag = []

  queryParams.tagIds.forEach(val => {
    const item = tagOptions.find(t => t.value === val)
    if (item) queryParams.tag.push(item.label)
  })

    emit('search',{
      keyword: queryParams.keyword,
      tag: queryParams.tag
    })
}

// 用于手动清空的方法
const handleSortClick = () => {
  // 如果当前已经有值，点击后置为 null（清空）
  if (queryParams.sortIds !== null) {
    queryParams.sortIds = null;
    singleSearch(); // 同时触发搜索，确保界面更新
  }
};


const singleSearch = () => { 
  if(queryParams.sortIds !== null){ // 增加判空
    let a = sort[queryParams.sortIds].label;
    emit('singlesearch', { a });
  } else {
    emit('singlesearch', { a: null }); // 清空时传递null
  }
};


const tagOptions = [
  { label: 'Vue3', value: 0 },
  { label: 'Nuxt3', value: 1 },
  { label: 'Node.js', value: 2 },
  { label: 'Python', value: 3 },
  { label: 'AI实战', value: 4 },
  { label: '信息差', value: 5 },
  { label: '人工智能', value: 6 }
];


const sort = [
  { label: '免费课程', value: 0 },
  { label: '热门/已付费', value: 1 },
  { label: '付费优先', value: 2 }
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