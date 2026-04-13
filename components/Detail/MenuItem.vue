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
        align-items: center;
        padding: 14px 24px;
        border-bottom: 1px solid #f3f4f6;
        cursor: pointer;
        font-size: 14px;
        color: #374151;
        transition: background 0.15s;
    }

    .detail-menu-item:hover {
        background-color: #f9fafb !important;
    }

    .detail-menu-item:last-child {
        border-bottom: none;
    }

    .active {
        background-color: #eff6ff !important;
        color: #3b82f6;
    }
</style>