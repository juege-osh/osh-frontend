<template>
    <div class="comment-flex-container">
        <n-avatar :size="40" :src="item.user.avatar"></n-avatar>
        <div class="comment-content-container">
            <h4>{{ item.user.name }}</h4>
            <small class="text-gray-500">
                <n-time :time="new Date(item.created_time)" type="datetime" />
            </small>
            <p class="comment-content">
                <n-tag size="small" :bordered="false" v-if="item.reply_user" class="reply-user-tag">
                    @{{ item.reply_user.username }}
                </n-tag>
                {{ item.content }}
            </p>
            <n-button strong secondary size="small" @click="openInput">
                回复
            </n-button>

            <CommentInput v-if="showInput" showCancel 
            @cancel="showInput = false"
            :reply_id="item.reply_id ? item.reply_id : item.id"
            :reply_user="reply_user"
            :post_id="item.post_id"
            @success="emit('commentSuccess')"/>

            <n-divider/>

            <slot/>

        </div>
    </div>
</template>
<script setup>
    import {
        NAvatar,
        NButton,
        NDivider,
        NTime,
        NTag
    } from "naive-ui"

    const props = defineProps({
        item:Object
    })

    const showInput = ref(false)
    function openInput(){
        showInput.value = true
    }

    const reply_user = computed(()=>{
        return {
            id:props.item.user.id,
            username:props.item.user.name,
            avatar:props.item.user.avatar,
        }
    })

    const emit = defineEmits(["commentSuccess"])
</script>

<style scoped>
.comment-flex-container {
  display: flex;
  padding: 1.25rem;
}

.comment-content-container {
  margin-left: 0.5rem;
  flex: 1;
}

.text-gray-500 {
  color: #6b7280;
}

.comment-content {
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}

.reply-user-tag {
  opacity: 0.5;
}
</style>