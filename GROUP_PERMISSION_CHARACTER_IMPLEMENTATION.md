# 拼团模块权限字符控制实现

## 📋 修改概述

将拼团模块的权限控制从 **userLevel（用户等级）** 改为 **权限字符（permission）** 控制。

---

## 🔐 权限字符定义

| 权限字符 | 说明 | 控制元素 |
|---------|------|---------|
| `group:work:create` | 发起拼团权限 | "发起拼团"按钮 |
| `group:user:add` | 手动添加用户权限 | "手动添加用户"按钮 |
| `group:*` | 拼团模块所有权限 | 超级管理员 |
| `*` 或 `*:*:*` | 系统所有权限 | 超级管理员 |

---

## 📝 修改文件清单

### 1. `pages/group/index.vue`（拼团列表页）

#### 修改内容：

**① 引入权限函数**
```javascript
// 修改前
import { useIsAdmin } from '~~/composables/useAuth'
const isAdmin = useIsAdmin()

// 修改后
import { usePermission } from '~~/composables/usePermission'
const { hasPermission } = usePermission()
```

**② 发起拼团按钮**
```vue
<!-- 修改前：所有登录用户可见 -->
<n-button type="primary" @click="openCreateModal">
    发起拼团
</n-button>

<!-- 修改后：需要 group:work:create 权限 -->
<n-button 
    v-if="hasPermission('group:work:create')"
    type="primary" 
    @click="openCreateModal"
>
    发起拼团
</n-button>
```

**③ 手动添加按钮**
```vue
<!-- 修改前：基于 userLevel -->
<n-button
    v-if="isAdmin && (item.status === 1 || item.status === 2)"
    type="default"
    size="large"
    @click.stop="openAddUserModal(item)"
>
    手动添加
</n-button>

<!-- 修改后：基于权限字符 -->
<n-button
    v-if="hasPermission('group:user:add') && (item.status === 1 || item.status === 2)"
    type="default"
    size="large"
    @click.stop="openAddUserModal(item)"
>
    手动添加
</n-button>
```

---

### 2. `pages/group/work/[id].vue`（拼团详情页）

#### 修改内容：

**① 引入权限函数**
```javascript
// 修改前
import { useIsAdmin } from '~~/composables/useAuth'
const isAdmin = useIsAdmin()

// 修改后
import { usePermission } from '~~/composables/usePermission'
const { hasPermission } = usePermission()
```

**② 手动添加用户按钮**
```vue
<!-- 修改前：所有登录用户可见 -->
<n-button
    v-if="data.status === 1 || data.status === 2"
    type="primary"
    size="small"
    ghost
    @click="openAddUserModal"
>
    手动添加用户
</n-button>

<!-- 修改后：需要 group:user:add 权限 -->
<n-button
    v-if="hasPermission('group:user:add') && (data.status === 1 || data.status === 2)"
    type="primary"
    size="small"
    ghost
    @click="openAddUserModal"
>
    手动添加用户
</n-button>
```

---

## 🎯 权限判断逻辑

### `usePermission()` 函数说明

位置：`composables/usePermission.js`

```javascript
export function usePermission() {
  const permissions = usePermissions();
  
  const permissionList = computed(() => normalizePermissions(permissions.value));

  function hasPermission(code) {
    if (!code) return true;  // 无权限码表示不需要权限
    const perms = permissionList.value;
    if (!perms.length) return false;  // 无权限列表表示无权限
    if (perms.includes('*') || perms.includes('*:*:*')) return true;  // 超级管理员
    return perms.includes(code);  // 检查具体权限
  }

  return { hasPermission, hasAnyPermission, permissionList };
}
```

### 权限来源

权限列表在**登录时**从后端返回，存储在：
- `useState('permissions')` - Vuex 状态
- `localStorage.__permissions__` - 本地存储（刷新不丢失）

---

## ✅ 前端权限控制效果

| 用户权限 | 发起拼团按钮 | 手动添加按钮 |
|---------|------------|------------|
| 有 `group:work:create` | ✅ 显示 | ❌ 无权限不显示 |
| 有 `group:user:add` | ❌ 无权限不显示 | ✅ 显示 |
| 同时有两个权限 | ✅ 显示 | ✅ 显示 |
| 有 `group:*` 或 `*` | ✅ 显示 | ✅ 显示 |
| 无任何权限 | ❌ 隐藏 | ❌ 隐藏 |

---

## 🔒 后端配合要求

### 1. 登录接口返回权限字符

```json
{
  "code": 200,
  "msg": "登录成功",
  "data": {
    "userId": 12345,
    "username": "admin",
    "token": "xxx",
    "permissionList": [
      "group:work:create",
      "group:user:add"
    ],
    "role": {
      "level": 1,
      "name": "超级管理员"
    }
  }
}
```

### 2. 接口权限验证

```java
// 发起拼团接口
@PostMapping("/pc/group/work/create")
public R createGroupWork(@RequestBody GroupWorkCreateDTO dto) {
    // 验证权限字符
    if (!hasPermission("group:work:create")) {
        return R.error("需要发起拼团权限");
    }
    // 业务逻辑
}

// 手动添加用户接口
@PostMapping("/pc/group/user/add")
public R addUserToGroup(@RequestBody GroupUserAddDTO dto) {
    // 验证权限字符
    if (!hasPermission("group:user:add")) {
        return R.error("需要手动添加用户权限");
    }
    // 业务逻辑
}
```

---

## 🧪 测试场景

### 场景 1：有 `group:work:create` 权限的用户
- [ ] 能看到"发起拼团"按钮
- [ ] 不能看到"手动添加"按钮（除非也有 `group:user:add`）
- [ ] 能正常发起拼团

### 场景 2：有 `group:user:add` 权限的用户
- [ ] 不能看到"发起拼团"按钮（除非也有 `group:work:create`）
- [ ] 能看到"手动添加"按钮（拼团进行中或已成功时）
- [ ] 能手动添加用户到拼团

### 场景 3：无任何权限的普通用户
- [ ] 看不到"发起拼团"按钮
- [ ] 看不到"手动添加"按钮
- [ ] 能查看拼团列表和详情
- [ ] 能参与拼团（登录即可）

### 场景 4：超级管理员（有 `*` 或 `group:*`）
- [ ] 能看到所有按钮
- [ ] 能执行所有操作

---

## 📊 优势对比

| 维度 | userLevel 方案 | 权限字符方案 |
|------|---------------|-------------|
| **灵活性** | ❌ 固定等级，难以细分 | ✅ 可自由组合权限 |
| **扩展性** | ❌ 新增功能需改等级逻辑 | ✅ 新增权限字符即可 |
| **细粒度** | ❌ 只能区分管理员/普通用户 | ✅ 可以细分到每个功能 |
| **语义清晰** | ❌ 等级含义需要查文档 | ✅ 权限字符一目了然 |
| **兼容性** | ✅ 现有代码已实现 | ✅ 已迁移完成 |

---

## 📌 注意事项

1. **前端权限只是用户体验优化**，后端必须进行真正的权限验证
2. 权限列表在登录时获取并持久化，刷新页面不会丢失
3. 如果权限变更，需要重新登录或调用 getinfo 接口更新权限
4. `hasPermission()` 函数已支持超级管理员通配符（`*` 或 `*:*:*`）

---

## 🔄 回滚方案

如需回滚到 userLevel 方案：

```javascript
// 恢复引入
import { useIsAdmin } from '~~/composables/useAuth'
const isAdmin = useIsAdmin()

// 恢复按钮条件
v-if="isAdmin"  // 替代 hasPermission('group:work:create')
v-if="isAdmin && (item.status === 1 || item.status === 2)"  // 替代 hasPermission('group:user:add')
```

---

**修改日期**：2026-05-24  
**修改人**：AI Assistant  
**测试状态**：待测试
