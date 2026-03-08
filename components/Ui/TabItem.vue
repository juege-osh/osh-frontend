<template>
    <span class="tab-item" :class="{ 'tab-item-active':active }">
        <slot/>
    </span>
</template>
<script setup>
defineProps({
    active:{
        type:Boolean,
        default:false
    }
})
</script>
<style scoped>
.tab-item {
    padding: 0.75rem 1rem;
    color: #374151;
    font-size: 0.875rem;
    cursor: pointer;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
}
.tab-item:hover {
    color: #60a5fa;
}
.tab-item-active {
    border-bottom: 2px solid;
    color: #60a5fa;
    border-color: #60a5fa;
}
</style>