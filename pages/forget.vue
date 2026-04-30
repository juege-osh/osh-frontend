<template>
    
    <n-form class="forget-form" ref="formRef" :model="form" :rules="rules" size="large">

        <n-form-item :show-label="false" path="username">
                <n-input v-model:value="form.username" placeholder="用户名"/>
        </n-form-item>

        <n-form-item :show-label="false" path="uniqueId">
                <n-input class="uniqueId-input" v-model:value="form.uniqueId" placeholder="unique id"/>
        </n-form-item>
        
        <n-form-item :show-label="false" path="password">
            <n-input v-model:value="form.password" placeholder="密码" type="password"/>
        </n-form-item>
        
        <n-form-item :show-label="false" path="repassword">
            <n-input v-model:value="form.repassword" placeholder="确认密码" type="password" :disabled="!form.password"/>
        </n-form-item>
        
        <div class="button-container">
            <n-button class="back-login" quaternary type="primary" size="tiny" @click="$router.go(-1)">
                返回登录
            </n-button>
        </div>
        
        <div>
            <n-button class="submit-button" type="primary" @click="onSubmit" :loading="loading">
                重置密码
            </n-button>
        </div>
    </n-form>
</template>

<script setup>
import {
    NForm,
    NFormItem,
    NInput,
    NButton,
    NInputGroup,
    createDiscreteApi
} from "naive-ui"
const router = useRouter()
useHead({ title:"忘记密码" })

const formRef = ref(null)
const form = reactive({
    username:"",
    uniqueId:"",
    password:"",
    repassword:""
})

const rules = {
    username:[{
        required: true,
        message:'用户名必填'
    },{
        // 添加用户名或邮箱格式校验规则
        validator: (rule, value) => {
            // 检查是否为8位字符的用户名或有效邮箱格式
            const isUsername = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,16}$/.test(value);
            const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
            
            return isUsername || isEmail;
        },
        message: "用户名或邮箱格式不正确",
        trigger: ["input", "blur"]
        }],
    uniqueId:[{
        required: true,
        message:'unique id必填'
    }],
    password:[{
        required: true,
        message:"密码必填"
    },{
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,16}$/,
            message: "密码必须至少8位，包含字母和数字",
            trigger: ["input", "blur"]
        }],
    repassword:[{
        required: true,
        message:"确认密码必填"
    },{
        validator(rule, value) {
            return value === form.password
        },
        message:"两次密码输入不一致",
        trigger: ["input", "blur"]
    }]
}

const loading = ref(false)
const onSubmit = ()=>{
    formRef.value.validate(async (errors)=>{
        if(errors) return
        
        loading.value = true

        let {
            data,
            error
        } = await useForgetApi(form)

        loading.value = false

        if(error.value) return

        const { message } = createDiscreteApi(["message"])

        message.success("重置密码成功")

        router.go(-1)
    })
}

useEnterEvent(()=>onSubmit())

definePageMeta({
    title:"忘记密码",
    layout:"login"
})
</script>

<style scoped>
.forget-form {
    width: 100%;
}

/* 主按钮样式 */
.submit-button {
    width: 100%;
    background-color: #007bff !important;
    border-color: #007bff !important;
    color: white !important;
    font-weight: 500;
    border-radius: 4px;
    padding: 0.75rem 0;
    margin-top: 1rem;
    font-size: 1rem;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
}

/* 悬停效果 */
.submit-button:hover {
    background-color: #0056b3 !important;
    border-color: #0056b3 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

/* 输入框样式 */
.n-input {
    border-radius: 4px;
    border: 1px solid #d1d5da;
    transition: border-color 0.2s ease;
    font-size: 0.95rem;
}

/* 输入框聚焦状态 */
.n-input:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

/* 验证码输入框 */
.uniqueId-input {
    border-radius: 4px 0 0 4px;
}

/* 链接样式 */
.button-container {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
}

.agreement-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    font-size: 0.75rem;
    margin-top: 1.25rem;
    color: #6b7280;
    line-height: 1.5;
}

.agreement-container .n-button {
    color: #007bff;
    padding: 0;
    margin: 0 0.25rem;
    font-size: 0.75rem;
    font-weight: 400;
}

/* 返回登录按钮样式 */
.back-login {
    color: #6281bf;
    font-size: 15px;
}

.back-login:hover {
    color: #6b7280;
}
</style>