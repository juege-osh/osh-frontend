<template>
    <div>
        问答社区 {{ $route.params.bbs_id }} ~ {{ $route.params.page }} ~ {{ $route.name }}
    </div>
</template>
<script setup>
const route = useRoute()

useHead({
    title:"社区问答列表"
})

</script>