<template>
    <section class="book-section">
        <UiImage :src="item.cover" class="book-cover"/>
        <div class="book-info">
            <h4 class="book-title">{{ item.title }}</h4>

            <div class="price-container">
                <Price :value="item.price"/>
                <Price :value="item.t_price" through class="ml-2"/>
            </div>

            <div class="book-footer">
                <n-button size="small" strong secondary round type="primary" class="subscribe-btn" @click="open">
                    {{ item.sub_count == 0 ? '立即购买' : (item.sub_count + '人购买') }}
                </n-button>

                <n-button
                    class="follow-btn"
                    circle
                    size="small"
                    :loading="followLoading"
                    :disabled="followLoading"
                    :type="isFollowed ? 'error' : 'default'"
                    @click="handleFollow"
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