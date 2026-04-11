<template>
    <div class="login-container">
        <div class="login-wrapper">
            <!-- 左侧宣传区域 -->
            <div class="login-sidebar">
                <div class="brand-logo">
                    <!-- <img src="/logo.png" alt="Brand Logo" style="width: 160px; height: auto;"> -->
                </div>
                <div class="welcome-text">
                    <h2>欢迎回来</h2>
                </div>
                <div class="testimonial">
                    <h3>
                        "此网站是提供优质开源项目服务的网站"
                    </h3>
                    <blockquote>
                        "我们致力于让开源技术不再难学，让用户能够轻松实现开源项目的理解到搭建"
                        模块介绍：热门模块可以看到top10的热门数据
                        即将更新热门模块
                    </blockquote>
                    <p>- JuegeTeam</p>
                </div>
            </div>
            
            <!-- 右侧登录表单 -->
            <div class="login-form-container">
                <div class="login-box">
                    <h4 class="login-title">{{ $route.meta.title || '登录' }}</h4>
                    <slot/>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.login-container {
    min-height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f3f4f6;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.login-wrapper {
    display: flex;
    width: 100%;
    height: 100vh;
    margin: 0;
    padding: 0;
}

.login-sidebar {
    flex: 0 0 30%;
    background: linear-gradient(135deg, #00b894, #0975c8);
    color: white;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.login-form-container {
    flex: 0 0 70%;
    background-color: white;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.brand-logo {
    margin-bottom: 2rem;
}

.welcome-text {
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-bottom: 2rem;
}

.testimonial {
    background-color: rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    border-radius: 8px;
    font-size: 0.9rem;
    line-height: 1.6;
}

.testimonial blockquote {
    margin: 0;
    line-height: 1.6;
    font-weight: 300;
}

.testimonial p {
    margin-top: 0.5rem;
    font-style: italic;
    font-weight: 400;
    opacity: 0.9;
}

.login-box {
    width: 100%;
    max-width: 450px;
    padding: 3rem;
}

.login-title {
    padding-bottom: 1rem;
    font-size: 1.75rem;
    color: #1473c7;
    text-align: center;
    font-weight: 600;
    letter-spacing: 0.5px;
}
</style>