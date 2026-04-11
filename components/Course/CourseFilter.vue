<template>
  <div class="compact-filter">
    <n-space align="center" justify="space-between">
      <n-space align="center" wrap :size="12">
        <n-select
          v-model:value="modelValue.tags"
          multiple
          filterable
          placeholder="选择标签筛选"
          :options="tagOptions"
          style="width: 220px"
          clearable
        />

        <n-select
          v-model:value="modelValue.sortType"
          placeholder="排序/筛选"
          :options="combinedOptions"
          style="width: 160px"
          @update:value="handleSearch"
        />

        <n-button
          :secondary="!modelValue.isFollowing"
          :type="modelValue.isFollowing ? 'primary' : 'default'"
          @click="toggleFollowing"
        >
          <template #icon>
            <n-icon>
              <Heart v-if="modelValue.isFollowing" />
              <HeartOutline v-else />
            </n-icon>
          </template>
          我关注的
        </n-button>

        <n-input
          v-model:value="modelValue.keyword"
          placeholder="搜索课程关键字..."
          style="width: 180px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <n-icon><SearchOutline /></n-icon>
          </template>
        </n-input>

        <n-input
          v-model:value="modelValue.courseNo"
          placeholder="课程编号ID..."
          style="width: 150px"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <n-icon><LayersOutline /></n-icon>
          </template>
        </n-input>

        <n-button type="primary" @click="handleSearch">
          <template #icon>
            <n-icon><SearchOutline /></n-icon>
          </template>
          查询
        </n-button>
      </n-space>

      <n-button type="success" secondary @click="handleCreateClick">
        <template #icon>
          <n-icon><Add /></n-icon>
        </template>
        新增课程
      </n-button>
    </n-space>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  useCourseTagsApi,
  fetchCourseTags,
} from '~/composables/Api/Course/course';
import { NSpace, NSelect, NInput, NButton, NIcon } from 'naive-ui';
import {
  Add,
  SearchOutline,
  HeartOutline,
  Heart,
  LayersOutline,
} from '@vicons/ionicons5';

// 1. 定义 Props 和 Emits
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});
const emit = defineEmits(['update:modelValue', 'search', 'create']);

// 2. 响应式状态
const tagOptions = ref([]);
const loading = ref(false);

// 3. 将请求逻辑封装成普通函数，不在顶层 await
const fetchTagsData = async () => {
  loading.value = true;
  console.log('🚀 准备发起请求...');

  try {
    // 关键点：在函数内部调用 useCourseTagsApi 时，
    // 如果它内部封装的是 useFetch，我们需要手动执行它。
    // 如果它返回的是异步数据对象，我们直接 await 它的结果。
    const res = await useCourseTagsApi();

    // 重点：打印一下 res，看看它到底是个 Ref 还是直接的数据
    console.log('📦 接口响应内容:', res);

    // 兼容性处理：Nuxt 的异步数据可能在 res.data.value 里，也可能直接在 res 里
    const targetData = res.data?.value || res.value || res;

    if (targetData && targetData.code === 200) {
      tagOptions.value = targetData.data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
      console.log('✅ 标签映射成功:', tagOptions.value);
    }
  } catch (error) {
    console.error('❌ 请求发送失败:', error);
  } finally {
    loading.value = false;
  }
};

// 4. 只有在挂载后才发起请求，确保不阻塞页面渲染
onMounted(async () => {
  console.log('📦 组件已挂载，开始暴力请求');
  try {
    // 直接用全局的 $fetch，绕过所有封装，看能不能通
    // 注意：这里的 URL 必须写全，或者是你后端配置好的那个路径
    const res = await $fetch('/course/tags', {
      baseURL: fetchConfig.baseURL, // 🔥 从 course.js 拿统一 baseURL
      headers: {
        ...fetchConfig.headers,
        token: localStorage.getItem('Token'), // 客户端才取 token
      },
    });

    if (res && res.code === 200) {
      tagOptions.value = res.data.map((item) => ({
        label: item.name,
        value: item.id,
      }));
    }
  } catch (e) {
    console.error('暴力请求也失败了:', e);
  }
});

// 5. 其他 UI 逻辑
const combinedOptions = [
  { label: '最新创建 (时间)', value: 'createTime' },
  { label: '免费课程', value: 'free' },
  { label: '热门/已付费', value: 'hot' },
  { label: '付费优先', value: 'priceDesc' },
];

const toggleFollowing = () => {
  props.modelValue.isFollowing = !props.modelValue.isFollowing;
  handleSearch();
};

const handleSearch = () => {
  if (props.modelValue.sortType === 'free') {
    props.modelValue.isFree = true;
  } else {
    props.modelValue.isFree = null;
  }
  emit('update:modelValue', props.modelValue);
  emit('search');
};

const handleCreateClick = () => {
  emit('create');
};
</script>

<style scoped>
.compact-filter {
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-bottom: 20px;
}
</style>
