<template>
    <n-button type="primary" ghost :disabled="time > 0 || !email || !username || !password || !repassword" :loading="loading" @click="send">
        {{ text }}
    </n-button>
</template>
<script setup>
import {
    NButton,
    createDiscreteApi
} from "naive-ui"

const props = defineProps(["email","username","password","repassword"])
const time = ref(0)
const timer = ref(null)
const loading = ref(false)

const text = computed(()=>{
    if(loading.value){
        return "发送中..."
    }
    if(time.value > 0){
        return `${time.value} s`
    }
    if(!props.email){
        return "请输入邮箱"
    }
    if(!props.username){
        return "请输入用户名"
    }
    if(!props.password){
        return "请输入密码"
    }
    if(!props.repassword){
        return "请输入确认密码"
    }
    return "发送邮箱"
})

// 发送验证码
const send = async ()=>{

    loading.value = true

    let {
        data,
        error
    } = await useGetCaptchaApi(props.email,props.username,props.password,props.repassword)

    loading.value = false

    if(error.value) return

    time.value = 60
    if(timer.value) clearInterval(timer.value)
    timer.value = setInterval(() => {
        time.value--
        if(time.value <= 0){
            clearInterval(timer.value)
        }
    }, 1000);


    const msg = data.value == "ok" ? "发送成功" : `${data.value}`
    const { message } = createDiscreteApi(["message"])
    message.success(msg)
}
</script>