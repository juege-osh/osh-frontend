<template>
    <n-card class="mb-5 groupwork-card">
        <template #header>
            <div class="text-gray-500 text-sm header-text">
                {{ data.count }} 人在拼单,可直接参与
            </div>
        </template>
        <n-scrollbar style="height: 60px;">
            <div class="flex items-center h-[60px] px-4 groupwork-row"
            v-for="(item,index) in rows" :key="index">
                <n-avatar :size="45" 
                :src="item.users[0].avatar" round></n-avatar>
                <span class="ml-2 user-nickname">{{ item.users[0].nickname || item.users[0].username }}</span>
                <div class="ml-auto remaining-info">
                    <p>还差 <span class="text-rose-500 participants-needed">{{ item.total - item.num }}人</span> 拼成</p>
                    <div class="text-xs text-gray-500 mt-1 flex items-center time-remaining">
                        剩余
                        <CountDown :time="item.end_time" @end="handleTimeUp(index)"/>
                    </div>
                </div>
                <n-button type="primary" size="small" class="ml-2 join-btn" :loading="item.loading" @click="handleGroup(item)">去拼团</n-button>
            </div>
        </n-scrollbar>
    </n-card>
</template>
<script setup>
import {
    NCard,
    NScrollbar,
    NButton,
    NAvatar,
    createDiscreteApi
} from "naive-ui"

const props = defineProps({
    group_id:{
        type:Number,
        default:0
    }
})

let {
    data,
    error
} = await useGetGroupWorkListApi(props.group_id)

const rows = ref([])
if(!error.value){
    rows.value = data.value.rows.map(o=>{
        o.end_time = (new Date(o.created_time)).getTime() + 24 * 60 * 60 * 1000
        o.loading = false
        return o
    })
}

function handleTimeUp(index){
    rows.value.splice(index,1)
    data.value.count--
}

function handleGroup(item){
    useHasAuth(()=>{
        const { dialog } = createDiscreteApi(["dialog"])
        dialog.success({
          title: "提示",
          content: "是否要参与此次拼单？",
          positiveText: "确定",
          negativeText: "取消",
          onPositiveClick(){
            item.loading = true
            useCreateOrderApi({
                group_id:props.group_id,
                group_work_id:item.id
            },"group")
            .then(res=>{
                if(!res.error.value){
                    navigateTo(`/pay?no=${res.data.value.no}`)
                }
            })
            .finally(()=>{
                item.loading = false
            })
          }
        })
    })
}

</script>

<style scoped>
.groupwork-card {
  margin-bottom: 1.25rem;
}

.header-text {
  color: #6b7280;
  font-size: 0.875rem;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.h-60px {
  height: 60px;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.text-gray-500 {
  color: #6b7280;
}

.text-sm {
  font-size: 0.875rem;
  line-height: 1rem;
}

.text-rose-500 {
  color: #f43f5e;
}

.mt-1 {
  margin-top: 0.25rem;
}

.groupwork-row {
  height: 60px;
  display: flex;
  align-items: center;
  padding-left: 1rem;
  padding-right: 1rem;
}

.user-nickname {
  margin-left: 0.5rem;
}

.remaining-info {
  margin-left: auto;
}

.participants-needed {
  color: #f43f5e;
}

.time-remaining {
  font-size: 0.75rem;
  line-height: 1rem;
  color: #6b7280;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
}

.join-btn {
  margin-left: 0.5rem;
}
</style>