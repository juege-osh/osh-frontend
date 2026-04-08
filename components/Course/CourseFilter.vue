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
          v-model:value="modelValue.isFree"
          placeholder="收费/免费"
          :options="priceOptions"
          style="width: 120px"
          clearable
          @update:value="handleUpdate"
        />

        <n-button
          :secondary="!modelValue.isFollowing"
          :type="modelValue.isFollowing ? 'primary' : 'default'"
          @click="toggleFollowing"
        >
          <template #icon>
            <n-icon
              ><HeartOutline v-if="!modelValue.isFollowing" /><Heart v-else
            /></n-icon>
          </template>
          我的关注
        </n-button>

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

      <n-button type="primary" @click="handleCreateClick">
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
import { Add, SearchOutline, HeartOutline, Heart } from '@vicons/ionicons5';
import { ref } from 'vue';

const props = defineProps({
  modelValue: Object,
  tagOptions: Array,
});

const emit = defineEmits(['update:modelValue', 'search', 'create']);

// 价格筛选选项
const priceOptions = [
  { label: '免费课程', value: true },
  { label: '付费课程', value: false },
];

// 处理关注状态切换
const toggleFollowing = () => {
  props.modelValue.isFollowing = !props.modelValue.isFollowing;
  handleUpdate();
};

const handleUpdate = () => {
  emit('update:modelValue', props.modelValue);
  emit('search');
};
const handleCreateClick = () => {
  console.log('子组件：准备触发新增事件');
  emit('create');
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
