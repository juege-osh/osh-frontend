<template>
    <span :class="through ? 'price price-through' : 'price price-main'">
        {{ parseFloat(value) == 0 ? "免费" : "￥"+value }}
    </span>
</template>
<script setup>
defineProps({
    value:{
        type:[String,Number],
        default:0
    },
    through:{
        type:Boolean,
        default:false
    }
})
</script>

<style>
.price {
    font-size: 14px;
}
.price-main {
    color: #f43f5e; /* rose-500 */
    font-weight: bold;
}
.price-through {
    color: #6b7280; /* gray-500 */
    font-size: 12px;
    text-decoration: line-through;
}
</style>