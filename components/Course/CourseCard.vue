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

      <div class="mini-favorite-badge" @click.stop="handleFavorite">
        <n-icon size="20" :class="{ 'is-active': item.isFavorite }">
          <Heart v-if="item.isFavorite" />
          <HeartOutline v-else />
        </n-icon>
      </div>
    </div>

    <div class="mini-info">
      <h4 class="mini-title">{{ item.title }}</h4>
      <div class="mini-stats">
        <div class="price-group">
          <span class="mini-price" v-if="Number(item.price) > 0"
            >¥{{ item.price }}</span
          >
          <span class="mini-price free" v-else>免费</span>
        </div>

        <div class="mini-social">
          <span class="mini-count">{{ item.salesCount || 0 }} 人学过</span>
          <span class="mini-fav-total">
            <n-icon size="14"><HeartOutline /></n-icon>
            {{ item.favoriteCount || 0 }}
          </span>
        </div>
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
import { NIcon } from 'naive-ui';
import { Heart, HeartOutline } from '@vicons/ionicons5';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['click', 'favorite']);
// components/Course/CourseCard.vue

const formatType = (t) => {
  const map = { media: '视频', live: '直播', text: '图文' };
  return map[t] || '课程';
};

// 修改 handleFavorite
const handleFavorite = () => {
  // 停止事件冒泡，防止触发卡片的点击跳转
  // 直接把课程 ID 传给父组件
  emit('favorite', props.item.id);
};
const handleFavoriteToggle = (item) => {
  // 核心逻辑：直接翻转当前项的布尔值
  // 如果 item.isFavorite 是 true，就变 false；反之亦然
  item.isFavorite = !item.isFavorite;

  // 顺便模拟一下收藏数的增减
  if (item.isFavorite) {
    item.favoriteCount = (item.favoriteCount || 0) + 1;
  } else {
    item.favoriteCount = Math.max(0, (item.favoriteCount || 0) - 1);
  }

  console.log(`课程 ${item.title} 的收藏状态已改变为: ${item.isFavorite}`);
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
.mini-favorite-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s ease;
}

/* 重点：心形的颜色控制 */
.n-icon {
  color: #ccc; /* 默认：暗色（未收藏） */
  transition: color 0.3s ease;
}

.n-icon.is-active {
  color: #d03050; /* 激活：亮红色（已收藏） */
}

.mini-favorite-badge:hover {
  background: #fff;
  transform: scale(1.1);
}

.mini-social {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-fav-total {
  font-size: 11px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 2px;
}
</style>
