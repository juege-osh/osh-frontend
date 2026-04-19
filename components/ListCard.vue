<template>
    <div class="list-section">
        <div class="section-header">
            <h2 class="section-title">{{ title }}</h2>
            <button class="btn-more">
                <span>查看更多</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </div>
        <div class="grid-container">
            <CourseList v-for="(item,index) in pdata" :key="index" :item="item"/>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    title: String,
    data: Array,
    type: {
        type: String,
        default: "course"
    }
})

const pdata = ref(props.data || [])
if(props.type === "group"){
    const { data } = await useGroupDataApi({
        page: 1,
        usable: 1,
        limit: 8
    })
    pdata.value = data.value?.rows ?? []
}
</script>

<style scoped>
.list-section {
    margin-bottom: var(--space-2xl);
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
}

.btn-more {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-more:hover {
    background: var(--color-surface-hover);
    border-color: var(--color-border-hover);
    color: var(--color-text-primary);
}

.btn-more svg {
    transition: transform 0.2s ease;
}

.btn-more:hover svg {
    transform: translateX(2px);
}

.grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-lg);
}

@media (max-width: 1200px) {
    .grid-container {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 992px) {
    .grid-container {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .grid-container {
        grid-template-columns: 1fr;
    }
}
</style>