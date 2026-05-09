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
        <div class="tool-list-box">
          <div v-if="displayList && displayList.length > 0" class="tool-row-list">
            <div
              v-for="item in displayList"
              :key="item.id"
              class="tool-item-row-card"
              :class="{ 'is-active': item.isExpanded, selected: selectedIds.has(item.id) }"
            >
              <div class="one-line-content">
                <button class="collapser-wrapper" type="button" @click.stop="toggleExpand(item)">
                  <span class="expand-arrow" :class="{ rotated: item.isExpanded }">›</span>
                </button>

                <label v-if="selectMode" class="select-check" @click.stop>
                  <input
                    type="checkbox"
                    :checked="selectedIds.has(item.id)"
                    @change="toggleSelect(item.id)"
                  >
                </label>

                <div class="title-section" @click="toggleExpand(item)">
                  <span class="tag">【{{ formatResourceType(item.resourceType) }}】</span>
                  <span class="main-title">{{ item.toolName }}</span>
                  <span v-if="item.description" class="description-text">{{ item.description }}</span>
                </div>

                <div class="meta-group">
                  <span class="meta-item">{{ formatAccessType(item.accessType) }}</span>
                  <span class="meta-item quota" :class="{ active: Number(item.remainingCount || 0) > 0 }">
                    剩余 {{ item.remainingCount || 0 }} 次
                  </span>
                  <span class="meta-item">{{ item.totalUsage || 0 }} 次使用</span>
                  <span class="meta-item">{{ item.collectionCount || 0 }} 收藏</span>
                </div>

                <div class="action-group">
                  <button
                    class="row-action-btn favorite"
                    :class="{ active: item.isFavorite }"
                    type="button"
                    @click.stop="handleDoCollect(item.id)"
                  >
                    {{ item.isFavorite ? '已收藏' : '+收藏' }}
                  </button>
                  <button
                    class="row-action-btn open"
                    type="button"
                    @click.stop="handleOpenTool(item)"
                  >
                    购买工具使用次数
                  </button>
                  <button
                    v-if="canUpdate"
                    class="row-action-btn edit"
                    type="button"
                    @click.stop="handleEditTool(item)"
                  >
                    修改
                  </button>
                </div>
              </div>

              <transition name="expand">
                <div v-if="item.isExpanded" class="tool-embed-area">
                  <iframe
                    v-if="isIframeTool(item) && getEmbedUrl(item)"
                    class="tool-embed-frame"
                    :src="getEmbedUrl(item)"
                    :title="item.toolName"
                  />
                  <component
                    :is="getRuntimeComponent(item)"
                    v-else-if="getRuntimeComponent(item)"
                  />
                  <div v-else class="tool-empty-url">
                    该工具暂未配置可加载的工具文件
                  </div>
                </div>
              </transition>
            </div>
          </div>

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

    <ToolEditModal
      v-model:show="showEditModal"
      :tag-options="tagOptions"
      :edit-data="editingTool"
      @success="handleCreateSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { createDiscreteApi, NPagination, NSpin, NEmpty } from 'naive-ui';
import ToolFilter from '~/components/Tool/ToolFilter.vue';
import ToolEditModal from '~/components/Tool/ToolEditModal.vue';
import {
  apiCollectTool,
  apiDeleteTool,
  apiRemoveCollectTool,
  apiToolTags,
  useToolSearchApi,
} from '~/composables/Api/Tool/tool';
import ToolRuntimeTestTest from '~/components/Tool/runtime/test/test.vue';

const route = useRoute();
const { permissionList } = usePermission();

const canCreate = computed(() => permissionList.value.includes('tool:create'));
const canUpdate = computed(() => permissionList.value.includes('tool:update'));
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
const showEditModal = ref(false);
const editingTool = ref(null);

const runtimeToolMap = {
  '/test/test': ToolRuntimeTestTest,
};

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
      isExpanded: prev != null ? !!prev.isExpanded : false,
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
  editingTool.value = null;
  showEditModal.value = true;
}

function handleEditTool(item) {
  editingTool.value = { ...item };
  showEditModal.value = true;
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
  navigateTo(`/tool/detail/${item.id}`);
};

const toggleExpand = (item) => {
  item.isExpanded = !item.isExpanded;
};

const getFieldValue = (item, camelKey, snakeKey) => item?.[camelKey] || item?.[snakeKey] || '';

const getEmbedUrl = (item) => {
  const accessType = Number(getFieldValue(item, 'accessType', 'access_type'));
  return accessType === 2
    ? getFieldValue(item, 'iframeUrl', 'iframe_url')
    : getFieldValue(item, 'routePath', 'route_path');
};

const isIframeTool = (item) => Number(getFieldValue(item, 'accessType', 'access_type')) === 2;

const getRuntimeComponent = (item) => {
  const routePath = getFieldValue(item, 'routePath', 'route_path');
  return runtimeToolMap[routePath] || null;
};

const formatAccessType = (accessType) => Number(accessType) === 2 ? '外部页面' : '站内页面';

const formatResourceType = (resourceType) => {
  const typeMap = {
    FREE: '免费',
    CASH_ONLY: '付费',
    CASH_POINT: '现金+积分',
    VIP: 'VIP',
    SMALL_CLASS: '小班',
    INTERNAL: '内部',
  };
  return typeMap[resourceType] || resourceType || '工具';
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
.tool-list-box {
  min-height: 200px;
  margin-bottom: 12px;
}
.tool-row-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tool-item-row-card {
  background: #fff;
  border: 1px solid #efeff5;
  border-radius: 6px;
  overflow: hidden;
  transition: all 0.2s ease;
}
.tool-item-row-card:hover {
  border-color: #26a67a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.tool-item-row-card.is-active {
  border-color: #26a67a;
  box-shadow: 0 4px 12px rgba(38, 166, 122, 0.08);
}
.tool-item-row-card.selected {
  border-color: #d03050;
}
.one-line-content {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 8px 14px;
}
.collapser-wrapper {
  width: 24px;
  height: 24px;
  border: 0;
  background: transparent;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
}
.expand-arrow {
  font-size: 24px;
  line-height: 1;
  transition: transform 0.25s ease;
}
.expand-arrow.rotated {
  color: #26a67a;
  transform: rotate(90deg);
}
.select-check {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.title-section {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.tag {
  color: #165d69;
  font-weight: 700;
  white-space: nowrap;
}
.main-title {
  color: #333;
  font-size: 15px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.description-text {
  color: #666;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta-group {
  display: flex;
  gap: 12px;
  color: #888;
  font-size: 12px;
  flex-shrink: 0;
}
.meta-item {
  white-space: nowrap;
}
.meta-item.quota {
  color: #d03050;
  font-weight: 700;
}
.meta-item.quota.active {
  color: #18a058;
}
.action-group {
  border-left: 1px solid #eee;
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  padding-left: 12px;
}
.row-action-btn {
  border: 1px solid #d9d9d9;
  border-radius: 5px;
  background: #fff;
  color: #333;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  height: 26px;
  padding: 0 9px;
  transition: all 0.2s;
  white-space: nowrap;
}
.row-action-btn:hover {
  border-color: #26a67a;
  color: #26a67a;
}
.row-action-btn.favorite.active {
  background: #18a058;
  border-color: #18a058;
  color: #fff;
}
.row-action-btn.edit:hover {
  border-color: #4f46e5;
  color: #4f46e5;
}
.tool-embed-area {
  background: #fafafa;
  border-top: 1px dashed #efeff5;
  padding: 12px 16px 16px 46px;
}
.tool-embed-frame {
  width: 100%;
  min-height: 560px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
}
.tool-empty-url {
  color: #999;
  font-size: 13px;
  line-height: 44px;
}
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  transform: translateY(-4px);
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
@media (max-width: 900px) {
  .one-line-content {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .title-section {
    flex-basis: calc(100% - 36px);
  }
  .meta-group,
  .action-group {
    margin-left: 36px;
  }
  .action-group {
    border-left: 0;
    padding-left: 0;
  }
  .tool-embed-area {
    padding-left: 16px;
  }
}
</style>
