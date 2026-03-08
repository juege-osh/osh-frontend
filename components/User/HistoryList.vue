<template>
    <UiCard>
        <UiCardHeader class="history-header">
            <span class="progress-label">学习进度</span>
            <n-progress type="line" :percentage="item.progress" :show-indicator="false" />
        </UiCardHeader>
        <UiCardBody class="history-body">
            <n-tag size="small" v-if="route.query.tab != 'column'" class="content-type-tag">{{ t[item.type] }}</n-tag>
            <span class="item-title">{{ item.title }}</span> 
            <n-button type="primary" size="tiny" class="continue-btn" @click="open">继续观看</n-button>
        </UiCardBody>
    </UiCard>
</template>

<script setup>
import {
    NProgress,
    NButton,
    NTag 
} from "naive-ui"
const route = useRoute()

const props = defineProps({
    item:Object
})

const t = {
    audio:"音频",
    video:"视频",
    media:"图文",
    column:"专栏",
    book:"电子书",
    course:"课程"
}

const open = ()=>{
    navigateTo(`/detail/${route.query.tab}/${props.item.id}`)
}
</script>

<style scoped>
/* Converting Tailwind classes to native CSS */
.history-header {
  margin-bottom: 0.5rem;
}

.progress-label {
  font-size: 0.875rem;
  color: #9ca3af;
}

.history-body {
  display: flex;
  align-items: center;
}

.content-type-tag {
  /* Equivalent to mb-2 (margin-bottom: 0.5rem) */
  margin-bottom: 0.5rem;
}

.item-title {
  margin-left: 0.75rem;
  flex-grow: 1;
}

.continue-btn {
  margin-left: auto;
}
</style>