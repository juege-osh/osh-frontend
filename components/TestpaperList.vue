<template>
    <section class="custom-section">
        <div class="flex-between">
            <h4>{{ item.title }}</h4>
            <small class="text-rose">时长：{{ item.expire }}分钟</small>
        </div>
        <p class="py-5 text-gray text-sm">
            题目总数：{{ item.question_count }} 总分数：{{ item.total_score }} 及格分：{{ item.pass_score }}
        </p>
        <div class="flex-end">
            <template v-if="canEdit || canDelete">
                <n-button v-if="canEdit" size="small" quaternary @click.stop="emit('edit', item)">编辑</n-button>
                <n-button v-if="canDelete" size="small" quaternary type="error" @click.stop="emit('delete', item)">删除</n-button>
            </template>
            <n-button type="primary" @click="test" :disabled="item.is_test">{{ item.is_test ? '考过了' : '立即考试' }}</n-button>
        </div>
    </section>
</template>

<style scoped>
.custom-section {
    background-color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 1.25rem;
    border-radius: 0.5rem;
    margin-bottom: 1.25rem;
}

.flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.flex-end {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.text-rose {
    color: rgb(244, 63, 94); /* rose-500 */
}

.text-gray {
    color: rgb(107, 114, 128); /* gray-500 */
}

.text-sm {
    font-size: 0.875rem;
    line-height: 1.25rem;
}

.py-5 {
    padding-top: 1.25rem;
    padding-bottom: 1.25rem;
}
</style>
<script setup>
    import {
        NButton,
        createDiscreteApi
    } from "naive-ui"
    import { useUser, canTakeExam } from '~/composables/useAuth'

    const props = defineProps({
        item: { type: Object, required: true },
        canEdit: { type: Boolean, default: false },
        canDelete: { type: Boolean, default: false },
    })
    const emit = defineEmits(['edit', 'delete'])
    const route = useRoute()

    const test = ()=>{
        const { dialog, message } = createDiscreteApi(["dialog", "message"])
        const user = useUser()
        if (!user.value) {
            message.warning('请先登录')
            return navigateTo('/login?from=' + encodeURIComponent(route.fullPath))
        }
        if (!canTakeExam()) {
            message.warning('需要 VIP 及以上等级才能参加考试')
            return
        }
        dialog.create({
            content:"是否要参加该场考试？",
            positiveText:"立即考试",
            negativeText:"取消",
            async onPositiveClick() {
                if (!canTakeExam()) {
                    message.warning('需要 VIP 及以上等级才能参加考试')
                    return true
                }
                const examId = props.item?.id
                if (examId == null || examId === '') {
                    message.error('试卷信息不完整，无法进入考试')
                    return true
                }
                // Naive Dialog: if this handler resolves to exactly `false`, the dialog will NOT close.
                // navigateTo() resolves to `false` when navigation is aborted (e.g. exam-vip redirects back).
                await navigateTo(`/paper_test/${examId}`)
                return true
            },
        })
    }
</script>