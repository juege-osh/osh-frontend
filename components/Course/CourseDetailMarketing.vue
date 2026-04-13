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
          <n-button secondary style="margin-left:10px" @click="editMode = !editMode">
            <template #icon><n-icon><CreateOutline /></n-icon></template>
            {{ editMode ? '退出编辑' : '编辑课程信息' }}
          </n-button>
        </div>
      </div>
    </div>

    <!-- 课程目录（含编辑功能） -->
    <CourseOutlineManager
      :course-id="String(courseId)"
      :edit-mode="editMode"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { NButton, NIcon } from 'naive-ui';
import { CreateOutline } from '@vicons/ionicons5';
import CourseOutlineManager from '~/components/Course/edit/CourseOutlineManager.vue';
import { apiGetCoverUrls } from '~/composables/Api/Course/course';

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

onMounted(async () => {
  if (props.data?.id) {
    try {
      const res: any = await apiGetCoverUrls([props.data.id], 30);
      if (res?.code === 200 && res.data?.[props.data.id]) {
        coverUrl.value = res.data[props.data.id];
      }
    } catch {}
  }
});
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
</style>
