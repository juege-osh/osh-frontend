# 拼团模块快速参考

## 📍 路由地址

| 页面 | 路由 | 文件位置 | 需要登录 |
|------|------|----------|----------|
| 拼团活动列表 | `/group` | `pages/group/index.vue` | ❌ |
| 我的拼团 | `/group/my` | `pages/group/my.vue` | ✅ |
| 拼团详情 | `/group/work/:id` | `pages/group/work/[id].vue` | ❌ |

## 🔌 API 接口

### 拼团活动相关

```javascript
// 查询拼团活动列表
import { useGetGroupActivityListApi } from '~/composables/group'

const { data, error, pending, refresh } = await useGetGroupActivityListApi(
  { status: 1 },  // 筛选状态：1-进行中, 2-已成功, 3-已失败
  1               // 页码
)
// 请求: GET /pc/group/activity/list?status=1&page=1
```

```javascript
// 查询我的拼团列表
import { useGetMyGroupActivityListApi } from '~/composables/group'

const { data, error, pending } = await useGetMyGroupActivityListApi(
  { status: null },  // 筛选状态
  1                  // 页码
)
// 请求: GET /pc/group/activity/mylist?page=1
```

```javascript
// 获取拼团活动详情
import { useGetGroupActivityDetailApi } from '~/composables/group'

const { data, error } = await useGetGroupActivityDetailApi(activityId)
// 请求: GET /pc/group/activity/detail?id={activityId}
```

### 拼团结团相关

```javascript
// 获取组团详情
import { useGetGroupWorkDetailApi } from '~/composables/group'

const { data, error, pending } = await useGetGroupWorkDetailApi(groupWorkId)
// 请求: GET /pc/group/work/detail?group_work_id={groupWorkId}
```

```javascript
// 参与拼团
import { useJoinGroupWorkApi } from '~/composables/group'

const result = await useJoinGroupWorkApi({
  group_work_id: 123  // 组团ID
})
// 请求: POST /pc/group/work/join
// Body: { group_work_id: 123 }

if (!result.error.value) {
  // 参团成功
  const orderNo = result.data.value?.order_no  // 订单号（如果需要支付）
}
```

```javascript
// 发起拼团（创建组团）
import { useCreateGroupWorkApi } from '~/composables/group'

const result = await useCreateGroupWorkApi({
  activity_id: 456  // 活动ID
})
// 请求: POST /pc/group/work/create
// Body: { activity_id: 456 }
```

### 订单相关（旧接口兼容）

```javascript
// 获取可参与组团列表
import { useGetGroupWorkListApi } from '~/composables/order'

const { data, error } = await useGetGroupWorkListApi(groupId, page)
// 请求: GET /pc/group_work/list?group_id={groupId}&page={page}
```

## 🛠 辅助函数

### 状态文本

```javascript
import { 
  useGroupStatusText, 
  useGroupJoinStatusText 
} from '~/composables/group'

// 拼团活动状态
useGroupStatusText(1)  // '进行中'
useGroupStatusText(2)  // '已成功'
useGroupStatusText(3)  // '已失败'
useGroupStatusText(4)  // '未开始'

// 参团状态
useGroupJoinStatusText(0)  // '待成团'
useGroupJoinStatusText(1)  // '拼团中'
useGroupJoinStatusText(2)  // '已成功'
useGroupJoinStatusText(3)  // '已失败'
useGroupJoinStatusText(4)  // '已退款'
```

### 进度计算

```javascript
import { useGroupProgress } from '~/composables/group'

useGroupProgress(3, 5)  // 60 (已参团3人，需要5人)
useGroupProgress(5, 5)  // 100
```

### 手机号脱敏

```javascript
import { useDesensitizePhone } from '~/composables/group'

useDesensitizePhone('13812345678')  // '138****5678'
```

## 📦 组件使用

### Detail/Groupworks.vue

```vue
<template>
  <DetailGroupworks :group_id="activityId" />
</template>
```

**Props:**
- `group_id`: Number - 拼团活动ID

**功能:**
- 显示可参与的组团列表
- 进度条展示
- 倒计时
- 参团操作

## 🎨 UI 组件

### 状态标签颜色

```javascript
// 拼团活动状态
1 -> #18a058 (绿色) - 进行中
2 -> #2080f0 (蓝色) - 已成功
3 -> #d03050 (红色) - 已失败
4 -> #f0a020 (橙色) - 未开始

// 参团状态标签类型 (Naive UI)
0 -> 'default'
1 -> 'warning'
2 -> 'success'
3 -> 'error'
4 -> 'info'
```

### 进度条颜色

```javascript
// 进行中或已成功
:color="'#18a058'"

// 已失败或已结束
:color="'#d0d0d0'"
```

## 🔐 权限控制

### 页面级保护

```javascript
// 在页面中添加
definePageMeta({
  middleware: 'auth'
})
```

### 操作级保护

```javascript
import { useHasAuth } from '~/composables/useAuth'

// 需要登录才能执行的操作
function handleJoin() {
  useHasAuth(async () => {
    // 这里执行需要登录的操作
    const result = await useJoinGroupWorkApi({...})
  })
}
```

## 💡 常见场景

### 场景1: 创建拼团活动列表页

```vue
<template>
  <div>
    <n-radio-group v-model:value="filterStatus">
      <n-radio-button :value="null">全部</n-radio-button>
      <n-radio-button :value="1">进行中</n-radio-button>
    </n-radio-group>
    
    <div v-for="item in data.rows" :key="item.id">
      <h3>{{ item.title }}</h3>
      <Price :value="item.group_price" />
      <n-progress :percentage="useGroupProgress(item.joined_count, item.total)" />
      <n-button @click="handleJoin(item)">
        {{ item.can_join ? '立即参团' : '无法参团' }}
      </n-button>
    </div>
  </div>
</template>

<script setup>
const filterStatus = ref(null)
const { data, error, pending } = await useGetGroupActivityListApi(
  { status: filterStatus.value },
  1
)
</script>
```

### 场景2: 参团操作

```javascript
function handleJoin(item) {
  useHasAuth(async () => {
    const { message } = createDiscreteApi(["message"])
    
    if (!item.can_join) {
      return message.error('该拼团已满员或结束')
    }
    
    const result = await useJoinGroupWorkApi({
      group_work_id: item.id
    })
    
    if (!result.error.value) {
      message.success('参团成功！')
      
      // 如果需要支付
      if (result.data.value?.order_no) {
        navigateTo(`/pay?no=${result.data.value.order_no}`)
      } else {
        // 刷新列表
        refresh()
      }
    }
  })
}
```

### 场景3: 显示参团用户列表（带脱敏）

```vue
<template>
  <div v-for="user in data.users" :key="user.id">
    <n-avatar :src="user.avatar" />
    <span>{{ user.nickname }}</span>
    <span>{{ useDesensitizePhone(user.phone) }}</span>
  </div>
</template>
```

## 🐛 调试技巧

### 检查API响应

```javascript
const { data, error, pending } = await useGetGroupActivityListApi({}, 1)

console.log('数据:', data.value)
console.log('错误:', error.value)
console.log('加载中:', pending.value)
```

### 检查用户登录状态

```javascript
const user = useUser()
const token = useCookie("token")

console.log('用户信息:', user.value)
console.log('Token:', token.value)
```

### 强制刷新数据

```javascript
// 在组件中调用 refresh 函数
const { refresh } = await useGetGroupActivityListApi({}, 1)

// 稍后刷新
refresh()
```

## 📱 响应式断点

```css
/* 课程卡片网格 */
grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));

/* 参团用户网格 */
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
```

## ⚡ 性能优化建议

1. **列表分页加载**
   - 使用 `page` 参数分页
   - 避免一次性加载过多数据

2. **图片优化**
   - 使用 `UiImage` 组件
   - 添加懒加载

3. **API缓存**
   - 设置 `initialCache: true` 启用缓存
   - 手动调用 `refresh()` 刷新

## 📞 快速排错

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 页面空白 | API错误 | 检查控制台和Network |
| 按钮无反应 | 未登录 | 检查 useHasAuth |
| 数据不更新 | 缓存问题 | 调用 refresh() |
| 样式错乱 | CSS冲突 | 检查 scoped 样式 |

---

**最后更新**: 2026-04-28
