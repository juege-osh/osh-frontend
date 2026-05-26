<template>
    <div class="loading-group-container">
        <template v-if="loading">
            <slot name="loading">
                <LoadingSkeleton/>
            </slot>
        </template>
        <template v-else-if="error">
            <n-result class="result-container" status="500" title="错误提示" 
            :description="getErrorDescription(error)">
                <template #footer>
                    <n-button @click="$router.go(-1)">返回上一页</n-button>
                </template>
            </n-result>
        </template>
        <template v-else-if="isEmpty">
            <Empty/>
        </template>
        <template v-else>
            <slot />
        </template>
    </div>
</template>
<script setup>
import { onBeforeUnmount } from "vue";
import {
    NButton,
    NResult
} from "naive-ui"
const props = defineProps({
    pending: {
        type: Boolean,
        default: false
    },
    error: {
        type: [String, Boolean, Symbol, Error, Object],
        default: false
    },
    isEmpty:{
        type:Boolean,
        default:false
    }
})

const loading = ref(false)
const stop = watchEffect(()=>{
    if(props.pending && !loading.value){
        loading.value = true
    } else {
        setTimeout(() => {
            loading.value = false
        }, 200);
    }
})
onBeforeUnmount(()=>stop())

// 获取错误描述
function getErrorDescription(error) {
    if (!error) return '页面走丢了~'
    
    // 如果是Error对象
    if (error instanceof Error || error?.message) {
        return error.message || '请求失败，请检查网络连接'
    }
    
    // 如果是HTTP错误响应
    if (error?.data?.data) {
        return error.data.data
    }
    
    if (error?.data?.msg) {
        return error.data.msg
    }
    
    // 如果是字符串
    if (typeof error === 'string') {
        return error
    }
    
    return '页面走丢了~'
}
</script>
<style scoped>
.loading-group-container {
  /* Container div doesn't have specific Tailwind classes to convert */
}

.result-container {
  margin-top: 2.5rem; /* corresponds to mt-10 */
}
</style>
