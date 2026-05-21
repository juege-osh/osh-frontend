# 拼团模块权限管理文档

## 📋 权限概览

本文档说明拼团模块各个功能的权限要求和前端实现方式。

**权限判断标准**：基于用户等级（`userLevel`）
- **管理员权限**：`userLevel <= 2`（用户等级小于等于2）
- **普通用户**：`userLevel > 2`
- **未登录用户**：无权限

---

## 🔐 权限控制列表

### 1. 发起拼团
- **接口**：`POST /pc/group/work/create`
- **后端权限**：`userLevel <= 2`
- **前端实现**：
  - 使用 `useIsAdmin()` 或 `useHasGroupAdminPermission()` 判断用户等级
  - 按钮添加 `v-if="isAdmin"` 条件渲染
  - 用户等级 > 2 的用户看不到该按钮

**代码位置**：`pages/group/index.vue`
```
<!-- 发起拼团按钮 - 需要 userLevel <= 2 -->
<n-button 
    v-if="isAdmin" 
    type="primary" 
    @click="openCreateModal"
>
    <template #icon><n-icon :component="AddOutline" /></template>
    发起拼团
</n-button>
```

---

### 2. 参与拼团
- **接口**：`POST /pc/group/work/join`
- **后端权限**：登录即可
- **前端实现**：
  - 使用 `useHasAuth()` 检查登录状态
  - 未登录自动跳转到登录页面
  - 所有登录用户都能看到“立即参团”按钮

**代码位置**：`pages/group/index.vue`
```
<n-button 
    type="primary" 
    size="large"
    :disabled="!item.can_join && !(item.status === 2 && item.joined_count < item.total)"
    @click.stop="handleJoinActivity(item)"
>
    {{ (item.can_join || (item.status === 2 && item.joined_count < item.total)) ? '立即参团' : '无法参团' }}
</n-button>
```

```javascript
function handleJoinActivity(item) {
    useHasAuth(async () => {
        // 参与拼团逻辑
    })
}
```

---

### 3. 查看我的拼团
- **接口**：`GET /pc/group/activity/mylist`
- **后端权限**：登录即可
- **前端实现**：
  - 使用路由中间件 `middleware: 'auth'`
  - 未登录用户自动跳转到登录页面

**代码位置**：`pages/group/my.vue`
```
definePageMeta({
    name: 'group-my',
    middleware: 'auth'  // 需要登录才能访问
})
```

---

### 4. 手动添加用户到拼团
- **接口**：`POST /pc/group/user/add`
- **后端权限**：`userLevel <= 2`
- **前端实现**：
  - 使用 `useIsAdmin()` 或 `useHasGroupAdminPermission()` 判断用户等级
  - 按钮添加 `v-if="isAdmin && (status === 1 || status === 2)"` 条件
  - 用户等级 > 2 的用户看不到该按钮
  - 只有拼团进行中或已成功时才能操作

**代码位置 1**：`pages/group/index.vue`（拼团列表页）
```
<!-- 手动添加按钮：需要 userLevel <= 2 + 进行中或已成功时显示 -->
<n-button
    v-if="isAdmin && (item.status === 1 || item.status === 2)"
    type="default"
    size="large"
    @click.stop="openAddUserModal(item)"
>
    <template #icon><n-icon :component="PersonAddOutline" /></template>
    手动添加
</n-button>
```

**代码位置 2**：`pages/group/work/[id].vue`（拼团详情页）
```
<!-- 手动添加用户按钮：需要 userLevel <= 2 + 进行中或已成功状态 -->
<n-button
    v-if="isAdmin && (data.status === 1 || data.status === 2)"
    type="primary"
    size="small"
    ghost
    @click="openAddUserModal"
>
    <template #icon><n-icon :component="PersonAddOutline" /></template>
    手动添加用户
</n-button>
```

---

### 5. 拼团列表（匿名）
- **接口**：`GET /pc/group/activity/list`
- **后端权限**：匿名可访问
- **前端实现**：无限制，所有人可见

**代码位置**：`pages/group/index.vue`
```
<!-- 无需权限控制，所有人可见 -->
<n-card v-for="item in activities" :key="item.id">
    <!-- 拼团卡片内容 -->
</n-card>
```

---

## ️ 权限工具函数

### useHasGroupAdminPermission() - 基于用户等级的管理员权限判断

**位置**：`composables/useAuth.js`

**功能**：检查当前用户是否具有管理员权限（基于 userLevel）

**权限规则**：
- `userLevel <= 2`：具有管理员权限
- `userLevel > 2`：普通用户，无管理员权限
- 未登录：无权限

**使用方式**：
```
import { useHasGroupAdminPermission } from '~~/composables/useAuth'

const isAdmin = useHasGroupAdminPermission()

// 在模板中使用
// <n-button v-if="isAdmin">管理员操作</n-button>
```

**实现代码**：
```
export function useHasGroupAdminPermission() {
    const user = useUser()
    return computed(() => {
        // 未登录用户没有权限
        if (!user.value) return false
        
        // 获取用户等级，默认为最高等级（无权限）
        const userLevel = user.value?.userLevel ?? user.value?.level ?? 999
        
        // userLevel <= 2 表示有管理员权限
        return userLevel <= 2
    })
}
```

---

### useIsAdmin() - 兼容旧版本

**位置**：`composables/useAuth.js`

**功能**：兼容旧代码，内部调用 `useHasGroupAdminPermission()`

**使用方式**：
```
import { useIsAdmin } from '~~/composables/useAuth'

const isAdmin = useIsAdmin()  // 与 useHasGroupAdminPermission() 等效
```

---

### useHasAuth() - 登录状态检查

**位置**：`composables/useAuth.js`

**功能**：检查用户是否已登录，未登录自动跳转

**使用方式**：
```
import { useHasAuth } from '~~/composables/useAuth'

function handleClick() {
    useHasAuth(() => {
        // 需要登录才能执行的操作
    })
}
```

**行为**：
- ✅ 已登录：执行回调函数
- ❌ 未登录：显示错误提示并跳转到登录页

---

### usePermission() - 通用权限判断

**位置**：`composables/usePermission.js`

**功能**：检查用户是否具有指定权限代码

**使用方式**：
```
import { usePermission } from '~~/composables/usePermission'

const { hasPermission, hasAnyPermission } = usePermission()

// 检查单个权限
if (hasPermission('group:create')) {
    // 有创建拼团的权限
}

// 检查多个权限（满足任一即可）
if (hasAnyPermission('group:create', 'group:manage')) {
    // 有创建或管理拼团的权限
}
```

---

## 📊 权限矩阵

| 功能 | 接口 | 后端权限 | 前端控制 | 显示条件 | 后端保护 |
|------|------|---------|---------|---------|---------|
| 发起拼团 | `POST /pc/group/work/create` | `userLevel <= 2` | `v-if="isAdmin"` | `userLevel <= 2` | ✅ 需要 |
| 参与拼团 | `POST /pc/group/work/join` | 登录即可 | `useHasAuth()` | `isLoggedIn` | ✅ 需要 |
| 查看我的拼团 | `GET /pc/group/activity/mylist` | 登录即可 | `middleware: 'auth'` | `isLoggedIn` | ✅ 需要 |
| 手动添加用户 | `POST /pc/group/user/add` | `userLevel <= 2` | `v-if="isAdmin"` | `userLevel <= 2` | ✅ 需要 |
| 拼团列表 | `GET /pc/group/activity/list` | 匿名可访问 | 无限制 | 所有人可见 |  不需要 |
| 拼团详情 | `GET /pc/group/work/detail` | 匿名可访问 | 无限制 | 所有人可见 | ❌ 不需要 |

---

## 🔒 安全建议

### 前端防护
1. **按钮级别控制**：使用 `v-if="isAdmin"` 隐藏非管理员按钮
2. **操作前校验**：使用 `useHasAuth()` 在操作前检查登录状态
3. **路由级别保护**：使用 `middleware: 'auth'` 保护需要登录的页面

### 后端防护（重要）
⚠️ **前端权限控制只是用户体验优化，后端必须进行真正的权限验证！**

1. **接口级别验证**：
   ```java
   // 管理员接口
   @PreAuthorize("hasAuthority('admin')")
   @PostMapping("/group/work/create")
   public R createGroupWork(...) { }
   
   // 登录用户接口
   @PreAuthorize("isAuthenticated()")
   @PostMapping("/group/work/join")
   public R joinGroupWork(...) { }
   ```

2. **数据级别验证**：
   - 检查用户是否有权限操作该拼团活动
   - 防止越权访问（水平权限漏洞）

3. **审计日志**：
   - 记录管理员操作日志
   - 记录敏感操作（如手动添加用户）

---

## 🧪 测试场景

### 场景 1：普通用户（userLevel > 2）
- [ ] 看不到"发起拼团"按钮
- [ ] 看不到"手动添加"按钮
- [ ] 能看到"立即参团"按钮（需要登录）
- [ ] 访问"我的拼团"需要登录
- [ ] 可以查看拼团列表和详情

### 场景 2：管理员用户（userLevel <= 2）
- [ ] 能看到"发起拼团"按钮
- [ ] 能看到"手动添加"按钮（拼团进行中或已成功）
- [ ] 能正常发起拼团
- [ ] 能手动添加用户到拼团
- [ ] 能执行所有普通用户操作

### 场景 3：未登录用户
- [ ] 点击"立即参团"跳转到登录页
- [ ] 访问"我的拼团"跳转到登录页
- [ ] 可以查看拼团列表和详情
- [ ] 看不到任何管理员按钮

---

## 📝 实施清单

### 已完成 ✅
- [x] 添加 `useHasGroupAdminPermission()` 基于用户等级的权限判断函数
- [x] 保留 `useIsAdmin()` 作为兼容旧版本的别名
- [x] 拼团列表页：发起拼团按钮添加 userLevel 权限控制
- [x] 拼团列表页：手动添加按钮添加 userLevel 权限控制
- [x] 拼团详情页：手动添加按钮添加 userLevel 权限控制
- [x] 参与拼团功能使用 `useHasAuth()` 检查登录
- [x] "我的拼团"页面使用 `middleware: 'auth'` 保护
- [x] 拼团列表页面所有人可见（无需登录）

### 待后端实现 ⏳
- [ ] 后端接口添加 userLevel 验证逻辑
- [ ] 后端返回用户等级数据（userLevel 字段）
- [ ] 后端记录管理员操作日志

---

## 🔧 配置说明

### 用户等级字段

后端返回的用户数据中需要包含 `userLevel` 字段：

```
// 用户信息示例
{
  "userId": 12345,
  "username": "testuser",
  "userLevel": 1,  // 用户等级：1-超级管理员, 2-管理员, 3-普通用户, ...
  "nickname": "测试用户",
  "avatar": "https://..."
}
```

**等级说明**：
- `userLevel = 1`：超级管理员（最高权限）
- `userLevel = 2`：管理员
- `userLevel >= 3`：普通用户（无管理员权限）

### 前端用户数据存储

用户信息存储在 `useUser()` 中：

```
const user = useUser()
console.log(user.value?.userLevel)  // 获取用户等级
```

---

## 🚀 后续优化建议

1. **权限动态配置**：从后端获取权限配置，避免硬编码等级阈值
2. **角色系统**：支持多角色（普通用户、团长、管理员等）
3. **权限缓存优化**：优化权限缓存策略，减少重复计算
4. **权限变更监听**：监听权限变化，实时更新 UI
5. **细粒度权限**：支持按钮级别的细粒度权限控制
6. **等级显示**：在用户界面显示当前用户等级

---

**文档版本**：v2.0（基于 userLevel 权限模型）  
**最后更新**：2026-05-05  
**维护人员**：前端开发团队
