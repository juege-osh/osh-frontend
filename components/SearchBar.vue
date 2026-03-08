<template>
    <n-drawer v-model:show="drawer" placement="top">
        <div class="drawer-content">
            <n-input-group class="input-group">
                <n-input size="large" v-model:value="keyword" placeholder="请输入关键词" :style="{ width: '500px' }" />
                <n-button class="search-button" size="large" type="primary" ghost :disabled="!keyword" @click="handleSearch">
                    搜索
                </n-button>
            </n-input-group>
        </div>
    </n-drawer>
</template>
<script setup>
import {
    NDrawer,
    NInputGroup,
    NInput,
    NButton
} from "naive-ui"

const drawer = ref(false)
const keyword = ref("")

const open = () => {
    keyword.value = ""
    drawer.value = true
}

const close = ()=>drawer.value = false

const handleSearch = ()=>{
    setTimeout(()=>{
        close()
    },100)

    navigateTo({
        name:"search-type-page",
        params:{
            type:"course",
            page:1
        },
        query:{
            keyword:keyword.value
        }
    })
}

function handleEnterEvent(e){
    if (e.key === "Enter" && keyword.value) {
        handleSearch()
    }
}

const addKeydownEvent = ()=> document.addEventListener("keydown",handleEnterEvent)
const removeKeydownEvent = ()=> document.removeEventListener("keydown",handleEnterEvent)

defineExpose({
    open
})
</script>

<style scoped>
.drawer-content{
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.input-group{
  display: flex;
  justify-content: center;
  align-items: center;
}
.search-button{
  margin-left: 8px;
}
</style>