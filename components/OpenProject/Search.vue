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

          <n-input
            v-model:value="queryParams.keyword"
            placeholder="搜索课程..."
            style="width: 220px"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix
              ><n-icon><SearchOutline /></n-icon
            ></template>
          </n-input>
        </n-space>

        <n-button type="primary" @click="goToCreate">
          新增开源项目
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
import { SearchOutline} from '@vicons/ionicons5'


const emit = defineEmits(['search'])
const handleSearch = ()=>{ 
    emit('search',queryParams)
}

const queryParams = reactive({
  keyword: '',
  tagIds: [],
});

const tagOptions = [
  { label: 'Vue3', value: 1 },
  { label: 'Nuxt3', value: 2 },
  { label: 'Node.js', value: 3 },
  { label: 'Python', value: 4 },
  { label: 'AI实战', value: 5 },
  { label: '信息差', value: 6 },
];

function goToCreate() {
  navigateTo('/openproject/create');
}

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