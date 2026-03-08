<template>
    <div class="body">
        <NavBar/>
        <main class="container">
            <slot/>
        </main>
        <PageFooter/>
    </div>
</template>
<style>
/* 替换所有 @apply 语法，保留原有 min-width 配置 */
.body {
    min-width: 1000px;
    /* 替换 @apply bg-gray-100 */
    background-color: #f3f4f6;
    /* 替换 @apply flex flex-col */
    display: flex;
    flex-direction: column;
    /* 替换 @apply min-h-screen */
    min-height: 100vh;
}

/* 可选：给 container 补充基础样式，保证内容布局合理 */
.container {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 20px;
    flex: 1; /* 让主内容区域自动填充剩余高度，footer 固定在底部 */
    box-sizing: border-box;
}
</style>