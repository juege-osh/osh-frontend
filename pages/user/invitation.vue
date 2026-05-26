<template>
    <div class="invitation-page">
        <!-- 我的邀请码 -->
        <div class="invite-code-section">
            <h3 class="section-title">我的邀请码</h3>
            <div class="invite-code-box">
                <span class="invite-code-text">{{ inviteCode || '暂无邀请码' }}</span>
                <n-button size="small" type="primary" @click="copyCode" :disabled="!inviteCode">
                    复制
                </n-button>
            </div>
            <p class="invite-tip">分享邀请码给好友，好友注册时填写即可建立邀请关系</p>
        </div>

        <!-- 邀请记录 -->
        <div class="invite-list-section">
            <h3 class="section-title">邀请记录 ({{ inviteeList.length }}人)</h3>
            <div v-if="inviteeList.length === 0" class="empty-tip">暂无邀请记录</div>
            <div v-else class="invitee-list">
                <div v-for="(item, index) in inviteeList" :key="index" class="invitee-item">
                    <n-avatar round :size="36" :src="item.avatar || defaultAvatar" />
                    <div class="invitee-info">
                        <span class="invitee-name">{{ item.username }}</span>
                        <span class="invitee-time">{{ item.createTime }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { NButton, NAvatar, createDiscreteApi } from "naive-ui"

useHead({ title: '我的邀请' })

const defaultAvatar = DEFAULT_AVATAR
const inviteCode = ref('')
const inviteeList = ref([])

// 获取邀请码
const loadInviteCode = async () => {
    const { data } = await useMyInviteCodeApi()
    if (data.value) {
        inviteCode.value = data.value.inviteCode || ''
    }
}

// 获取邀请列表
const loadInviteeList = async () => {
    const { data } = await useMyInviteeListApi()
    if (data.value) {
        inviteeList.value = data.value.rows || []
    }
}

// 复制邀请码
const copyCode = async () => {
    if (!inviteCode.value) return
    try {
        await navigator.clipboard.writeText(inviteCode.value)
        const { message } = createDiscreteApi(["message"])
        message.success("邀请码已复制")
    } catch (e) {
        const { message } = createDiscreteApi(["message"])
        message.error("复制失败，请手动复制")
    }
}

await loadInviteCode()
await loadInviteeList()
</script>

<style scoped>
.invitation-page {
    padding: 1.5rem;
}

.section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.75rem;
}

.invite-code-section {
    margin-bottom: 2rem;
}

.invite-code-box {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
}

.invite-code-text {
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #3b82f6;
    font-family: monospace;
}

.invite-tip {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #9ca3af;
}

.invite-list-section {
    margin-top: 1.5rem;
}

.empty-tip {
    color: #9ca3af;
    font-size: 0.875rem;
    padding: 2rem 0;
    text-align: center;
}

.invitee-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.invitee-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.5rem;
}

.invitee-info {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
}

.invitee-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
}

.invitee-time {
    font-size: 0.75rem;
    color: #9ca3af;
}
</style>
