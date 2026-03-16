<template>
    <div class="settings-container">
        <p class="settings-title">其他设置</p>
        <div class="settings-item">
            手机号：{{ user.phone }}
            <n-button quaternary type="primary" size="small" class="modify-btn" @click="goToBindPhone">
                修改
            </n-button>
        </div>
    </div>
</template>

<style scoped>
.settings-container {
    padding: 1.25rem;
}

.settings-title {
    font-size: 0.875rem;
    color: #6b7280;
}

.settings-item {
    display: flex;
    padding: 1.25rem 0;
    border-bottom: 1px solid #e5e7eb;
}

.modify-btn {
    margin-left: auto;
}
</style>

<script setup>
    import {
        NButton
    } from "naive-ui"
    const user = useUser()
    const goToBindPhone = ()=>navigateTo("/bindphone")
</script>