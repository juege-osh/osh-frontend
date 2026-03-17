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

    const props = defineProps({
        item:Object
    })

    const test = ()=>{
        const { dialog } = createDiscreteApi(["dialog"])
        dialog.create({
            content:"是否要参加该场考试？",
            positiveText:"立即考试",
            negativeText:"取消",
            onPositiveClick(){
                navigateTo("/paper_test/"+props.item.id)
            }
        })
    }
</script>