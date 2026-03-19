<template>
    <n-form class="login-form" ref="formRef" :model="form" :rules="rules" size="large">
        <n-form-item path="username">
            <n-input v-model:value="form.username" placeholder="用户名/手机/邮箱"/>
        </n-form-item>
        <n-form-item path="password">
            <n-input v-model:value="form.password" placeholder="密码" type="password"/>
        </n-form-item>
        <div class="button-container">
            <div class="links">
                <nuxt-link to="/register" class="link">注册</nuxt-link>
                <nuxt-link to="/forget" class="link">忘记密码？</nuxt-link>
            </div>
        </div>
        <div>
            <n-button class="submit-button" type="primary" @click="onSubmit" :loading="loading">
                登录
            </n-button>
        </div>
        <div class="agreement-container">
            注册即同意
            <n-button quaternary type="primary" size="tiny">《服务协议》</n-button>
            和
            <n-button quaternary type="primary" size="tiny">《隐私政策》</n-button>
        </div>
    </n-form>
</template>

<script setup>
import {
    NForm,
    NFormItem,
    NInput,
    NButton,
    createDiscreteApi
} from "naive-ui"

const route = useRoute()

const formRef = ref(null)
const form = reactive({
    username: "",
    password: ""
})

const rules = computed(() => ({
    username: [
        {
            required: true,
            message: "请输入用户名/手机号/邮箱"
        }
    ],
    password: [
        {
            required: true,
            message: "请输入密码"
        }
    ]
}))

const loading = ref(false)
const onSubmit = () => {
    formRef.value.validate(async (errors) => {
        if (errors) return
        
        loading.value = true

        let {
            data,
            error
        } = await useLoginApi(form)

        loading.value = false

        if (error.value) return

        const { message } = createDiscreteApi(["message"])
        message.success("登录成功")

        // ✅ 将用户登录成功返回的 token 存储在 cookie 当中，用户登录成功的标识
        const token = useCookie("token")
        token.value = data.value.token
        const user = useUser()
        user.value = data.value

        // ✅ 跳转
        navigateTo(route.query.from || "/", { replace: true })
    })
}

definePageMeta({
    layout: "login"
})
</script>

<style scoped>
.login-form {
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

/* 链接样式 */
.button-container {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
}

.links {
    display: flex;
    justify-content: space-between;
    width: 100%;
}

.link {
    color: #007bff;
    font-size: 0.875rem;
    text-decoration: none;
    padding: 0.25rem 0;
    font-weight: 400;
    transition: color 0.2s ease;
}

.link:hover {
    text-decoration: underline;
    color: #0056b3;
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
</style>