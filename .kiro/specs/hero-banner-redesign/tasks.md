# Implementation Tasks: Hero Banner Redesign

## Tasks

- [ ] 1. 重构 Hero Section 模板结构
  - [x] 1.1 将 `<div class="hero-container">` 和 `<div class="hero-content">` 合并替换为 `<div class="hero-center">`
  - [x] 1.2 将 Badge、h1、副标题、CTA 按钮、Stats Bar 移入 `hero-center` 容器，保持原有内容不变
  - [x] 1.3 移除整个 `<div class="hero-carousel">` 块（包含箭头、轮播卡片、指示点及相关事件绑定）
  - [x] 1.4 在 Stats Bar 下方新增 `<nav class="feature-nav" aria-label="功能导航">` 元素
  - [x] 1.5 在 `feature-nav` 内使用 `v-for` 遍历 `carouselItems`，为每项渲染 `<a>` 标签，包含 emoji（`aria-hidden="true"`）和标签文字，并设置 `aria-label="前往 {title}"`

- [ ] 2. 清理轮播相关 JavaScript 逻辑
  - [x] 2.1 移除 `carouselTimer` 变量及 `startCarousel`、`pauseCarousel`、`resumeCarousel`、`nextSlide`、`prevSlide`、`goToSlide` 函数
  - [x] 2.2 移除 `onMounted` / `onUnmounted` 中与轮播计时器相关的调用（保留其他生命周期逻辑）
  - [x] 2.3 保留 `carouselItems` 数组和 `carouselIndex` ref（`carouselIndex` 可保留用于副标题动态文字，或改为固定取第一项）

- [ ] 3. 更新 CSS 样式（用户友好设计）
  - [ ] 3.1 新增 `.hero-center` 居中容器样式（`max-width: 1000px`、`padding: 60px 24px 48px`）
  - [ ] 3.2 移除 `.hero-container`、`.hero-content`、`.hero-carousel` 及所有轮播相关 CSS 规则
  - [ ] 3.3 新增 `.feature-nav` 网格样式（桌面 5 列、`gap: 16px`、`margin-top: 40px`）
  - [ ] 3.4 新增 `.feature-nav-item` 样式（半透明白色背景、细边框、`padding: 16px 12px`、`border-radius: 14px`）
  - [ ] 3.5 新增 `.feature-nav-item:hover` 悬停样式（背景加深、边框加深、提升 4px、阴影增强）
  - [ ] 3.6 新增 `.feature-nav-icon`（`font-size: 32px`、`width: 48px`、`height: 48px`）和 `.feature-nav-label`（`font-size: 14px`、`font-weight: 500`）样式
  - [ ] 3.7 新增响应式媒体查询：
    - `@media (max-width: 1024px)` - 4 列、图标 28px、标题 40px
    - `@media (max-width: 768px)` - 3 列、图标 24px、标题 32px、标签 12px
    - `@media (max-width: 480px)` - 2 列、标题 28px

- [ ] 4. 验证视觉与功能完整性（用户友好）
  - [ ] 4.1 确认背景渐变、四周圆角（24px）、底部模糊切割（60px 高、12px 模糊）保留不变
  - [ ] 4.2 确认 CTA 按钮悬停动画正常工作，有明确的交互反馈
  - [ ] 4.3 确认 Feature Nav 共渲染 10 个入口，每个入口有半透明背景和细边框，点击可正确导航
  - [ ] 4.4 确认 Feature Nav 悬停效果：背景加深、边框加深、提升 4px、阴影增强
  - [ ] 4.5 确认响应式设计：
    - 桌面（≥1024px）：5 列、图标 32px、间距 16px
    - 平板（768px-1023px）：4 列、图标 28px、间距 14px
    - 手机（<768px）：3 列、图标 24px、间距 12px
    - 小屏（<480px）：2 列、图标 20px
  - [ ] 4.6 确认移动端触控目标不小于 44×44px，易于点击
  - [ ] 4.7 确认无障碍属性完整：`<nav aria-label="功能导航">` 存在，每个 `<a>` 含非空 `aria-label`，emoji `<span>` 含 `aria-hidden="true"`
