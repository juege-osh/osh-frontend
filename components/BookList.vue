<template>
    <div class="book-card" @click="open">
        <div class="book-cover-wrapper">
            <UiImage :src="item.cover || defaultCover" class="book-cover"/>
        </div>
        <div class="book-content">
            <h4 class="book-title">{{ item.title }}</h4>
            
            <div class="book-meta">
                <div class="price-group">
                    <Price :value="item.price" class="current-price"/>
                    <Price v-if="item.t_price" :value="item.t_price" through class="original-price"/>
                </div>
                <div class="sub-count">{{ item.sub_count || 0 }}人购买</div>
            </div>

            <div class="book-actions">
                <button class="btn-buy">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 2h2l1.5 9h7l1.5-6H4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="6" cy="14" r="1" fill="currentColor"/>
                        <circle cx="12" cy="14" r="1" fill="currentColor"/>
                    </svg>
                    <span>立即购买</span>
                </button>
                
                <button
                    class="btn-favorite"
                    :class="{ 'active': isFollowed }"
                    @click.stop="handleFollow"
                    :disabled="followLoading"
                >
                    <svg v-if="isFollowed" width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
                        <path d="M9 15.5l-5.5-5.5c-1.5-1.5-1.5-4 0-5.5s4-1.5 5.5 0 4-1.5 5.5 0 1.5 4 0 5.5L9 15.5z"/>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 15.5l-5.5-5.5c-1.5-1.5-1.5-4 0-5.5s4-1.5 5.5 0 4-1.5 5.5 0 1.5 4 0 5.5L9 15.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue"

const props = defineProps({
    item: Object
})

const defaultCover = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='160'%3E%3Crect width='120' height='160' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%2394a3b8'%3E暂无封面%3C/text%3E%3C/svg%3E"

const open = () => {
    navigateTo(`/detail/book/${props.item.id}`)
}

const followLoading = ref(false)
const isFollowed = ref(false)

const handleFollow = async () => {
    if (followLoading.value) return
    followLoading.value = true
    try {
        await new Promise(resolve => setTimeout(resolve, 500))
        isFollowed.value = !isFollowed.value
    } finally {
        followLoading.value = false
    }
}
</script>

<style scoped>
.book-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-md);
    display: flex;
    gap: var(--space-md);
    cursor: pointer;
    transition: all 0.2s ease;
}

.book-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-border-hover);
}

.book-cover-wrapper {
    flex-shrink: 0;
}

.book-cover {
    width: 100px;
    height: 140px;
    border-radius: var(--radius-md);
    object-fit: cover;
    background: #f1f5f9;
}

.book-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.book-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.book-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: auto;
}

.price-group {
    display: flex;
    align-items: baseline;
    gap: var(--space-sm);
}

.current-price {
    font-size: 18px;
    font-weight: 700;
    color: var(--color-accent);
}

.original-price {
    font-size: 13px;
    color: var(--color-text-tertiary);
}

.sub-count {
    font-size: 12px;
    color: var(--color-text-tertiary);
}

.book-actions {
    display: flex;
    gap: var(--space-sm);
    margin-top: var(--space-sm);
}

.btn-buy {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--color-accent);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-buy:hover {
    background: var(--color-accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-favorite {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-tertiary);
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-favorite:hover {
    border-color: var(--color-error);
    color: var(--color-error);
    background: rgba(239, 68, 68, 0.05);
}

.btn-favorite.active {
    border-color: var(--color-error);
    color: var(--color-error);
    background: rgba(239, 68, 68, 0.1);
}

.btn-favorite:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>