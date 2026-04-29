# Design Document: Hero Banner Redesign

## Overview

将 `pages/index.vue` 中的 Hero Banner 从左右两栏布局（左侧文字 + 右侧功能轮播卡片）重构为居中单列布局，并将右侧轮播替换为图标网格形式的功能导航区（Feature Nav）。

本设计基于 Nuxt 3 / Vue 3，直接修改 `pages/index.vue` 文件，不引入新的外部依赖。

---

## Architecture

### 修改范围

仅修改 `pages/index.vue` 文件中的以下部分：

1. **Template**：`<section class="hero-section">` 内部结构
2. **Script**：移除轮播控制逻辑（`startCarousel`、`pauseCarousel`、`resumeCarousel`、`nextSlide`、`prevSlide`、`goToSlide`、`carouselTimer`），保留 `carouselItems` 数据（复用为 Feature Nav 数据源）
3. **Style**：替换 `.hero-container`、`.hero-content`、`.hero-carousel` 等相关样式，新增 `.feature-nav` 相关样式

### 数据复用

现有 `carouselItems` 数组已包含所有功能入口所需的数据（emoji、title、path），可直接复用为 Feature Nav 的数据源，无需新增数据定义。

---

## Component Design

### 新 Hero Section 结构

```
<section class="hero-section">
  <div class="hero-center">                    <!-- 居中容器，max-width: 900px -->
    <div class="hero-badge">...</div>           <!-- Badge 标签 -->
    <h1 class="hero-title">...</h1>             <!-- 主标题 + 渐变高亮 -->
    <p class="hero-desc">...</p>                <!-- 副标题（动态文字） -->
    <div class="hero-actions">...</div>         <!-- CTA 按钮组 -->
    <div class="hero-stats">...</div>           <!-- 统计数据栏 -->
    <nav class="feature-nav" aria-label="功能导航">
      <a class="feature-nav-item" ...>          <!-- 功能入口（每行最多5个） -->
        <span class="feature-nav-icon">emoji</span>
        <span class="feature-nav-label">title</span>
      </a>
    </nav>
  </div>
</section>
```

### 移除的元素

- `<div class="hero-container">` → 替换为 `<div class="hero-center">`
- `<div class="hero-content">` → 内容直接放入 `hero-center`
- `<div class="hero-carousel">` → 完全移除（包含箭头、轮播卡片、指示点）
- 轮播相关 JS：`carouselTimer`、`startCarousel`、`pauseCarousel`、`resumeCarousel`、`nextSlide`、`prevSlide`、`goToSlide`

### Feature Nav 数据结构

复用现有 `carouselItems`，每个入口使用以下字段：

```js
{
  emoji: String,   // 图标（emoji）
  title: String,   // 功能名称（显示标签）
  path: String,    // 导航路径
}
```

---

## Layout & Styling

### 居中布局

```css
.hero-center {
  max-width: 1000px;
  margin: 0 auto;
  padding: 60px 24px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
```

### Feature Nav 网格（用户友好设计）

```css
.feature-nav {
  display: grid;
  grid-template-columns: repeat(5, 1fr);  /* 桌面：每行5个 */
  gap: 16px;
  width: 100%;
  margin-top: 40px;
}

.feature-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border-radius: 14px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.feature-nav-item:hover {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.15);
}

.feature-nav-icon {
  font-size: 32px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.feature-nav-label {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
```

### 响应式断点（用户友好）

| 断点 | Feature Nav 列数 | 间距 | 图标大小 | 主标题字体 |
|------|-----------------|------|---------|-----------|
| ≥ 1024px | 5 列 | 16px | 32px | 52px |
| 768px - 1023px | 4 列 | 14px | 28px | 40px |
| < 768px | 3 列 | 12px | 24px | 32px |

```css
@media (max-width: 1024px) {
  .feature-nav {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }
  .feature-nav-icon {
    font-size: 28px;
    width: 44px;
    height: 44px;
  }
  .hero-title {
    font-size: 40px;
  }
}

@media (max-width: 768px) {
  .feature-nav {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 32px;
  }
  .feature-nav-item {
    padding: 12px 8px;
  }
  .feature-nav-icon {
    font-size: 24px;
    width: 40px;
    height: 40px;
  }
  .feature-nav-label {
    font-size: 12px;
  }
  .hero-title {
    font-size: 32px;
  }
  .hero-center {
    padding: 40px 16px 32px;
  }
}

@media (max-width: 480px) {
  .feature-nav {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .feature-nav-item {
    padding: 10px 6px;
  }
  .hero-title {
    font-size: 28px;
  }
  .hero-desc {
    font-size: 14px;
  }
}
```

### 保留的视觉样式（用户友好）

- **背景渐变**：`linear-gradient(135deg, #f0f9ff, #e0f2fe, #f8fafc)` - 柔和的蓝色渐变
- **四周圆角**：`border-radius: 24px` - 现代感的圆角设计
- **底部模糊切割**：高度 60px，模糊 12px - 明显的视觉分割
- **阴影效果**：`0 8px 32px rgba(14, 165, 233, 0.06)` - 轻微的深度感
- **标题渐变高亮**：`.hero-highlight` 样式不变 - 吸引用户注意力
- **CTA 按钮悬停动画**：`transform: translateY(-2px)` - 反馈感
- **Feature Nav 卡片**：半透明白色背景 + 细边框 - 清晰的可点击区域
- **Feature Nav 悬停**：提升 4px + 阴影增强 - 明确的交互反馈

---

## Accessibility（用户友好）

- `<h1>` 用于主标题 - 语义化标签
- Feature Nav 使用 `<nav>` 元素包裹，带 `aria-label="功能导航"` - 屏幕阅读器支持
- 每个功能入口使用 `<a>` 标签，带 `href` 属性 - 可键盘导航
- 每个功能入口添加 `aria-label` 属性（格式：`"前往 {title}"`） - 清晰的标签
- CTA 按钮使用 `<button>` 元素 - 语义化
- emoji 图标使用 `aria-hidden="true"` 隐藏，文字标签提供可读内容 - 避免重复
- 最小触控目标：44×44px（Feature Nav 项目） - 移动端友好
- 颜色对比度：WCAG AA 标准 - 视觉无障碍

---

## Correctness Properties

### Property 1: 居中布局完整性

所有核心内容元素（Badge、h1、副标题、CTA 按钮、Stats Bar、Feature Nav）均应存在于 `.hero-center` 容器内，且 `.hero-carousel` 不应存在于 DOM 中。

**Validates: Requirements 1.1, 1.2, 3.5**

### Property 2: Feature Nav 入口完整性

Feature Nav 渲染的入口数量应等于 `carouselItems` 数组的长度（10 个），且每个入口均包含 emoji、标签文字和有效的导航路径。

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 3: 响应式列数正确性

在不同视口宽度下，Feature Nav 的 CSS `grid-template-columns` 应分别为：
- ≥ 768px → `repeat(5, 1fr)`
- < 768px → `repeat(4, 1fr)`
- < 480px → `repeat(3, 1fr)`

**Validates: Requirements 5.2, 5.3**

### Property 4: 无障碍属性完整性

每个 Feature Nav 入口均应包含 `aria-label` 属性，且值不为空字符串。

**Validates: Requirements 6.2, 6.4**
