<template>
  <div class="qna-detail-page">
    <QuestionAnswerDetail 
      :question-id="questionId" 
      @back="router.push('/question_answer/1')"
      @deleted="router.push('/question_answer/1')"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const questionId = computed(() => route.params.id);
</script>

<style scoped>
/* 突破父级 .container 的 max-width 限制，撑满视口全宽 */
.qna-detail-page {
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  width: 100vw;
  padding: 24px 40px 60px;
  min-height: calc(100vh - 64px);
  background: #f5f6fa;
  box-sizing: border-box;
}
</style>
