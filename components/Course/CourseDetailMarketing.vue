<template>
  <div class="page-wrap">
    <!-- 顶部课程信息卡片 -->
    <div class="header-card">
      <div class="cover-box">
        <img :src="coverUrl || 'https://api.dicebear.com/7.x/shapes/svg?seed=1'" class="cover-img" />
      </div>
      <div class="info-box">
        <h1 class="course-title">{{ data.title }}</h1>
        <p class="course-desc">{{ data.intro || data.desc || '暂无介绍' }}</p>
        <div class="meta-row">
          <span class="meta-item">约 {{ data.buyCount || 0 }} 人学习</span>
          <span class="meta-sep">·</span>
          <span class="meta-item price-text">
            {{ Number(data.price) > 0 ? '¥' + data.price : '免费' }}
          </span>
        </div>
        <div class="btn-row">
          <n-button type="primary" color="#18a058" @click="$emit('pay')">
            {{ isPaid ? '继续学习' : '立即学习' }}
          </n-button>
          <n-button secondary style="margin-left:10px" @click="openEditBasic">
            <template #icon><n-icon><CreateOutline /></n-icon></template>
            编辑基础信息
          </n-button>
          <n-button secondary style="margin-left:10px" @click="editMode = !editMode">
            <template #icon><n-icon><CreateOutline /></n-icon></template>
            {{ editMode ? '退出编辑' : '编辑课程内容' }}
          </n-button>
        </div>
      </div>
    </div>

    <!-- 课程目录（含编辑功能） -->
    <CourseOutlineManager
      :course-id="String(courseId)"
      :edit-mode="editMode"
    />

    <!-- 编辑基础信息弹窗 -->
    <CourseEditModal
      v-model:show="showEditBasic"
      :tag-options="tagOptions"
      :init-data="editInitData"
      @success="onEditSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NIcon } from 'naive-ui';
import { CreateOutline } from '@vicons/ionicons5';
import CourseOutlineManager from '~/components/Course/edit/CourseOutlineManager.vue';
import CourseEditModal from '~/components/Course/CourseEditModal.vue';
import { apiGetCoverUrls, apiGetMaterialUrl, getAuthHeaders } from '~/composables/Api/Course/course';
import { fetchConfig } from '~/composables/useHttp';

const props = defineProps<{
  data: any;
  isPaid?: boolean;
}>();
defineEmits(['pay']);

const route = useRoute();
const courseId = route.params.id;
const isPaid = computed(() => props.isPaid || props.data?.buyFlag === 1);
const editMode = ref(false);

// 封面临时URL
const coverUrl = ref(props.data?.cover || '');

// 课程资料列表
const courseMaterials = ref<any[]>([]);

onMounted(async () => {
  if (props.data?.id) {
    // 加载封面
    try {
      const res: any = await apiGetCoverUrls([props.data.id], 30);
      if (res?.code === 200 && res.data?.[props.data.id]) {
        coverUrl.value = res.data[props.data.id];
      }
    } catch {}

    // 加载课程资料
    try {
      const matRes: any = await $fetch(`/course/${props.data.id}/materials`, {
        baseURL: fetchConfig.baseURL,
        headers: getAuthHeaders(),
      });
      if (matRes?.code === 200 && Array.isArray(matRes.data)) {
        courseMaterials.value = matRes.data;
      }
    } catch {}
  }
});

// 下载资料
async function downloadMaterial(mat: any) {
  const id = mat.id || mat.materialId;
  if (!id) {
    window.open(mat.fileUrl || mat.url, '_blank');
    return;
  }
  try {
    const res: any = await apiGetMaterialUrl(id, 120);
    if (res?.code === 200 && res.data) {
      window.open(res.data, '_blank');
    } else {
      window.open(mat.fileUrl || mat.url, '_blank');
    }
  } catch {
    window.open(mat.fileUrl || mat.url, '_blank');
  }
}

// ===== 编辑基础信息 =====
const showEditBasic = ref(false);
const tagOptions = ref<any[]>([]);
const editInitData = ref<any>(null);

// 加载标签
const loadTags = async () => {
  if (tagOptions.value.length > 0) return;
  try {
    const res: any = await $fetch('/course/tags', {
      baseURL: fetchConfig.baseURL,
      headers: {
        token: process.client ? (localStorage.getItem('token') || localStorage.getItem('Token') || '') : '',
        appid: fetchConfig.headers.appid,
      },
    });
    const list = res?.code === 200 ? (res.data || []) : [];
    tagOptions.value = list.map((item: any) => ({
      label: item.name || item.tagName,
      value: item.id,
    }));
  } catch {}
};

async function openEditBasic() {
  await loadTags();

  // 诊断：打印课程原始数据
  console.log('[EditBasic] props.data:', JSON.stringify({
    id: props.data?.id,
    tags: props.data?.tags,
    tagList: props.data?.tagList,
    tagIds: props.data?.tagIds,
  }));

  // 加载课程资料列表
  let materials: any[] = [];
  try {
    const matRes: any = await $fetch(`/course/${props.data?.id}/materials`, {
      baseURL: fetchConfig.baseURL,
      headers: getAuthHeaders(),
    });
    console.log('[EditBasic] materials res:', JSON.stringify(matRes));
    if (matRes?.code === 200 && Array.isArray(matRes.data)) {
      materials = matRes.data.map((m: any) => ({
        id: m.id || m.materialId,
        name: m.materialName || m.name || '',
        url: m.fileUrl || m.url || '',
        size: m.fileSize ? (m.fileSize / 1024).toFixed(2) + ' MB' : '',
        type: m.fileType || m.type || '',
        download_count: m.downloadCount || 0,
      }));
    }
  } catch (e) {
    console.error('[EditBasic] load materials error:', e);
  }

  // 标签 id 列表：兼容多种格式
  const rawTags = props.data?.tags || props.data?.tagList || props.data?.tagIds || [];
  const tagIds = rawTags.map((t: any) => {
    if (typeof t === 'object' && t !== null) return t.id ?? t.tagId ?? t.value;
    return t;
  }).filter((id: any) => id != null);

  console.log('[EditBasic] resolved tagIds:', tagIds);

  editInitData.value = {
    id: props.data?.id,
    title: props.data?.title || '',
    desc: props.data?.intro || props.data?.desc || '',
    cover: coverUrl.value || props.data?.cover || '',
    coverPath: props.data?.cover || '',
    tagIds,
    service_period: props.data?.servicePeriod || props.data?.service_period || 12,
    service_content: props.data?.serviceContent || props.data?.service_content || '源码+文档+网站答疑+专属交流微信群',
    price: props.data?.price || 0,
    tPrice: props.data?.tPrice || props.data?.t_price || 0,
    type: props.data?.type || 'media',
    materials,
  };
  showEditBasic.value = true;
}

function onEditSuccess() {
  // 刷新页面数据
  window.location.reload();
}
</script>

<style scoped>
.page-wrap {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px 16px;
}
.header-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.cover-box { flex-shrink: 0; }
.cover-img {
  width: 260px;
  height: 160px;
  object-fit: cover;
  border-radius: 6px;
  display: block;
}
.info-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.course-title { font-size: 22px; font-weight: 700; margin: 0; color: #1a1a1a; }
.course-desc { font-size: 14px; color: #666; margin: 0; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.meta-row { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #888; }
.meta-sep { color: #ddd; }
.price-text { color: #18a058; font-weight: 600; }
.btn-row { display: flex; align-items: center; margin-top: 8px; }

/* 资料下载 */
.material-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  margin-top: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.material-header {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 14px;
}
.material-list { display: flex; flex-direction: column; gap: 8px; }
.material-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}
.mat-icon { font-size: 16px; flex-shrink: 0; }
.mat-name { flex: 1; font-size: 14px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mat-type {
  font-size: 12px; color: #888;
  background: #e8e8e8; padding: 2px 8px; border-radius: 10px; flex-shrink: 0;
}
.mat-dl-btn {
  background: #18a058; color: #fff; border: none;
  border-radius: 5px; padding: 5px 14px; font-size: 13px;
  cursor: pointer; flex-shrink: 0; transition: background 0.2s;
}
.mat-dl-btn:hover { background: #0e7a3e; }
</style>
