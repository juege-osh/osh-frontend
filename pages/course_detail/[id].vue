<template>
  <div class="course-detail-container">
    <div v-if="pending" class="loading-box">
      <n-spin size="large" description="正在加载详情..." />
    </div>

    <template v-else-if="courseData">
      <CourseDetailMarketing
        v-if="!isPaid"
        :data="courseData"
        @pay="handleFakePay"
      />

      <CourseStudyCenter v-else :data="courseData">
        <template #outline>
          <div v-if="courseData.sections?.length">
            <div v-for="(sec, index) in courseData.sections" :key="sec.id">
              {{ index + 1 }}. {{ sec.title }}
            </div>
          </div>
          <n-empty v-else description="暂无目录" size="small" />
        </template>

        <template #files>
          <div v-if="courseData.files?.length"></div>
          <n-empty v-else description="暂无资料" size="small" />
        </template>

        <template #qa>
          <p>暂无提问...</p>
        </template>
      </CourseStudyCenter>
    </template>

    <div v-else>
      <n-empty description="未找到该课程信息" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const courseId = route.params.id;

// --- 第一步：先声明所有响应式变量 ---
const courseData = ref(null);
const isPaid = ref(false);
const isPaying = ref(false);

// --- 第二步：发起异步请求 ---
const { data, pending, error } = await useCourseDetailApi(courseId);

// ✅ 正确写法（你的 useHttp 已经 transform 过了）
if (data.value) {
  courseData.value = data.value;
  isPaid.value = data.value.buyFlag === 1;

  console.log('✅ 成功抓取到数据:', courseData.value.title);
} else {
  console.error('❌ 接口没数据', data.value);
}

// ✅ 正确 watch（可留可不留）
watch(
  data,
  (newVal) => {
    if (newVal) {
      courseData.value = newVal;
      isPaid.value = newVal.buyFlag === 1;
    }
  },
  { immediate: true }
);
// --- 3. 支付/解锁逻辑 ---
const handleFakePay = async () => {
  // 1. 开启 Loading 弹窗 (对应你之前的 n-modal)
  isPaying.value = true;
  console.log('正在发起支付或验证权限...');

  // 2. 这里你有两个选择：

  // 方案 A：如果你已经手动改了数据库 buyFlag = 1
  // 我们直接调用接口自带的 refresh 重新拉取最新状态
  const { refresh } = await useCourseDetailApi(courseId);
  await refresh();

  // 方案 B：如果是做本地模拟演示，直接手动切状态
  setTimeout(() => {
    isPaying.value = false;
    isPaid.value = true; // 只要这行一变，v-else 里的 CourseStudyCenter 就出来了
    console.log('✅ 权限解锁成功');
  }, 1500);

  // 方案 C：跳转到真正的收银台页面
  // navigateTo(`/course/pay/${courseId}`);
};
</script>

<style scoped>
/* 基础容器 */
.course-detail-page {
  background: #f4f6f8;
  min-height: 100vh;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  width: 100%;
}
.course-detail-container {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
}

.breadcrumb {
  font-size: 13px;
  color: #999;
  margin-bottom: 20px;
}

.video-mask {
  position: absolute;
  inset: 0;
  z-index: 5;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
}
.free-badge {
  position: absolute;
  top: 16px;
  left: 16px;
}
.video-info {
  text-align: center;
}
.video-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.5;
}

.detail-tabs-card {
  background: #fff;
  margin-top: 24px;
  border-radius: 12px;
  padding: 24px;
}
.tabs-nav {
  display: flex;
  gap: 30px;
  border-bottom: 2px solid #f0f0f0;
  margin-bottom: 20px;
  position: relative;
}
.tabs-nav span {
  padding-bottom: 12px;
  cursor: pointer;
  font-weight: 500;
  color: #666;
}
.tabs-nav span.active {
  color: #18a058;
  border-bottom: 2px solid #18a058;
}
.rating-box {
  margin-left: auto;
  background: #fff8f0;
  padding: 4px 12px;
  border: 1px solid #ffe8cc;
  border-radius: 4px;
  font-size: 12px;
}
.rating-box span {
  font-weight: bold;
  color: #e67e22;
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
}
.main-text {
  font-size: 17px;
  font-weight: bold;
  letter-spacing: 1px;
}
.sub-text {
  font-size: 11px;
  opacity: 0.8;
  margin-top: 4px;
}
.btn-flare {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: flare 3s infinite;
}

.locked-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
  color: #adb5bd;
}
.pay-to-unlock {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
  color: #999;
  font-size: 13px;
}
.divider {
  height: 1px;
  flex: 1;
  background: #eee;
}
</style>
