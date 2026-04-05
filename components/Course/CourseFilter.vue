<template>
  <div class="compact-filter">
    <n-space align="center" justify="space-between">
      <n-space>
        <n-select
          v-model:value="modelValue.tags"
          multiple
          filterable
          placeholder="按标签筛选 (可多选)"
          :options="tagOptions"
          style="width: 260px"
          @update:value="handleUpdate"
        />

        <n-select
          v-model:value="modelValue.type"
          placeholder="课程类型"
          :options="typeOptions"
          style="width: 140px"
          clearable
          @update:value="$emit('search')"
        />

        <n-input
          v-model:value="modelValue.keyword"
          placeholder="搜索课程..."
          style="width: 220px"
          clearable
          @keyup.enter="$emit('search')"
        >
          <template #prefix>
            <n-icon><SearchOutline /></n-icon>
          </template>
        </n-input>
      </n-space>

      <n-button type="primary" @click="$emit('create')">
        <template #icon>
          <n-icon><Add /></n-icon>
        </template>
        新增课程
      </n-button>
    </n-space>
  </div>
</template>

<script setup>
import { NSpace, NSelect, NInput, NButton, NIcon } from 'naive-ui';
import { Add, SearchOutline } from '@vicons/ionicons5';

const props = defineProps({
  modelValue: Object,
  tagOptions: Array,
  typeOptions: Array,
});

const emit = defineEmits(['update:modelValue', 'search', 'create']);

// 封装一个更新函数，确保数据同步后立即搜索
const handleUpdate = () => {
  emit('update:modelValue', props.modelValue);
  emit('search');
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
