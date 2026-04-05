<template>
  <div class="mini-course-card" @click="$emit('click')">
    <div class="mini-cover">
      <img
        :src="
          item.cover ||
          'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
        "
      />
      <div class="mini-type">{{ formatType(item.type) }}</div>
    </div>
    <div class="mini-info">
      <h4 class="mini-title">{{ item.title }}</h4>
      <div class="mini-stats">
        <span class="mini-price" v-if="Number(item.price) > 0"
          >¥{{ item.price }}</span
        >
        <span class="mini-price free" v-else>免费</span>
        <span class="mini-count">{{ item.salesCount || 0 }} 人学过</span>
      </div>
      <div class="mini-rating">
        <div
          class="rate-bar good"
          :style="{ width: (item.ratingScore / 5) * 100 + '%' }"
        ></div>
        <div
          class="rate-bar mid"
          :style="{ width: (item.ratingScore > 0 ? 10 : 0) + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true,
  },
});

defineEmits(['click']);

const formatType = (t) => {
  const map = { media: '视频', live: '直播', text: '图文' };
  return map[t] || '课程';
};
</script>

<style scoped>
.mini-course-card {
  background: #fff;
  border: 1px solid #efeff5;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mini-course-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #18a058;
}
.mini-cover {
  position: relative;
  height: 110px;
  background: #f5f5f5;
}
.mini-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mini-type {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
}
.mini-info {
  padding: 10px;
}
.mini-title {
  font-size: 13px;
  font-weight: bold;
  margin: 0 0 8px 0;
  height: 36px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.mini-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.mini-price {
  color: #d03050;
  font-weight: bold;
  font-size: 14px;
}
.mini-price.free {
  color: #18a058;
}
.mini-count {
  font-size: 11px;
  color: #999;
}
.mini-rating {
  height: 4px;
  display: flex;
  border-radius: 2px;
  overflow: hidden;
  background: #eee;
  margin-top: 4px;
}
.rate-bar.good {
  background: #18a058;
}
.rate-bar.mid {
  background: #f0a020;
}
.rate-bar.bad {
  background: #d03050;
}
</style>
