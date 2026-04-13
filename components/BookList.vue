<template>
    <section class="book-card" @click="open">
        <div class="book-cover-wrap">
            <UiImage :src="item.cover" class="book-cover" />
        </div>
        <div class="book-info">
            <h4 class="book-title">{{ item.title }}</h4>

            <div class="book-tags" v-if="item.tagNameList && item.tagNameList.length">
                <n-tag
                    v-for="tag in item.tagNameList.slice(0, 3)"
                    :key="tag"
                    size="small"
                    round
                    :bordered="false"
                    class="book-tag"
                    @click.stop="emit('tag-click', tag)"
                >
                    {{ tag }}
                </n-tag>
            </div>

            <div class="book-meta">
                <n-icon size="12" color="#9ca3af"><PeopleOutline /></n-icon>
                <span class="meta-text">{{ item.sub_count || 0 }} 人购买</span>
            </div>

            <div class="book-footer">
                <div class="price-wrap">
                    <Price :value="item.price" />
                    <Price v-if="item.t_price && item.t_price != item.price" :value="item.t_price" through />
                </div>
                <div @click.stop>
                    <n-button
                        circle
                        size="small"
                        :loading="followLoading"
                        :type="isFollowed ? 'error' : 'default'"
                        @click="handleFollow"
                    >
                        <template #icon>
                            <n-icon size="14">
                                <Heart v-if="isFollowed" />
                                <HeartOutline v-else />
                            </n-icon>
                        </template>
                    </n-button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { NButton, NIcon, NTag } from "naive-ui"
import { Heart, HeartOutline, PeopleOutline } from '@vicons/ionicons5'
import { ref } from "vue"

const props = defineProps({
    item: Object
})

const emit = defineEmits(['tag-click'])

const open = () => {
    navigateTo(`/detail/book/${props.item.id}`)
}

const followLoading = ref(false)
const isFollowed = ref(false)

const handleFollow = async () => {
    if (followLoading.value) return
    followLoading.value = true
    try {
        await new Promise(resolve => setTimeout(resolve, 800))
        isFollowed.value = !isFollowed.value
    } finally {
        followLoading.value = false
    }
}
</script>

<style scoped>
.book-card {
    background: #fff;
    border-radius: 10px;
    border: 1px solid #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.2s;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    height: 130px;
}

.book-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.book-cover-wrap {
    width: 90px;
    flex-shrink: 0;
    overflow: hidden;
    background: #f5f5f5;
}

.book-cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s;
}

.book-card:hover .book-cover {
    transform: scale(1.05);
}

.book-info {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    gap: 5px;
}

.book-title {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.book-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.book-tag {
    font-size: 11px;
    background: #eff6ff;
    color: #3b82f6;
    padding: 0 6px;
    cursor: pointer;
}

.book-tag:hover {
    background: #dbeafe;
}

.book-meta {
    display: flex;
    align-items: center;
    gap: 3px;
}

.meta-text {
    font-size: 11px;
    color: #9ca3af;
}

.book-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: auto;
}

.price-wrap {
    display: flex;
    align-items: baseline;
    gap: 6px;
}
</style>
