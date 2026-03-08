<template>
    <div class="post-list-container">
       <div class="post-content" @click="open">
          <n-tag v-if="item.is_top" :bordered="false" type="success" size="small">置顶</n-tag>
          {{ item.desc.text }}
       </div>
       <div class="post-images-container">
          <n-image v-for="(img,imgI) in item.desc.images" :key="imgI" 
          :src="img" 
          :width="item.desc.images.length == 1 ? 300 : 150"
          :height="item.desc.images.length == 1 ? 200 : 100"
          class="image-item"
          preview-disabled/>
       </div>
       <div class="post-actions">
            <n-button secondary strong size="tiny" class="action-btn"
            :type="item.issupport ? 'primary' : 'tertiary'"
            @click.stop="handleSupport(item)" :loading="supportLoading">
                <template #icon>
                    <n-icon><ThumbsUpSharp /></n-icon>
                </template>
                点赞 {{ item.support_count || '' }}
            </n-button>

            <n-button secondary strong size="tiny" class="action-btn">
                <template #icon>
                    <n-icon><ChatboxEllipsesOutline /></n-icon>
                </template>
                评论 {{ item.comment_count || '' }}
            </n-button>
            <n-button text size="tiny" class="action-btn">作者：{{ item.user.name }}</n-button>
            <n-button type="error" size="tiny" class="action-btn" @click="deleteItem" :loading="loading">
                删除
            </n-button>
       </div>
    </div>
</template>
<script setup>
import {
    NTag,
    NImage,
    NButton,
    NIcon,
    createDiscreteApi
} from "naive-ui"
import {
    ThumbsUpSharp,
    ChatboxEllipsesOutline
} from "@vicons/ionicons5"

const props = defineProps({
    item:Object
})

const {
    supportLoading,
    handleSupport
} = useHandleSupportPost()

const emit = defineEmits(["delete"])
const loading = ref(false)
const deleteItem = ()=>{
    const { dialog,message } = createDiscreteApi(["dialog","message"])
    dialog.warning({
        content: "是否要删除该帖子？",
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick: async () => {
            loading.value = true
            emit("delete",{
                id:props.item.id,
                success(){
                    message.success('删除成功')
                    loading.value = false
                },
                fail(){
                    loading.value = false
                }
            })
        },
    });
}

const open = ()=>{
    navigateTo("/post_detail/"+props.item.id)
}
</script>
<style scoped>
.post-list-container {
  border-bottom: 1px solid #e5e7eb;
  padding: 1.25rem;
}

.post-content {
  cursor: pointer;
  color: #6b7280;
}

.post-images-container {
  margin-top: 0.75rem;
  cursor: pointer;
  max-width: 31.25rem;
}

.image-item {
  margin-right: 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
}

.post-actions {
  display: flex;
  margin-top: 1.25rem;
}

.action-btn {
  margin-right: 0.75rem;
}
</style>