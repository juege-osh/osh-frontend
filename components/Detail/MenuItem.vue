<template>
    <li class="detail-menu-item" :class="{ 'active':active }">
        <n-tag v-if="item.type" type="info" :bordered="false" size="small" class="mr-3">
            {{ t[item.type] }}
        </n-tag>
        章节{{ index + 1 }}.{{ item.title }}

        <n-tag v-if="item.price == 0 || item.isfree == 1" type="success" :bordered="false" size="small" class="ml-auto">
            免费
        </n-tag>
    </li>
</template>
<script setup>
    import {
        NTag
    } from "naive-ui"
    defineProps({
        item:Object,
        index:Number,
        active:{
            type:Boolean,
            default:false
        }
    })

    const t = {
        media:"图文",
        audio:"音频",
        video:"视频"
    }

</script>
<style>
    .detail-menu-item {
        display: flex;
        padding: 1.25rem;
        border-bottom: 1px solid currentColor;
        cursor: pointer;
        font-size: 0.875rem;
    }
    
    .detail-menu-item:hover {
        background-color: #f3f4f6 !important;
    }
    
    .detail-menu-item:active {
        background-color: #e5e7eb !important;
    }
    
    .active {
        background-color: #e5e7eb;
    }
</style>