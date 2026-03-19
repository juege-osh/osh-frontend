<template>
    <div class="login-container">
        <div class="login-box">
            <h4 class="login-title">{{ $route.meta.title || '登录' }}</h4>
            <slot/>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    min-height: 100vh;
    background-color: #f3f4f6;
    display: flex;
    justify-content: center;
    align-items: center;
}


.login-box {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border-radius: 0.5rem;
    padding: 1.25rem;
    background-color: #ffffff;
}

.login-title {
    padding-bottom: 1rem;
    font-size: 1.25rem;
    color: #6b7280;
}

</style>