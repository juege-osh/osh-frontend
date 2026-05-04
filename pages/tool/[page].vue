<template>
  <div class="tool-container">
    <ToolFilter
      v-model:modelValue="queryParams"
      :tag-options="tagOptions"
      @search="handleSearch"
    >
      <template #actions>
        <ClientOnly>
          <button v-if="canCreate" class="btn-create-tool" @click="handleCreateTool">
            + 新增工具
          </button>
          <button v-if="canDelete" class="btn-select-mode" :class="{ active: selectMode }" @click="toggleSelectMode">
            {{ selectMode ? '退出选择' : '☑ 选择删除' }}
          </button>
          <template v-if="canDelete && selectedIds.size > 0">
            <span class="batch-tip">已选 {{ selectedIds.size }} 个工具</span>
            <button class="btn-batch-cancel" @click="selectedIds.clear(); selectMode = false">取消</button>
            <button class="btn-batch-delete" @click="handleBatchDelete">🗑 删除选中</button>
          </template>
        </ClientOnly>
      </template>
    </ToolFilter>

    <div class="list-main-section">
      <Transition name="fade">
        <div v-if="pending" class="loading-overlay">
          <n-spin size="large" />
        </div>
      </Transition>

      <ClientOnly>
        <div class="grid-content-box">
          <n-grid
            v-if="displayList && displayList.length > 0"
            :x-gap="16"
            :y-gap="16"
            :cols="5"
          >
            <n-gi v-for="item in displayList" :key="item.id">
              <ToolCard
                :item="item"
                :selectable="selectMode"
                :selected="selectedIds.has(item.id)"
                @click="handleOpenTool(item)"
                @favorite="handleDoCollect"
                @select="toggleSelect"
              />
            </n-gi>
          </n-grid>

          <div v-else-if="!pending" class="empty-placeholder">
            <n-empty :description="queryParams.isFollowing ? '暂无收藏的工具' : '暂无工具数据'" />
          </div>
        </div>
      </ClientOnly>

      <div class="pagination-footer">
        <n-pagination
          v-model:page="queryParams.pageNum"
          :item-count="totalCount"
          :page-size="queryParams.pageSize"
          @update:page="handleRefresh"
        />
      </div>
    </div>

    <ToolEditModal v-model:show="showCreateModal" :tag-options="tagOptions" @success="handleCreateSuccess" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { createDiscreteApi, NGrid, NGi, NPagination, NSpin, NEmpty } from 'naive-ui';
import ToolFilter from '~/components/Tool/ToolFilter.vue';
import ToolCard from '~/components/Tool/ToolCard.vue';
import ToolEditModal from '~/components/Tool/ToolEditModal.vue';
import {
  apiCollectTool,
  apiDeleteTool,
  apiRemoveCollectTool,
  apiToolTags,
  useToolSearchApi,
} from '~/composables/Api/Tool/tool';

const route = useRoute();
const { permissionList } = usePermission();

const canCreate = computed(() => permissionList.value.includes('tool:create'));
const canDelete = computed(() => permissionList.value.includes('tool:delete'));

const queryParams = reactive({
  keyword: '',
  tags: [],
  pageNum: Number(route.params.page || 1),
  pageSize: 10,
  isFollowing: false,
  collectionFlag: null,
  sortType: 'all',
  resourceType: null,
});

const {
  data: resData,
  pending,
  refresh,
} = await useToolSearchApi(queryParams);

const toolList = ref([]);
const tagOptions = ref([]);
const selectMode = ref(false);
const selectedIds = ref(new Set());
const showCreateModal = ref(false);

const syncToolList = (payload) => {
  if (!payload) {
    toolList.value = [];
    return;
  }
  const actualData = payload?.data?.rows ? payload.data : payload;
  const rows = actualData?.rows || [];
  const prevMap = new Map(toolList.value.map((item) => [item.id, item]));
  toolList.value = rows.map((item) => {
    const prev = prevMap.get(item.id);
    const isFavorite = prev != null ? prev.isFavorite : item.collectionFlag === 1;
    return {
      ...item,
      isFavorite,
      collectionFlag: isFavorite ? 1 : 0,
      favoriteCount: prev != null ? prev.favoriteCount : (item.collectionCount || 0),
      collectionCount: prev != null ? prev.favoriteCount : (item.collectionCount || 0),
    };
  });
};

const loadTools = async () => {
  await refresh();
  syncToolList(resData.value);
};

const loadTags = async () => {
  try {
    const res = await apiToolTags();
    const list = res?.code === 200 ? (res.data || []) : [];
    tagOptions.value = list.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (e) {
    console.error('加载工具标签失败', e);
  }
};

onMounted(() => {
  loadTags();
  loadTools();
});

const totalCount = computed(() => {
  const actualData =
    resData.value?.data?.total !== undefined
      ? resData.value.data
      : resData.value;
  return actualData?.total || 0;
});

const displayList = computed(() => {
  if (!queryParams.isFollowing) return toolList.value;
  return toolList.value.filter((item) => item.collectionFlag === 1 || item.isFavorite);
});

function toggleSelectMode() {
  selectMode.value = !selectMode.value;
  if (!selectMode.value) selectedIds.value.clear();
}

function handleCreateTool() {
  showCreateModal.value = true;
}

async function handleCreateSuccess() {
  queryParams.pageNum = 1;
  await loadTags();
  await loadTools();
}

function toggleSelect(id) {
  const s = new Set(selectedIds.value);
  if (s.has(id)) s.delete(id);
  else s.add(id);
  selectedIds.value = s;
}

async function handleBatchDelete() {
  const { message, dialog } = createDiscreteApi(['message', 'dialog']);
  dialog.warning({
    title: '确认删除',
    content: `确定删除选中的 ${selectedIds.value.size} 个工具？`,
    positiveText: '确认删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const ids = Array.from(selectedIds.value);
        const res = await apiDeleteTool(ids);
        if (res?.code === 200) {
          message.success(`已删除 ${ids.length} 个工具`);
          selectedIds.value.clear();
          selectMode.value = false;
          queryParams.pageNum = 1;
          await loadTools();
        } else {
          message.error(res?.msg || '删除失败');
        }
      } catch (e) {
        message.error('删除失败，请重试');
      }
    },
  });
}

const handleSearch = () => {
  queryParams.pageNum = 1;
  loadTools();
};

const handleRefresh = (page) => {
  queryParams.pageNum = page || 1;
  navigateTo(`/tool/${queryParams.pageNum}`, { replace: true });
  loadTools();
};

const handleOpenTool = (item) => {
  if (item.accessType === 1 && item.routePath) {
    navigateTo(item.routePath);
    return;
  }
  if (item.accessType === 2 && item.iframeUrl) {
    window.open(item.iframeUrl, '_blank');
    return;
  }
  navigateTo(`/tool/detail/${item.id}`);
};

const handleDoCollect = async (toolId) => {
  const { message } = createDiscreteApi(['message']);
  const tool = toolList.value.find((item) => item.id === toolId);
  if (!tool) return;

  const wasCollected = tool.isFavorite;
  const previousCount = tool.favoriteCount || tool.collectionCount || 0;
  tool.isFavorite = !wasCollected;
  tool.collectionFlag = wasCollected ? 0 : 1;
  tool.favoriteCount = wasCollected
    ? Math.max(0, previousCount - 1)
    : previousCount + 1;
  tool.collectionCount = tool.favoriteCount;

  try {
    const res = wasCollected
      ? await apiRemoveCollectTool(toolId)
      : await apiCollectTool(toolId);

    if (res?.code === 200) {
      message.success(wasCollected ? '已取消收藏' : '收藏成功');
    } else {
      rollbackFavorite(tool, wasCollected, previousCount);
      message.error(res?.msg || '操作失败');
    }
  } catch {
    rollbackFavorite(tool, wasCollected, previousCount);
    message.error('请求失败');
  }
};

const rollbackFavorite = (tool, wasCollected, previousCount) => {
  tool.isFavorite = wasCollected;
  tool.collectionFlag = wasCollected ? 1 : 0;
  tool.favoriteCount = previousCount;
  tool.collectionCount = tool.favoriteCount;
};
</script>

<style scoped>
.tool-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}
.batch-tip { font-size: 14px; color: #d03050; font-weight: 600; }
.btn-select-mode,
.btn-batch-cancel,
.btn-batch-delete,
.btn-create-tool {
  border-radius: 6px;
  padding: 7px 16px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-select-mode {
  background: #fff; color: #666; border: 1px solid #d9d9d9;
}
.btn-select-mode:hover, .btn-select-mode.active {
  border-color: #d03050; color: #d03050; background: #fff2f0;
}
.btn-batch-cancel {
  background: #fff; color: #666; border: 1px solid #d9d9d9;
}
.btn-batch-cancel:hover { border-color: #999; color: #333; }
.btn-batch-delete {
  background: #d03050; color: #fff; border: 1px solid #d03050;
}
.btn-batch-delete:hover { background: #a0203a; border-color: #a0203a; }
.btn-create-tool {
  background: #fff; color: #18a058; border: 1px solid #18a058;
}
.btn-create-tool:hover { background: #18a058; color: #fff; }
.list-main-section {
  position: relative;
  display: flex;
  flex-direction: column;
}
.grid-content-box {
  min-height: 200px;
  margin-bottom: 12px;
}
.pagination-footer {
  display: flex;
  justify-content: center;
  padding-bottom: 16px;
}
.loading-overlay {
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
