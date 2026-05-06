<template>
  <LoadingGroup :pending="pending" :error="error">
    <main class="tool-detail-page">
      <button class="back-btn" @click="goBack">返回工具列表</button>

      <section v-if="tool" class="detail-hero">
        <div class="cover-panel">
          <div class="cover-wrap">
            <img :src="tool.logoUrl || fallbackLogo" :alt="tool.toolName" />
            <span class="resource-badge" :class="resourceBadgeClass">{{ resourceTypeLabel }}</span>
          </div>
        </div>

        <div class="info-panel">
          <div class="title-row">
            <div>
              <p class="kicker">Tool Detail</p>
              <h1>{{ tool.toolName }}</h1>
            </div>
            <button class="favorite-btn" :class="{ active: isCollected }" @click.stop.prevent="toggleFavorite">
              {{ isCollected ? '已收藏' : '收藏' }}
            </button>
          </div>

          <p class="description">{{ tool.description || '暂无工具简介。' }}</p>

          <div v-if="tags.length" class="tag-row">
            <span v-for="tag in tags" :key="tag" class="tag-chip">{{ tag }}</span>
          </div>

          <div class="metric-grid">
            <div class="metric-card">
              <span>使用次数</span>
              <strong>{{ tool.totalUsage || 0 }}</strong>
            </div>
            <div class="metric-card">
              <span>收藏数</span>
              <strong>{{ tool.collectionCount || 0 }}</strong>
            </div>
            <div class="metric-card">
              <span>权限等级</span>
              <strong>{{ tool.level || 1 }}</strong>
            </div>
            <div class="metric-card">
              <span>访问方式</span>
              <strong>{{ accessTypeLabel }}</strong>
            </div>
          </div>

          <div class="purchase-row">
            <div class="price-block">
              <span class="price">{{ priceText }}</span>
              <span v-if="showOriginalPrice" class="origin">¥{{ tool.originalPrice }}</span>
              <span v-if="Number(tool.pointCost || 0) > 0" class="point-cost">{{ tool.pointCost }} 积分/次</span>
            </div>
            <button class="open-btn" @click="openTool">{{ openButtonText }}</button>
          </div>
        </div>
      </section>

      <section v-if="tool" class="detail-section">
        <h2>工具信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <span>资源类型</span>
            <strong>{{ resourceTypeLabel }}</strong>
          </div>
          <div class="info-item">
            <span>好评 / 中评 / 差评</span>
            <strong>{{ tool.goodCount || 0 }} / {{ tool.neutralCount || 0 }} / {{ tool.badCount || 0 }}</strong>
          </div>
          <div class="info-item">
            <span>GitHub</span>
            <a v-if="tool.githubUrl" class="text-link" :href="tool.githubUrl" target="_blank" rel="noopener noreferrer">打开地址</a>
            <strong v-else>暂无</strong>
          </div>
          <div class="info-item">
            <span>访问地址</span>
            <a
              v-if="toolLink"
              class="text-link"
              :href="toolLink"
              :target="Number(tool.accessType) === 2 ? '_blank' : '_self'"
              rel="noopener noreferrer"
              @click.prevent="openTool"
            >
              {{ Number(tool.accessType) === 2 ? '打开第三方地址' : '进入站内路由' }}
            </a>
            <strong v-else>暂无</strong>
          </div>
          <div class="info-item">
            <span>更新时间</span>
            <strong>{{ tool.updateTime || tool.createTime || '--' }}</strong>
          </div>
        </div>
      </section>
    </main>
  </LoadingGroup>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { createDiscreteApi } from 'naive-ui';
import {
  apiCollectTool,
  apiRemoveCollectTool,
  apiToolDetail,
} from '~/composables/Api/Tool/tool';

const route = useRoute();
const router = useRouter();
const { message } = createDiscreteApi(['message']);

const fallbackLogo = 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg';
const resourceTypeMap = {
  FREE: '免费',
  CASH_ONLY: '付费',
  CASH_POINT: '现金+积分',
  VIP: 'VIP',
  SMALL_CLASS: '小班专属',
  INTERNAL: '内部',
};

const {
  data,
  pending,
  error,
} = await useAsyncData(
  `tool-detail-${route.params.id}`,
  () => apiToolDetail(route.params.id),
  { server: false }
);

const tool = computed(() => data.value?.data || data.value || null);
const isCollected = ref(false);

watch(
  tool,
  (value) => {
    isCollected.value = Number(value?.collectionFlag || 0) === 1;
  },
  { immediate: true }
);

const tags = computed(() => tool.value?.tags || []);
const resourceTypeLabel = computed(() => resourceTypeMap[tool.value?.resourceType] || tool.value?.resourceType || '免费');
const resourceBadgeClass = computed(() => {
  const type = tool.value?.resourceType || 'FREE';
  return {
    free: type === 'FREE',
    paid: type === 'CASH_ONLY' || type === 'CASH_POINT',
    vip: type === 'VIP' || type === 'SMALL_CLASS' || type === 'INTERNAL',
  };
});
const accessTypeLabel = computed(() => Number(tool.value?.accessType) === 2 ? '第三方 iframe' : '站内工具');
const openButtonText = computed(() => Number(tool.value?.accessType) === 2 ? '打开第三方工具' : '进入工具');
const priceText = computed(() => {
  const price = Number(tool.value?.price || 0);
  return price > 0 ? `¥${tool.value.price}` : '免费';
});
const showOriginalPrice = computed(() => {
  const originalPrice = Number(tool.value?.originalPrice || 0);
  const price = Number(tool.value?.price || 0);
  return originalPrice > 0 && originalPrice !== price;
});
const toolLink = computed(() => {
  const current = tool.value;
  if (!current) return '';
  if (Number(current.accessType) === 2) return current.iframeUrl || '';
  return current.routePath || '';
});

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    navigateTo('/tool/1');
  }
}

function openTool() {
  const current = tool.value;
  if (!current) return;
  if (Number(current.accessType) === 2 && current.iframeUrl) {
    window.open(current.iframeUrl, '_blank');
    return;
  }
  if (current.routePath) {
    navigateTo(current.routePath);
    return;
  }
  message.warning('该工具暂未配置访问地址');
}

async function toggleFavorite() {
  const current = tool.value;
  if (!current) return;
  const nextCollected = !isCollected.value;
  const previousCount = Number(current.collectionCount || 0);
  isCollected.value = nextCollected;
  current.collectionFlag = nextCollected ? 1 : 0;
  current.collectionCount = nextCollected ? previousCount + 1 : Math.max(0, previousCount - 1);
  try {
    const res = nextCollected
      ? await apiCollectTool(current.id)
      : await apiRemoveCollectTool(current.id);
    if (res?.code && res.code !== 200) {
      throw new Error(res.msg || '收藏操作失败');
    }
    message.success(nextCollected ? '收藏成功' : '已取消收藏');
  } catch (e) {
    isCollected.value = !nextCollected;
    current.collectionFlag = nextCollected ? 0 : 1;
    current.collectionCount = previousCount;
    message.error(e?.message || '收藏操作失败');
  }
}

useHead(() => ({
  title: tool.value?.toolName ? `${tool.value.toolName} - 工具详情` : '工具详情',
}));
</script>

<style scoped>
.tool-detail-page {
  max-width: 1180px;
  margin: 0 auto;
  padding: 18px 24px 42px;
}
.back-btn {
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  color: #334155;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
  font-weight: 600;
  margin-bottom: 16px;
}
.back-btn:hover { border-color: #18a058; color: #18a058; }
.detail-hero {
  display: grid;
  grid-template-columns: 360px minmax(0, 1fr);
  gap: 24px;
  align-items: stretch;
}
.cover-panel,
.info-panel,
.detail-section {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: linear-gradient(150deg, rgba(255,255,255,0.98), rgba(247,250,252,0.94));
  border-radius: 8px;
  box-shadow: 0 20px 48px rgba(15, 23, 42, 0.08);
}
.cover-panel {
  padding: 20px;
}
.cover-wrap {
  position: relative;
  overflow: hidden;
  height: 360px;
  border-radius: 8px;
  background: #eef2f7;
}
.cover-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.resource-badge {
  position: absolute;
  left: 16px;
  bottom: 16px;
  max-width: calc(100% - 32px);
  padding: 9px 14px;
  border-radius: 999px;
  color: #10213a;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
  backdrop-filter: blur(12px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.18);
}
.resource-badge.free { background: rgba(187, 247, 208, 0.92); }
.resource-badge.paid { background: rgba(254, 240, 138, 0.94); }
.resource-badge.vip {
  color: #f8fafc;
  background: rgba(79, 70, 229, 0.88);
}
.info-panel {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.kicker {
  margin: 0 0 8px;
  color: #0f766e;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
h1 {
  margin: 0;
  color: #10213a;
  font-size: 34px;
  line-height: 1.2;
}
.favorite-btn {
  border: 0;
  border-radius: 8px;
  padding: 10px 16px;
  background: #eef2f7;
  color: #334155;
  cursor: pointer;
  font-weight: 700;
  white-space: nowrap;
}
.favorite-btn.active {
  background: #fee2e2;
  color: #d03050;
}
.description {
  margin: 0;
  min-height: 56px;
  color: #64748b;
  font-size: 15px;
  line-height: 1.8;
}
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag-chip {
  max-width: 150px;
  padding: 7px 12px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.metric-card,
.info-item {
  border-radius: 8px;
  background: rgba(241, 245, 249, 0.78);
  padding: 14px;
}
.metric-card span,
.info-item span {
  display: block;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 8px;
}
.metric-card strong,
.info-item strong,
.info-item a {
  color: #10213a;
  font-size: 18px;
  font-weight: 800;
  text-decoration: none;
}
.info-item a.text-link {
  color: #1d4ed8;
  text-decoration: underline;
  text-underline-offset: 4px;
  cursor: pointer;
}
.info-item a.text-link:hover {
  color: #0f766e;
}
.purchase-row {
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
}
.price-block {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-wrap: wrap;
}
.price {
  color: #ea3f13;
  font-size: 32px;
  font-weight: 900;
}
.origin {
  color: #94a3b8;
  text-decoration: line-through;
}
.point-cost {
  color: #7c3aed;
  font-weight: 800;
}
.open-btn {
  border: 0;
  border-radius: 8px;
  padding: 13px 26px;
  color: #fff;
  background: linear-gradient(135deg, #13236f, #1d4ed8);
  cursor: pointer;
  font-weight: 800;
  white-space: nowrap;
  box-shadow: 0 14px 28px rgba(29, 78, 216, 0.24);
}
.open-btn:hover {
  transform: translateY(-1px);
}
.detail-section {
  margin-top: 22px;
  padding: 24px;
}
.detail-section h2 {
  margin: 0 0 16px;
  color: #10213a;
  font-size: 22px;
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 980px) {
  .tool-detail-page {
    padding: 14px 14px 32px;
  }
  .detail-hero {
    grid-template-columns: 1fr;
  }
  .cover-wrap {
    height: 280px;
  }
  .metric-grid,
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .title-row,
  .purchase-row {
    flex-direction: column;
    align-items: stretch;
  }
  h1 {
    font-size: 26px;
  }
  .metric-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }
  .open-btn {
    width: 100%;
  }
}
</style>
