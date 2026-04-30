<template>
  <div class="quota-bar-wrap" v-if="quota > 0">
    <div class="quota-track">
      <div class="quota-fill" :style="{ width: progress + '%' }" />
    </div>
    <span class="quota-text">已抢 {{ progress }}% 名额</span>
  </div>
</template>

<script setup>
const props = defineProps({
  quota: { type: Number, default: 0 },      // 总名额，0 表示不限量
  soldCount: { type: Number, default: 0 },  // 已售数量
})

const progress = computed(() =>
  props.quota > 0
    ? Math.min(Math.round((props.soldCount / props.quota) * 100), 100)
    : 0
)
</script>

<style scoped>
.quota-bar-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
}
.quota-track {
  flex: 1;
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}
.quota-fill {
  height: 100%;
  background: #e1251b;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.quota-text {
  font-size: 11px;
  color: #e1251b;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
