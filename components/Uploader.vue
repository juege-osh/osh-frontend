<template>
    <div style="width:100%;">
        <ClientOnly>
            <template #fallback>
                <!-- 加载中 -->
                <div class="upload-fallback"
                style="width:94px;height:94px;">
                    <n-spin show />
                </div>
            </template>
            <n-upload
                accept="image/png,image/jpeg,image/gif"
                :action="action"
                :headers="headers"
                v-model:file-list="fileList"
                name="file"
                :data="data"
                list-type="image-card"
                :max="1"
                :on-error="handleError"
                :on-finish="handleSuccess"
                :multiple="false"
            />
        </ClientOnly>
    </div>
</template>
<script setup>
import {
    NSpin,
    NUpload,
    createDiscreteApi
} from "naive-ui"
const {
    action,
    headers
} = useUploadConfig()

const props = defineProps({
    modelValue:String,
    data:{
        type:Object
    }
})

const fileList = ref([])

initFileList()

// 上传成功
const handleSuccess = (...e)=>{
    const { file,event } = e[0]
    const response = JSON.parse(event.target.response)
    file.url = response.data.previewUrl
    // 上传接口返回的data
    file.userData = response.data
    return file
}

// 上传失败
const handleError = (e)=>{
    const { message } = createDiscreteApi(["message"])
    message.error("上传失败")
}

// 初始化filelist
function initFileList(){
    fileList.value = props.modelValue ? [{
        id: props.modelValue,
        name: props.modelValue,
        status: 'finished',
        url: props.modelValue
    }] : []
}

// 监听fileList变化
const stopWatch = watch(()=>fileList,(newVal)=>{
    updateModelValue()
},{
    deep:true
})

onBeforeUnmount(()=>stopWatch())

const emit = defineEmits(["update:modelValue"])
function updateModelValue(){
    let userDataList = []
    fileList.value.forEach(o=>{
        if(o.status === "finished" && o.url){
            userDataList.push(o.userData)
        }
    })
    // 适配后台文件上传接口的返回值
    emit("update:modelValue", userDataList[0] || "")
}

</script>

<style scoped>
.upload-fallback {
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    background-color: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>