<template>
    <UiCard>
        <UiCardHeader class="header-container">
            <span class="title-text">{{ item.testpaper.title }}</span>
            <span :class="['status-text', { 'status-completed': item.answer_status, 'status-in-progress': !item.answer_status }]">{{ item.answer_status ? '考试完成' : '考试中' }}</span>
        </UiCardHeader> 
        <UiCardBody>
            <small class="info-item">题目总数：{{ item.testpaper.question_count }}</small>
            <small class="info-item">总分数：{{ item.testpaper.total_score }}</small>
            <small class="info-item">及格分：{{ item.testpaper.pass_score }}</small>
        </UiCardBody>
        <UiCardFooter class="footer-container">
            <span>{{ item.created_time }}</span>
            <span>
                最终得分：
                <span :class="['score-text', { 'score-read': item.read_status, 'score-not-read': !item.read_status }]">
                    {{ item.read_status ? item.score : '正在阅卷' }}
                </span>
            </span>
        </UiCardFooter>
    </UiCard>
</template>
<script setup>
const props = defineProps({
    item:Object
})
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
}

.title-text {
  
}

.status-text {
  
}

.status-completed {
  color: #10b981; /* equivalent to text-green-600 */
}

.status-in-progress {
  color: #f43f5e; /* equivalent to text-rose-600 */
}

.info-item {
  margin-right: 0.75rem; /* equivalent to mr-3 (12px) */
}

.footer-container {
  display: flex;
  justify-content: space-between;
}

.score-text {
  
}

.score-read {
  color: #10b981; /* equivalent to text-green-600 */
}

.score-not-read {
  color: #f43f5e; /* equivalent to text-rose-600 */
}
</style>