<template>
    <n-grid :x-gap="20">
        <n-grid-item :span="5">
            <ul class="center-menu">
                <li :class="{
                    'active':(item.name == activeName)
                }" v-for="(item,index) in menus" :key="index"
                @click="navigate(item)">
                    {{ item.title }}
                </li>
            </ul>
        </n-grid-item>
        <n-grid-item :span="19">
            <div class="user-content-container">
                <NuxtPage :page-key="pageKey" />
            </div>
        </n-grid-item>
    </n-grid>
</template>
<script setup>
import { 
    NGrid,
    NGridItem
} from "naive-ui"
const route = useRoute()
const pageKey = computed(()=>route.fullPath)
const activeName = computed(()=>route.name)

const menus = [{
    title:"学习记录",
    name:"user-history-page"
},{
    title:"购买记录",
    name:"user-buy-page"
},{
    title:"我的考试",
    name:"user-test-page"
},{
    title:"我的帖子",
    name:"user-post-page"
},{
    title:"优惠券记录",
    name:"user-coupon-page"
},{
    title:"我的收藏",
    name:"user-fava-page"
},{
    title:"修改资料",
    name:"user-edit"
},{
    title:"修改密码",
    name:"user-password"
},{
    title:"其他设置",
    name:"user-other"
}]

const navigate = (item) => {
    navigateTo({
        name:item.name,
        params:{
            page:1
        }
    })
}

definePageMeta({
    middleware:["auth"]
})

</script>
<style>
.center-menu {
    list-style: none;
    background-color: white;
    border-radius: 0.5rem;
    padding: 0;
    margin: 0;
}

.center-menu li {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    font-size: 0.875rem;
    cursor: pointer;
}

.center-menu li:hover {
    background-color: #eff6ff;
}

.center-menu .active {
    font-weight: bold;
    color: #3b82f6;
    background-color: #e5e7eb;
}

.user-content-container {
    background-color: white;
    border-radius: 0.5rem;
    margin-bottom: 2.5rem;
    min-height: 75vh;
}
</style>