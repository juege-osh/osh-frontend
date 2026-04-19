<template>
    <div class="image-nav-grid">
        <div v-for="(item,index) in data" :key="index" class="nav-card" @click="$commonOpen(item)">
            <div class="nav-image">
                <img :src="item.src" alt="" />
            </div>
            <div class="nav-label">{{ item.name }}</div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    data: Array
})
</script>

<style scoped>
.image-nav-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-lg);
    margin-bottom: var(--space-2xl);
}

.nav-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease;
}

.nav-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-accent);
}

.nav-image {
    width: 100%;
    height: 120px;
    overflow: hidden;
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

.nav-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.nav-card:hover .nav-image img {
    transform: scale(1.05);
}

.nav-label {
    padding: var(--space-md);
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-primary);
}

@media (max-width: 992px) {
    .image-nav-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 640px) {
    .image-nav-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-md);
    }
}
</style>