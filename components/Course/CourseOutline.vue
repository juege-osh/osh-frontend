<template>
  <div class="outline-wrapper">
    <div
      v-for="(chapter, cIndex) in chapters"
      :key="cIndex"
      class="chapter-item"
    >
      <div class="chapter-title">
        <span class="chapter-index">第 {{ cIndex + 1 }} 章</span>
        <span class="title-text">{{ chapter.title }}</span>
      </div>

      <div class="section-list">
        <div
          v-for="(section, sIndex) in chapter.sections"
          :key="sIndex"
          class="section-item"
          :class="{ 'is-active': activeId === section.id }"
          @click="$emit('select', section)"
        >
          <n-icon size="16" class="play-icon"><PlayCircleOutline /></n-icon>
          <span class="section-name"
            >{{ sIndex + 1 }}-{{ sIndex + 1 }} {{ section.title }}</span
          >
          <n-tag v-if="section.is_free" size="tiny" type="success" @click.stop
            >试看</n-tag
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlayCircleOutline } from '@vicons/ionicons5';
import { NIcon, NTag } from 'naive-ui';

defineProps({
  chapters: {
    type: Array,
    default: () => [],
  },
  activeId: [String, Number], // 当前正在看哪一节（学习中心会用到）
});

defineEmits(['select']);
</script>

<style scoped>
.chapter-item {
  margin-bottom: 16px;
}
.chapter-title {
  background: #f7f9fb;
  padding: 10px 15px;
  font-weight: bold;
  border-radius: 4px;
  display: flex;
  gap: 10px;
}
.chapter-index {
  color: #999;
  font-size: 12px;
}

.section-list {
  padding: 5px 0;
}
.section-item {
  display: flex;
  align-items: center;
  padding: 10px 15px 10px 30px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 8px;
}
.section-item:hover {
  background-color: #f0faff;
  color: #18a058;
}
.section-item.is-active {
  background-color: #e7f5ee;
  color: #18a058;
  font-weight: bold;
}
.section-name {
  flex: 1;
  font-size: 14px;
}
.play-icon {
  color: #ccc;
}
.section-item:hover .play-icon {
  color: #18a058;
}
</style>
