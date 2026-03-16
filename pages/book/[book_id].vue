<template>
    <LoadingGroup :pending="pending" :error="error">
        <n-grid :x-gap="20">
            <n-grid-item :span="6">
                <!-- 滚动容器：替换行内style为类名，便于维护 -->
                <n-scrollbar class="book-menu-scrollbar bg-white rounded shadow mb-5">
                    <div class="book-cover-wrap">
                        <n-image 
                            :src="data.detail.cover" 
                            width="60" 
                            height="80"
                            class="book-cover-img"
                        />
                        <span class="book-title-text">{{ data.detail.title }}</span>
                    </div>
                    <DetailMenu class="book-menu-list">
                        <DetailMenuItem 
                            v-for="(item,index) in data.menus"
                            :key="index" 
                            :item="item" 
                            :index="index" 
                            @click="open(item.id)"
                            :active="activeId == item.id"
                        />
                        <Empty v-if="data.menus.length == 0" desc="暂无目录"/>
                    </DetailMenu>
                </n-scrollbar>
            </n-grid-item>
            <n-grid-item :span="18">
                <n-card>
                    <NuxtPage :page-key="pageKey" />
                </n-card>
            </n-grid-item>
        </n-grid>
    </LoadingGroup>
</template>

<script setup>
import {
    NGrid,
    NGridItem,
    NCard,
    NScrollbar,
    NImage
} from "naive-ui"

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
    middleware(to,from){
        const { book_id } = to.params
        if(isNaN(+book_id)){
            return abortNavigation("页面不存在")
        }
        return true
    }
})
</script>

<style>
/* 滚动容器样式（替换行内style和Tailwind类） */
.book-menu-scrollbar {
    height: 450px; /* 原行内style的height */
    background-color: #ffffff; /* bg-white */
    border-radius: 8px; /* rounded */
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); /* shadow */
    margin-bottom: 20px; /* mb-5 */
}

/* 封面容器（替换flex flex-col items-center justify-center） */
.book-cover-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 0; /* 补充基础内边距，优化布局 */
}

/* 封面图片（替换rounded shadow my-4） */
.book-cover-img {
    border-radius: 8px; /* rounded */
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); /* shadow */
    margin: 16px 0; /* my-4：上下外边距16px */
}

/* 书籍标题文字（替换text-sm） */
.book-title-text {
    font-size: 0.875rem; /* text-sm：14px */
    color: #333333; /* 补充文字颜色，提升可读性 */
}

/* 目录列表容器（替换mt-5） */
.book-menu-list {
    margin-top: 20px; /* mt-5：上外边距20px */
}
</style>