# 电子书功能修复总结

## 修复的问题

### 1. ✅ API路径重复问题
**问题**: URL中出现 `/pc/pc/` 重复路径
**原因**: `baseURL` 已包含 `/pc`，但代码中又添加了一次
**修复**: 移除所有API调用中多余的 `/pc` 前缀

#### 修复的文件：
- `components/Book/Editor.vue` - 图片上传接口
- `pages/book/CreateBook.vue` - 创建电子书接口
- `pages/book/edit/[id].vue` - 更新电子书接口
- `pages/book/index.vue` - 删除电子书接口

### 2. ✅ 图片上传功能
**实现**: 图片上传到后端服务器，返回URL
**接口**: `/upload` (baseURL已包含/pc)
**参数**: 
- `file`: 图片文件
- `type`: 'image'

### 3. ✅ 图片编辑功能
**功能**:
- 尺寸调整: 25%/50%/75%/100%
- 布局控制: 左浮动/居中/右浮动/行内显示
- 支持同一行多张图片

## API路径规范

### 正确的路径格式
```javascript
// ✅ 正确 - 不包含 /pc
$fetch('/book/create', {
  baseURL: fetchConfig.baseURL, // 已包含 /pc
  ...
})

// ❌ 错误 - 重复 /pc
$fetch('/pc/book/create', {
  baseURL: fetchConfig.baseURL, // 已包含 /pc
  ...
})
```

### baseURL配置
```javascript
// useHttp.js
function getBaseURL() {
  if (process.server) {
    return "http://localhost:8081/pc"
  }
  
  const hostname = window.location.hostname
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return "http://localhost:8081/pc"
  } else {
    return "http://43.242.200.25:8090/pc"
  }
}
```

## 电子书API列表

### 前端调用（不含/pc前缀）
- `POST /book/page` - 电子书列表
- `GET /book/getById` - 电子书详情
- `GET /book/menus` - 章节菜单
- `GET /book/detail` - 章节内容
- `POST /book/create` - 创建电子书
- `POST /book/update` - 更新电子书
- `DELETE /book/delete` - 删除电子书
- `POST /upload` - 上传图片

### 实际请求URL（自动拼接）
- `http://localhost:8081/pc/book/page`
- `http://localhost:8081/pc/book/getById`
- `http://localhost:8081/pc/book/menus`
- `http://localhost:8081/pc/book/detail`
- `http://localhost:8081/pc/book/create`
- `http://localhost:8081/pc/book/update`
- `http://localhost:8081/pc/book/delete`
- `http://localhost:8081/pc/upload`

## 测试清单

- [x] 图片上传功能
- [x] 图片尺寸调整
- [x] 图片布局控制
- [x] 创建电子书
- [x] 编辑电子书
- [x] 删除电子书
- [x] 查看电子书列表
- [x] 查看电子书详情
- [x] 章节导航
- [x] 内容展示

## 注意事项

1. **所有API调用都不要加 `/pc` 前缀**，因为 `baseURL` 已经包含
2. **图片上传限制**: 最大3MB
3. **图片格式**: 支持常见图片格式
4. **环境切换**: 自动根据hostname切换API地址

## 下一步

- [ ] 添加电子书封面上传
- [ ] 添加章节排序功能
- [ ] 添加批量操作
- [ ] 添加搜索和筛选
- [ ] 添加数据统计
