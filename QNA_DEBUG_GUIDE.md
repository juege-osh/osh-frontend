# 问答功能调试指南

## 🔧 已完成的修复

### 1. 修正了API URL拼接
```javascript
// 之前：http://localhost:8081/pc + /api/qna = http://localhost:8081/pc/api/qna ❌
// 现在：http://localhost:8081/api/qna ✅
const QNA_BASE = fetchConfig.baseURL.replace('/pc', '/api/qna');
```

### 2. 增强了日志输出
- ✅ 请求URL
- ✅ 请求头（包含token）
- ✅ 请求体（JSON格式）
- ✅ 响应数据
- ✅ 错误详情（status, statusText, data, message）

### 3. 完善了错误处理
- ✅ try-catch 捕获
- ✅ 详细的错误信息
- ✅ 友好的用户提示

## 🧪 测试步骤

### 1. 刷新页面
```bash
# 按 Ctrl+R 或 Cmd+R 刷新浏览器
```

### 2. 打开控制台
```bash
# 按 F12 打开开发者工具
# 切换到 Console 标签
# 切换到 Network 标签
```

### 3. 点击"我要提问"
- 应该看到弹窗打开
- 控制台应该输出：`QNA_BASE URL: http://localhost:8081/api/qna`

### 4. 填写表单
```
资源类型：课程
资源ID：111
问题内容：测试新增问题（至少10个字）
问题类型：公开问题
```

### 5. 点击"立即发布"
控制台应该输出：
```
=== 创建问题接口 ===
URL: http://localhost:8081/api/qna/question/create
Headers: { Authorization: "Bearer xxx", token: "xxx", appid: "xxx" }
Body: {
  "content": "测试新增问题",
  "resourceType": "课程",
  "resourceNo": 111,
  "isPaidOnly": "0"
}
```

### 6. 查看Network标签
应该看到：
- 请求URL: `http://localhost:8081/api/qna/question/create`
- 请求方法: `POST`
- 请求头: 包含 `token`, `Authorization`, `appid`
- 请求体: JSON格式的数据
- 响应状态: `200` 或其他

## 🐛 常见问题排查

### 问题1: 没有发起请求
**可能原因：**
- 表单验证失败（内容少于10个字）
- JavaScript错误

**解决方法：**
1. 查看控制台是否有红色错误
2. 确保问题内容至少10个字
3. 刷新页面重试

### 问题2: 请求URL错误
**检查：**
```javascript
// 控制台应该输出
QNA_BASE URL: http://localhost:8081/api/qna

// 请求URL应该是
http://localhost:8081/api/qna/question/create
```

**如果不对：**
- 检查 `composables/useHttp.js` 中的 `baseURL`
- 应该是 `http://localhost:8081/pc`

### 问题3: 401 未授权
**可能原因：**
- 没有登录
- Token过期

**解决方法：**
1. 先登录系统
2. 检查 localStorage 中是否有 token
3. 查看请求头是否包含 token

### 问题4: 404 Not Found
**可能原因：**
- 后端接口路径不对
- 后端服务未启动

**解决方法：**
1. 确认后端服务在 `http://localhost:8081` 运行
2. 使用 Postman 测试接口：
   ```
   POST http://localhost:8081/api/qna/question/create
   Headers:
     Content-Type: application/json
     token: your_token
     appid: bd9d01ecc75dbbaaefce
   Body:
     {
       "content": "测试问题",
       "resourceType": "课程",
       "resourceNo": 1,
       "isPaidOnly": "0"
     }
   ```

### 问题5: 500 服务器错误
**可能原因：**
- 后端代码错误
- 数据库连接失败
- 参数格式不对

**解决方法：**
1. 查看后端日志
2. 检查请求参数格式
3. 确认数据库连接正常

## 📊 预期的请求和响应

### 创建问题请求
```http
POST http://localhost:8081/api/qna/question/create
Content-Type: application/json
Authorization: Bearer your_token
token: your_token
appid: bd9d01ecc75dbbaaefce

{
  "content": "测试新增问题",
  "resourceType": "课程",
  "resourceNo": 111,
  "isPaidOnly": "0"
}
```

### 创建问题响应（成功）
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": 123  // 问题ID
}
```

### 发布问题请求
```http
POST http://localhost:8081/api/qna/question/publish
Content-Type: application/json
Authorization: Bearer your_token
token: your_token
appid: bd9d01ecc75dbbaaefce

{
  "questionId": 123
}
```

### 发布问题响应（成功）
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": null
}
```

## 🎯 调试清单

- [ ] 刷新页面
- [ ] 打开控制台（Console + Network）
- [ ] 点击"我要提问"
- [ ] 查看 QNA_BASE URL 输出
- [ ] 填写表单（内容≥10字）
- [ ] 点击"立即发布"
- [ ] 查看控制台日志
- [ ] 查看Network请求
- [ ] 检查请求URL
- [ ] 检查请求头（token）
- [ ] 检查请求体
- [ ] 查看响应状态
- [ ] 查看响应数据

## 📞 如果还有问题

请提供以下信息：
1. 控制台的完整日志（截图）
2. Network标签的请求详情（截图）
3. 后端返回的错误信息
4. 后端日志（如果有）

---

**准备好了吗？现在刷新页面，按照步骤测试！** 🚀
