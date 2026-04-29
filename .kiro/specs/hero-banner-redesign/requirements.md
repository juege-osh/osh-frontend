# Requirements Document

## Introduction

本功能对首页 Hero Banner 进行重新设计，将当前的左右两栏布局（左侧文字 + 右侧功能轮播卡片）改为居中布局，提升视觉层次感与用户友好性。新设计需在 Nuxt 3 / Vue 3 项目中实现，保留现有的核心内容（标题、副标题、CTA 按钮、统计数据、功能入口），同时通过居中排版、更清晰的视觉层次和更流畅的交互体验，让首屏更具吸引力。

## Glossary

- **Hero_Banner**: 首页顶部的全宽视觉区域，包含主标题、副标题、CTA 按钮、统计数据和功能入口。
- **CTA_Button**: Call-to-Action 按钮，引导用户进行关键操作（如"进入课程"、"浏览电子书"）。
- **Feature_Nav**: 功能导航区域，展示平台核心功能入口（题库、答疑、秒杀、拼团等）。
- **Stats_Bar**: 统计数据展示区，显示课程数量、电子书数量、用户数量等关键指标。
- **Hero_Section**: Vue 组件中对应 Hero Banner 的 `<section>` 元素。
- **Carousel**: 当前右侧的功能轮播卡片组件。
- **Badge**: Hero Banner 顶部的小标签（如"全新开源助手平台上线"）。

---

## Requirements

### Requirement 1: 居中布局

**User Story:** 作为访问首页的用户，我希望 Hero Banner 的文字内容居中显示，以便获得更清晰、更聚焦的视觉体验。

#### Acceptance Criteria

1. THE Hero_Section SHALL 将所有文字内容（Badge、标题、副标题、CTA_Button、Stats_Bar）水平居中对齐。
2. THE Hero_Section SHALL 移除当前的左右两栏 `grid` 布局，改为单列居中 `flex` 或 `block` 布局。
3. THE Hero_Section SHALL 保持最大宽度约束（`max-width: 900px`），并通过 `margin: 0 auto` 实现水平居中。
4. WHEN 视口宽度小于 768px，THE Hero_Section SHALL 保持居中布局，并适当调整字体大小与内边距以适配移动端。

---

### Requirement 2: 保留并重新排布核心内容

**User Story:** 作为访问首页的用户，我希望在新的居中布局中仍能看到平台的核心信息，以便快速了解平台价值并做出行动决策。

#### Acceptance Criteria

1. THE Hero_Banner SHALL 保留 Badge 标签（"全新开源助手平台上线"）并显示在标题上方。
2. THE Hero_Banner SHALL 保留主标题"探索知识的无限可能"及高亮渐变样式。
3. THE Hero_Banner SHALL 保留副标题描述文字，内容来自 `carouselItems[carouselIndex].subtitle`。
4. THE Hero_Banner SHALL 保留"进入课程"和"浏览电子书"两个 CTA_Button，并水平居中排列。
5. THE Hero_Banner SHALL 保留 Stats_Bar（1000+ 精品课程、500+ 电子书籍、50K+ 学习用户），并水平居中排列。

---

### Requirement 3: 功能入口替换轮播

**User Story:** 作为访问首页的用户，我希望能在 Hero Banner 中直观地看到平台的核心功能入口，以便快速导航到感兴趣的功能。

#### Acceptance Criteria

1. THE Hero_Banner SHALL 在 Stats_Bar 下方展示 Feature_Nav 功能入口区域。
2. THE Feature_Nav SHALL 以图标网格（Icon Grid）形式展示平台核心功能，每行最多显示 5 个入口。
3. THE Feature_Nav SHALL 展示至少以下功能入口：题库考试、学习答疑、限时秒杀、拼团优惠、精选开源项目、实用网站、开发工具、技术信息差、学习套餐、内部入口。
4. WHEN 用户点击 Feature_Nav 中的某个功能入口，THE Hero_Banner SHALL 导航到对应的功能页面。
5. THE Hero_Section SHALL 移除当前右侧的 Carousel 轮播组件（箭头、轮播卡片、指示点）。

---

### Requirement 4: 视觉层次与用户友好性

**User Story:** 作为访问首页的用户，我希望 Hero Banner 具有清晰的视觉层次和友好的视觉风格，以便获得良好的第一印象。

#### Acceptance Criteria

1. THE Hero_Section SHALL 保留现有的浅蓝色渐变背景（`linear-gradient(135deg, #f0f9ff, #e0f2fe, #f8fafc)`）。
2. THE Hero_Section SHALL 保留底部圆角（`border-radius: 0 0 32px 32px`）和阴影效果。
3. THE Hero_Banner SHALL 在标题与副标题之间保持合理的垂直间距（不少于 16px）。
4. THE CTA_Button SHALL 保留悬停时的上移动画效果（`transform: translateY(-2px)`）。
5. WHEN 用户将鼠标悬停在 Feature_Nav 的功能入口上，THE Feature_Nav SHALL 显示视觉反馈（如背景色变化或轻微上移动画）。

---

### Requirement 5: 响应式适配

**User Story:** 作为使用移动设备访问首页的用户，我希望 Hero Banner 在小屏幕上也能正常显示，以便在任何设备上都能获得良好体验。

#### Acceptance Criteria

1. WHEN 视口宽度小于 768px，THE Hero_Section SHALL 将主标题字体大小调整为不超过 36px。
2. WHEN 视口宽度小于 768px，THE Feature_Nav SHALL 每行最多显示 4 个功能入口。
3. WHEN 视口宽度小于 480px，THE Feature_Nav SHALL 每行最多显示 3 个功能入口。
4. WHEN 视口宽度小于 768px，THE CTA_Button SHALL 保持可点击区域不小于 44×44px（符合移动端触控标准）。
5. WHEN 视口宽度小于 768px，THE Stats_Bar SHALL 保持水平排列，各统计项之间的分隔线正常显示。

---

### Requirement 6: 无障碍访问

**User Story:** 作为使用辅助技术的用户，我希望 Hero Banner 的交互元素具有正确的语义标记，以便屏幕阅读器能够正确读取内容。

#### Acceptance Criteria

1. THE CTA_Button SHALL 使用 `<button>` 元素或带有 `role="button"` 的元素，并包含可读的文字内容。
2. THE Feature_Nav 中的每个功能入口 SHALL 包含描述性的 `aria-label` 属性或可见文字标签。
3. THE Hero_Banner 的主标题 SHALL 使用 `<h1>` 元素，确保页面标题层级正确。
4. IF 功能入口仅使用 emoji 作为图标，THEN THE Feature_Nav SHALL 为每个入口提供 `aria-label` 或 `title` 属性以描述其功能。
