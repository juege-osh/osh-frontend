<template>
    <div class="fava-list-item">
        <n-tag :bordered="false" type="info" size="small" class="tag">
            {{ t[item.type] }}
        </n-tag>
        <n-image :src="item.goods.cover" class="image"/>
        <span class="title">{{ item.goods.title }}</span>
        <div class="btn-group">
            <n-button class="view-btn" type="primary" size="tiny" @click="open">查看</n-button>
            <n-button type="error" size="tiny" @click="deleteItem" :loading="loading">删除</n-button>
        </div>
    </div>
</template>
<script setup>
import {
    NTag,
    NImage,
    NButton,
    createDiscreteApi
} from "naive-ui"
const props = defineProps({
    item:Object
})

const open = ()=>{
    navigateTo(`/detail/${props.item.type}/${props.item.goods.id}`)
}

const t = {
    course:"课程",
    book:"电子书",
    column:"专栏",
    live:"直播"
}

const emit = defineEmits(["delete"])
const loading = ref(false)
const deleteItem = ()=>{
    const { dialog,message } = createDiscreteApi(["dialog","message"])
    dialog.warning({
        content: "是否要取消该收藏？",
        positiveText: "确定",
        negativeText: "取消",
        onPositiveClick: async () => {
            const { item } = props
            loading.value = true
            emit("delete",{
                goods_id:item.goods.id,
                type:item.type,
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
</script>

<style scoped>
.fava-list-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  display: flex;
  padding: 1rem;
  margin-bottom: 1rem;
  align-items: center;
  background-color: #fff;
  transition: box-shadow 0.3s ease;
  gap: 1rem;
  flex-wrap: nowrap;
  min-width: 0;
}

.fava-list-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tag {
  flex-shrink: 0;
  white-space: nowrap;
}

.image {
  width: 60px;
  height: 60px;
  min-width: 60px;
  min-height: 60px;
  object-fit: cover;
  border-radius: 0.5rem;
  flex-shrink: 0;
}

.title {
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  flex: 1;
  min-width: 0;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-group {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  margin-left: auto;
}

.view-btn {
  flex-shrink: 0;
}
</style>
