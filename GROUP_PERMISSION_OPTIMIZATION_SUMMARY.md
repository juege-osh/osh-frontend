# 拼团权限优化总结

## 🎯 优化目标

将拼团模块的权限控制从**权限标识**改为**用户等级（userLevel）**控制。

---

## 📋 权限规则变更

### 之前（旧版）
```javascript
// 基于权限标识
hasPermission('admin') || hasPermission('system:admin') || hasPermission('*')
```

### 现在（新版）
```javascript
// 基于用户等级
userLevel <= 2  // 用户等级小于等于2表示管理员权限
```

---

## 🔐 权限矩阵

| 功能 | 接口 | 后端权限 | 前端控制 | 显示条件 |
|------|------|---------|---------|---------|
| **发起拼团** | `POST /pc/group/work/create` | `userLevel <= 2` | `v-if="isAdmin"` | `userLevel <= 2` |
| **参与拼团** | `POST /pc/group/work/join` | 登录即可 | `useHasAuth()` | `isLoggedIn` |
| **我的拼团** | `GET /pc/group/activity/mylist` | 登录即可 | `middleware: 'auth'` | `isLoggedIn` |
| **手动添加用户** | `POST /pc/group/user/add` | `userLevel <= 2` | `v-if="isAdmin"` | `userLevel <= 2` |
| **拼团列表** | `GET /pc/group/activity/list` | 匿名可访问 | 无限制 | 所有人可见 |

---

## 🛠️ 主要改动

### 1. 新增权限判断函数

**文件**：`composables/useAuth.js`

```javascript
// 基于用户等级的管理员权限判断
export function useHasGroupAdminPermission() {
    const user = useUser()
    return computed(() => {
        if (!user.value) return false
        
        const userLevel = user.value?.userLevel ?? user.value?.level ?? 999
        
        // userLevel <= 2 表示有管理员权限
        return userLevel <= 2
    })
}

// 兼容旧版本
export function useIsAdmin() {
    return useHasGroupAdminPermission()
}
```

### 2. 页面权限控制

**拼团列表页**（`pages/group/index.vue`）
```vue
<!-- 发起拼团按钮 -->
<n-button v-if="isAdmin" type="primary" @click="openCreateModal">
    发起拼团
</n-button>

<!-- 手动添加按钮 -->
<n-button v-if="isAdmin && (item.status === 1 || item.status === 2)"
          type="default" size="large" @click.stop="openAddUserModal(item)">
    手动添加
</n-button>
```

**拼团详情页**（`pages/group/work/[id].vue`）
```vue
<!-- 手动添加用户按钮 -->
<n-button v-if="isAdmin && (data.status === 1 || data.status === 2)"
          type="primary" size="small" ghost @click="openAddUserModal">
    手动添加用户
</n-button>
```

---

## 👥 用户等级说明

| userLevel | 角色 | 权限 |
|-----------|------|------|
| 1 | 超级管理员 | ✅ 所有管理员权限 |
| 2 | 管理员 | ✅ 所有管理员权限 |
| 3+ | 普通用户 | ❌ 无管理员权限 |

---

## 🧪 测试场景

### 场景 1：普通用户（userLevel > 2）
- ❌ 看不到"发起拼团"按钮
- ❌ 看不到"手动添加"按钮
- ✅ 能看到"立即参团"按钮（需登录）
- ✅ 能查看拼团列表和详情

### 场景 2：管理员用户（userLevel <= 2）
- ✅ 能看到"发起拼团"按钮
- ✅ 能看到"手动添加"按钮（拼团进行中或已成功）
- ✅ 能执行所有操作

### 场景 3：未登录用户
- ❌ 点击"立即参团"→ 跳转登录页
- ❌ 访问"我的拼团"→ 跳转登录页
- ✅ 能查看拼团列表和详情

---

## 📝 后端需要实现

### 1. 返回用户等级

用户信息接口需要返回 `userLevel` 字段：

```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "userId": 12345,
    "username": "testuser",
    "userLevel": 1,
    "nickname": "测试用户"
  }
}
```

### 2. 接口权限验证

```java
// 管理员接口
@PostMapping("/group/work/create")
public R createGroupWork(...) {
    // 验证 userLevel <= 2
    if (currentUser.getUserLevel() > 2) {
        return R.error("需要管理员权限");
    }
    // ...
}

@PostMapping("/group/user/add")
public R addUserToGroup(...) {
    // 验证 userLevel <= 2
    if (currentUser.getUserLevel() > 2) {
        return R.error("需要管理员权限");
    }
    // ...
}

// 登录用户接口
@PostMapping("/group/work/join")
public R joinGroupWork(...) {
    // 验证已登录
    if (!isAuthenticated()) {
        return R.error("请先登录");
    }
    // ...
}
```

---

## ✅ 优化完成

- [x] 添加 `useHasGroupAdminPermission()` 函数
- [x] 更新拼团列表页权限控制
- [x] 更新拼团详情页权限控制
- [x] 更新权限管理文档
- [x] 保留 `useIsAdmin()` 兼容性

---

## 📚 相关文档

- 完整权限管理文档：[GROUP_PERMISSION_MANAGEMENT.md](./GROUP_PERMISSION_MANAGEMENT.md)

---

**优化版本**：v2.0  
**优化日期**：2026-05-05
