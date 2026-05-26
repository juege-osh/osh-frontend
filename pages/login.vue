<template>
    <n-form class="login-form" ref="formRef" :model="form" :rules="rules" size="large">

        <n-form-item path="username" :show-label="false">
            <n-input v-model:value="form.username" placeholder="用户名"/>
        </n-form-item>

        <n-form-item path="password" :show-label="false">
            <n-input v-model:value="form.password" placeholder="密码" type="password"/>
        </n-form-item>

        <div class="button-container">
            <div class="links">
                <n-button class="go-to-button" quaternary type="primary" size="tiny" @click="goRegister">
                    去注册
                </n-button>
                <nuxt-link to="/forget" class="link">忘记密码？</nuxt-link>
            </div>
        </div>

        <div>
            <n-button class="submit-button" type="primary" @click="onSubmit" :loading="loading">
                登录
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
    createDiscreteApi
} from "naive-ui"

const route = useRoute()

useHead({ title: '登录' })

const formRef = ref(null)
const loading = ref(false)

const form = reactive({
    username: "",
    password: ""
})

const rules = {
    username: [{ required: true, message: '请输入用户名' }],
    password: [{ required: true, message: "请输入密码" }]
}

const goRegister = () => {
    navigateTo('/register')
}

const onSubmit = () => {
    formRef.value.validate(async (errors) => {
        if (errors) return

        loading.value = true
        let { data, error } = await useLoginApi(form)
        loading.value = false

        if (error.value) return

        const { message } = createDiscreteApi(["message"])
        const result = data.value

        if (!result?.token) {
            message.error("登录失败，请检查账号状态后重试")
            return
        }

        message.success("登录成功")

        // 存储 token
        const token = useCookie("token")
        token.value = result.token

        // 存储用户信息
        const user = useUser()
        user.value = result

        // 存权限列表
        const permissions = usePermissions()
        permissions.value = result.permissionList || []
        savePermissions(result.permissionList || [])

        // 持久化 role 信息（含 level）
        if (process.client && result.role) {
            localStorage.setItem('__user_role__', JSON.stringify(result.role))
        }

        // 持久化 asset（积分）
        if (process.client && result.asset) {
            localStorage.setItem('__user_asset__', JSON.stringify(result.asset))
        }

        // 跳转
        navigateTo(route.query.from || "/", { replace: true })
    })
}

useEnterEvent(() => onSubmit())

definePageMeta({
    layout: "login"
})
</script>

<style scoped>
.login-form {
    width: 100%;
}

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

.submit-button:hover {
    background-color: #0056b3 !important;
    border-color: #0056b3 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}

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

.go-to-button {
    color: #007bff;
    font-size: 0.9rem;
}
</style>
