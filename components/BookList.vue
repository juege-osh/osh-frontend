<template>
    <section class="book-section" @click="open">
        <UiImage :src="item.cover || defaultCover" class="book-cover"/>
        <div class="book-info">
            <h4 class="book-title">{{ item.title }}</h4>

            <div class="price-container">
                <Price :value="item.price"/>
                <Price :value="item.t_price" through class="ml-2"/>
            </div>

            <div class="book-footer">
                <n-button size="small" strong secondary round type="primary" class="subscribe-btn">
                    {{ item.sub_count == 0 ? '立即购买' : (item.sub_count + '人购买') }}
                </n-button>

                <n-button
                    class="follow-btn"
                    circle
                    size="small"
                    :loading="followLoading"
                    :disabled="followLoading"
                    :type="isFollowed ? 'error' : 'default'"
                    @click.stop="handleFollow"
                >
                    <template #icon>
                        <n-icon v-if="!followLoading" size="16">
                            <Heart v-if="isFollowed" />
                            <HeartOutline v-else />
                        </n-icon>
                    </template>
                </n-button>
            </div>
        </div>
    </section>
</template>

<script setup>
    import { NButton, NIcon } from "naive-ui"
    import { Heart, HeartOutline } from '@vicons/ionicons5'
    import { ref } from "vue"

    const props = defineProps({
        item: Object
    })

    // 默认封面图
    const defaultCover = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='108' height='138'%3E%3Crect width='108' height='138' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3E暂无封面%3C/text%3E%3C/svg%3E"

    const open = () => {
        navigateTo(`/detail/book/${props.item.id}`)
    }

    const followLoading = ref(false)
    const isFollowed = ref(false)
    
    const handleFollow = async () => {
        if (followLoading.value) return
        followLoading.value = true
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            isFollowed.value = !isFollowed.value
        } finally {
            followLoading.value = false
        }
    }
</script>

<style scoped>
.book-section {
    background-color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-radius: 0.5rem;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    min-height: auto;
    cursor: pointer;
    transition: all 0.2s ease;
}
.book-section:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}
.book-cover {
    width: 108px;
    height: 138px;
    border-radius: 0.25rem;
    flex-shrink: 0;
    background-color: #f9fafb;
}
.book-info {
    display: flex;
    flex-direction: column;
    padding-left: 1rem;
    flex: 1;
    justify-content: center;
    gap: 6px;
}

.book-title {
    margin: 0;
    line-height: 1.3;
    min-height: 2.6em;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.price-container {
    display: flex;
    align-items: flex-end;
}

/* 👇 只加了这一句：让按钮整体往下挪一点 */
.book-footer {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 30px; /* 往下移动距离 */
}
.subscribe-btn {
    flex-shrink: 0;
    left: 21px;
    top: 2px;
}
.follow-btn {
    flex-shrink: 0;
    left: 35px;
    top: 2px;
}
</style>