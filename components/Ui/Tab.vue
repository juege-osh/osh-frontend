<template>
    <div class="tab">
        <slot/>
    </div>
</template>
<style scoped>
.tab {
    width: 100%;
    display: flex;
    overflow-x: auto;
    background: #fff;
    margin-bottom: 1rem;
    border-radius: 0.5rem;
}
</style>
