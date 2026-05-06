<template>
  <div
    class="course-card"
    :class="{ selected }"
    @click="handleCardClick"
  >
    <!-- 选中勾 测试ce-->
    <div v-if="selectable" class="select-check" @click.stop="$emit('select', item.id)">
      <span class="check-icon">{{ selected ? '✓' : '' }}</span>
    </div>
    

    <div class="card-cover">
      <img :src="item.cover || 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'" />
      <!-- 收藏按钮 -->
      <div class="fav-btn" @click.stop="handleFavorite">
        <n-icon size="18" :color="item.isFavorite ? '#d03050' : 'rgba(255,255,255,0.85)'">
          <Heart v-if="item.isFavorite" />
          <HeartOutline v-else />
        </n-icon>
      </div>
    </div>

    <div class="card-body">
      <h4 class="card-title">{{ item.title }}</h4>
      <div class="card-stats">
        <div class="price-area">
          <!-- 已购买：显示已购买标签 -->
          <span v-if="item.buyFlag === 1" class="price-bought">已购买</span>
          <!-- 未购买付费课：显示价格 -->
          <span v-else-if="Number(item.price) > 0" class="price-paid">¥{{ item.price }}</span>
          <!-- 免费课 -->
          <span v-else class="price-free">免费</span>
        </div>
        <div class="stats-right">
          <span class="learn-count">{{ item.salesCount || item.buyCount || 0 }} 人学过</span>
          <span class="fav-count">
            <n-icon size="12"><HeartOutline /></n-icon>
            {{ item.collectionCount || item.favoriteCount || 0 }}
          </span>
        </div>
      </div>
      <div class="rating-bar">
        <div class="bar-good" :style="{ width: Math.min((item.ratingScore / 5) * 100, 100) + '%' }" />
        <div class="bar-mid" :style="{ width: item.ratingScore > 0 ? '10%' : '0' }" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { NIcon } from 'naive-ui';
import { Heart, HeartOutline } from '@vicons/ionicons5';
// CourseCard 组件：展示课程卡片信息

const props = defineProps({
  item: { type: Object, required: true },
  selectable: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
});
const emit = defineEmits(['click', 'favorite', 'select']);

const handleFavorite = () => emit('favorite', props.item.id);

const handleCardClick = () => {
  if (props.selectable) {
    emit('select', props.item.id);
  } else {
    emit('click');
  }
};
</script>

<style scoped>
.course-card {
  background: #fff;
  border: 1px solid #efeff5;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.course-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
  border-color: #18a058;
}
.course-card.selected {
  border: 2px solid #d03050;
  box-shadow: 0 0 0 2px rgba(208,48,80,0.15);
}

/* 选中勾 */
.select-check {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0,0,0,0.35);
  border: 2px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.15s;
}
.course-card.selected .select-check {
  background: #d03050;
  border-color: #d03050;
}
.check-icon { color: #fff; font-size: 13px; font-weight: 700; line-height: 1; }

.card-cover {
  position: relative;
  height: 120px;
  background: #f0f0f0;
  overflow: hidden;
}
.card-cover img { width: 100%; height: 100%; object-fit: cover; }
.fav-btn {
  position: absolute; top: 8px; right: 8px;
  width: 28px; height: 28px;
  background: rgba(0,0,0,0.3); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; backdrop-filter: blur(2px);
}
.fav-btn:hover { background: rgba(0,0,0,0.5); transform: scale(1.1); }

.card-body { padding: 10px 10px 8px; }
.card-title {
  font-size: 13px; font-weight: 600; color: #222;
  margin: 0 0 8px; height: 36px; line-height: 1.4;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.card-stats { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.price-paid { color: #d03050; font-weight: 700; font-size: 14px; }
.price-free { color: #18a058; font-weight: 700; font-size: 14px; }
.price-bought { color: #18a058; font-weight: 700; font-size: 14px; }
.stats-right { display: flex; align-items: center; gap: 8px; }
.learn-count { font-size: 11px; color: #999; }
.fav-count { font-size: 11px; color: #999; display: flex; align-items: center; gap: 2px; }
.rating-bar { height: 3px; display: flex; border-radius: 2px; overflow: hidden; background: #eee; }
.bar-good { background: #18a058; }
.bar-mid { background: #f0a020; }
</style>
