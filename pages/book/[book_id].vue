<template>
    <LoadingGroup :pending="pending" :error="error">
        <div class="book-reader-container">
            <aside class="book-sidebar">
                <div class="book-info-card">
                    <n-image 
                        :src="data.detail.cover" 
                        class="book-cover"
                        object-fit="cover"
                    />
                    <h3 class="book-title">{{ data.detail.title }}</h3>
                    <div class="book-stats">
                        <span class="stat-item">
                            <n-icon size="14"><BookOutline /></n-icon>
                            {{ data.menus.length }} 章节
                        </span>
                    </div>
                </div>
                
                <n-scrollbar class="chapter-list-scroll">
                    <div class="chapter-list">
                        <div 
                            v-for="(item,index) in data.menus"
                            :key="index" 
                            class="chapter-item"
                            :class="{ 'active': activeId == item.id }"
                            @click="open(item.id)"
                        >
                            <div class="chapter-number">{{ index + 1 }}</div>
                            <div class="chapter-info">
                                <div class="chapter-title">{{ item.title }}</div>
                                <div class="chapter-badge" v-if="item.isFree">免费</div>
                            </div>
                            <n-icon class="chapter-arrow" size="16"><ChevronForwardOutline /></n-icon>
                        </div>
                        <div v-if="data.menus.length == 0" class="empty-state">
                            <n-icon size="48" color="#ccc"><BookOutline /></n-icon>
                            <p>暂无目录</p>
                        </div>
                    </div>
                </n-scrollbar>
            </aside>
            
            <main class="book-content">
                <n-card class="content-card">
                    <NuxtPage :page-key="pageKey" />
                </n-card>
            </main>
        </div>
    </LoadingGroup>
</template>

<script setup>
import {
    NGrid,
    NGridItem,
    NCard,
    NScrollbar,
    NImage,
    NIcon
} from "naive-ui"
import { BookOutline, ChevronForwardOutline } from '@vicons/ionicons5'

const route = useRoute()
const pageKey = computed(()=>route.fullPath)
const { book_id,id } = route.params
const activeId = ref(id)

const {
    data,
    error,
    pending
} = await useBookMenusApi(book_id)

const open = (d)=>{
    activeId.value = d
    navigateTo({
        params:{
            ...route.params,
            id:d
        }
    })
}

definePageMeta({
    middleware(to){
        const { book_id } = to.params
        if(isNaN(+book_id)){
            return abortNavigation("页面不存在")
        }
        return true
    }
})
</script>

<style scoped>
.book-reader-container {
    display: flex;
    gap: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
}

.book-sidebar {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.book-info-card {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.book-cover {
    width: 140px;
    height: 196px;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.book-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    text-align: center;
    margin: 0;
    line-height: 1.4;
}

.book-stats {
    display: flex;
    gap: 1rem;
    color: #666;
    font-size: 13px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.chapter-list-scroll {
    flex: 1;
    max-height: calc(100vh - 400px);
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.chapter-list {
    padding: 0.5rem;
}

.chapter-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 0.5rem;
}

.chapter-item:hover {
    background: #f5f7fa;
}

.chapter-item.active {
    background: linear-gradient(135deg, #18a058 0%, #0e7a3e 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(24,160,88,0.3);
}

.chapter-number {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 600;
    color: #666;
    flex-shrink: 0;
}

.chapter-item.active .chapter-number {
    background: rgba(255,255,255,0.2);
    color: white;
}

.chapter-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.chapter-title {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
}

.chapter-badge {
    background: #18a058;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
}

.chapter-item.active .chapter-badge {
    background: rgba(255,255,255,0.3);
}

.chapter-arrow {
    color: #999;
    flex-shrink: 0;
}

.chapter-item.active .chapter-arrow {
    color: white;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    color: #999;
}

.empty-state p {
    margin-top: 1rem;
    font-size: 14px;
}

.book-content {
    flex: 1;
    min-width: 0;
}

.content-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

@media (max-width: 1024px) {
    .book-reader-container {
        flex-direction: column;
    }
    
    .book-sidebar {
        width: 100%;
    }
    
    .chapter-list-scroll {
        max-height: 300px;
    }
}
</style>