<template>
  <n-alert :type="status == 'ing' ? 'success' : 'default'" :show-icon="false">
    <p class="live-time-text">直播时间：{{ start }} ~ {{ end }}</p>
  </n-alert>
</template>

<script setup>
    import {
        NAlert
    } from "naive-ui"

    const props = defineProps(["start","end"])

    const status = computed(()=>{
        let { start,end } = props
        return useTimeStatus(start,end)
    })
</script>

<style scoped>
.live-time-text {
  font-size: 0.75rem;
  line-height: 1rem;
  color: #9ca3af;
}
</style>