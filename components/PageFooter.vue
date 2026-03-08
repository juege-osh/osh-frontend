<template>
    <div class="footer">
        <div class="link-wrap">
            <a href="#" v-for="i in 5" class="link-item">友情链接</a>
        </div>
        <div class="copyright-wrap">
            <small>
                Copyright © 2022 dishait.cn 粤ICP备2020100536号
            </small>
        </div>
    </div>
</template>

<style>
/* 页脚容器：替换 mt-auto bg-dark-400 text-gray-100 */
.footer {
    margin-top: auto; /* 固定在页面底部 */
    background-color: #1f2937; /* 对应 bg-dark-400 的深灰色背景 */
    color: #f3f4f6; /* 对应 text-gray-100 的浅灰色文字 */
}

/* 友情链接容器：替换 flex items-center justify-center py-5 */
.link-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 20px;
    padding-bottom: 20px; /* py-5 对应 20px 上下内边距 */
}



/* 友情链接项：替换 p-3 */
.link-item {
    padding: 12px; /* p-3 对应 12px 内边距 */
    color: #f3f4f6; /* 文字颜色和页脚统一 */
    text-decoration: none; /* 去除链接下划线 */
}
/* 可选：链接hover效果，提升交互体验 */
.link-item:hover {
    color: #d1d5db;
}

/* 版权信息容器：替换 container border-t border-gray-700 flex items-center justify-center py-5 */
.copyright-wrap {
    max-width: 1280px; /* container 对应最大宽度 */
    margin: 0 auto; /* 水平居中 */
    border-top: 1px solid #374151; /* border-t border-gray-700 灰色上边框 */
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 20px;
    padding-bottom: 20px; /* py-5 对应 20px 上下内边距 */
    box-sizing: border-box;
    padding-left: 20px;
    padding-right: 20px; /* 补充左右内边距，适配小屏幕 */
}

/* 版权文字：继承页脚文字颜色 */
.copyright-wrap small {
    color: inherit;
}
</style>