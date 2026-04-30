# 电子书功能使用指南

## 功能概述

电子书模块已全面升级，支持完整的CRUD操作、富文本编辑、图片上传等功能。

## 主要功能

### 1. 电子书管理 (`/book`)
- 查看所有电子书列表
- 新增、编辑、删除电子书
- 查看电子书详情

### 2. 电子书创建 (`/book/CreateBook`)
- 富文本编辑器支持
- 多章节管理
- 自动生成目录
- 图片上传到后端（非base64）
- 图片缩放和布局控制

### 3. 电子书编辑 (`/book/edit/[id]`)
- 加载现有电子书数据
- 修改内容和章节
- 保存更新

### 4. 电子书查看 (`/detail/book/[id]`)
- 查看电子书详情
- 章节目录导航
- 购买/学习功能
- 免费试看

### 5. 电子书阅读 (`/book/[book_id]/[id]`)
- 左侧章节导航
- 右侧内容展示
- 图片自适应显示

## 图片编辑功能

### 图片上传
- 点击工具栏的图片按钮
- 选择本地图片（最大3MB）
- 自动上传到后端服务器
- 返回图片URL并插入编辑器

### 图片尺寸调整
点击编辑器中的图片，弹出控制面板：
- **25%**: 缩小到25%宽度
- **50%**: 缩小到50%宽度
- **75%**: 缩小到75%宽度
- **100%**: 原始宽度

### 图片布局方式
- **← 左浮动**: 图片浮动到左侧，文字环绕右边
- **■ 不浮动**: 图片独占一行，居中显示
- **→ 右浮动**: 图片浮动到右侧，文字环绕左边
- **↔ 行内显示**: 图片以行内方式显示，可同一行多张图

### 使用场景
1. **图文混排**: 使用左/右浮动，让文字环绕图片
2. **多图并排**: 将多张图片设为"行内显示"
3. **独立展示**: 使用"不浮动"让图片居中独占一行

## 快捷键

### 标题快捷键（Mac/Windows通用）
- **Cmd/Ctrl + 1**: 一级标题
- **Cmd/Ctrl + 2**: 二级标题
- **Cmd/Ctrl + 3**: 三级标题
- **Cmd/Ctrl + 0**: 取消标题

## API接口

### 前端接口
- `useBookListApi(type, query)`: 获取电子书列表
- `usegetByIdDetailApi(type, query)`: 获取电子书详情
- `useBookMenusApi(id)`: 获取电子书章节菜单
- `useBookDetailApi(book_id, id)`: 获取章节内容

### 后端接口
- `POST /pc/book/page`: 电子书分页列表
- `GET /pc/book/getById`: 获取电子书详情
- `GET /pc/book/menus`: 获取章节菜单
- `GET /pc/book/detail`: 获取章节内容
- `POST /pc/book/create`: 创建电子书
- `POST /pc/book/update`: 更新电子书
- `DELETE /pc/book/delete`: 删除电子书
- `POST /pc/upload`: 上传图片

## 数据结构

### 电子书对象
```javascript
{
  id: Number,
  title: String,
  cover: String,
  description: String,
  price: Number,
  original_price: Number,
  sub_count: Number,
  status: String, // '0': 已发布, '1': 草稿
  create_time: String,
  update_time: String
}
```

### 章节对象
```javascript
{
  id: Number,
  book_id: Number,
  title: String,
  content: String, // HTML内容
  orderby: Number,
  isfree: Number, // 1: 免费, 0: 付费
  create_time: String,
  update_time: String
}
```

## 注意事项

1. **图片大小限制**: 单张图片不超过3MB
2. **图片格式**: 支持常见图片格式（jpg, png, gif等）
3. **章节顺序**: 章节按orderby字段排序
4. **免费试看**: 至少设置一个章节为免费（isfree=1）
5. **内容保存**: 图片URL会保存在HTML内容中

## 故障排查

### 图片上传失败
1. 检查图片大小是否超过3MB
2. 检查后端上传接口是否正常
3. 查看浏览器控制台错误信息

### 图片不显示
1. 检查图片URL是否有效
2. 检查网络连接
3. 查看浏览器控制台是否有跨域错误

### 保存失败
1. 检查必填字段是否完整
2. 查看后端日志
3. 确认用户权限

## 开发计划

- [ ] 支持视频内容
- [ ] 支持音频内容
- [ ] 支持PDF导出
- [ ] 支持批量导入
- [ ] 支持版本历史
- [ ] 支持协作编辑
