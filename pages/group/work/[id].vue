<template>
    <div class="group-work-detail">
        <LoadingGroup :pending="pending" :error="error">
            <div v-if="data" class="detail-container">
                <!-- 拼团活动信息 -->
                <n-card class="activity-card">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h2 class="text-xl font-bold">{{ data.activity?.title }}</h2>
                            <n-tag :type="getStatusType(data.status)" size="large">
                                {{ useGroupJoinStatusText(data.status) }}
                            </n-tag>
                        </div>
                    </template>

                    <div class="activity-content">
                        <div class="activity-meta">
                            <div class="meta-item">
                                <span class="meta-label">现价</span>
                                <Price :value="data.price" class="text-2xl text-rose-500 font-bold"/>
                            </div>
                            
                            <div class="meta-item">
                                <span class="meta-label">原价</span>
                                <Price :value="data.original_price" through class="text-base"/>
                            </div>
                            
                            <div v-if="data.memberPrice !== undefined && data.memberPrice !== null" class="meta-item member-price">
                                <span class="meta-label">会员价</span>
                                <span class="text-2xl text-orange-500 font-bold">￥{{ data.memberPrice }}</span>
                            </div>
                            
                            <div class="meta-item">
                                <span class="meta-label">拼团最低人数</span>
                                <span class="text-lg font-semibold">{{ data.groupMinNum || data.total }}人</span>
                            </div>
                            
                            <div class="meta-item">
                                <span class="meta-label">拼团人数上限</span>
                                <span class="text-lg font-semibold">{{ data.total }}人</span>
                            </div>
                            
                            <div class="meta-item">
                                <span class="meta-label">当前参团人数</span>
                                <span class="text-lg font-semibold">{{ data.current_num }}人</span>
                            </div>
                        </div>

                        <!-- 拼团进度 -->
                        <div class="progress-section">
                            <div class="progress-header">
                                <span class="progress-label">拼团进度</span>
                                <span class="progress-text">{{ data.current_num }}/{{ data.total }}</span>
                            </div>
                            <n-progress 
                                type="line" 
                                :percentage="useGroupProgress(data.current_num, data.total)"
                                :show-indicator="false"
                                :height="12"
                                :color="data.status === 1 || data.status === 2 ? '#18a058' : '#d0d0d0'"
                            />
                        </div>

                        <!-- 时间信息 -->
                        <div class="time-info">
                            <div class="time-row">
                                <span class="time-label">创建时间：</span>
                                <span class="time-value">{{ formatTime(data.created_time) }}</span>
                            </div>
                            <div class="time-row">
                                <span class="time-label">服务器结束时间：</span>
                                <span class="time-value">{{ formatTime(data.serverExpireTime) }}</span>
                            </div>
                            <div v-if="data.serverExpireTime" class="time-row">
                                <span class="time-label">剩余时间：</span>
                                <span class="time-value remaining-time">{{ data.remainingDays || '-' }}天</span>
                            </div>
                        </div>
                    </div>
                </n-card>

                <!-- 服务器拼团详细介绍 -->
                <n-card class="server-intro-card">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <n-icon :component="ServerOutline" size="24" color="#18a058"/>
                            <h3 class="text-lg font-bold">服务器拼团详细介绍</h3>
                        </div>
                    </template>

                    <!-- 拼团服务内容说明 -->
                    <div class="intro-section">
                        <h4 class="section-title">
                            <n-icon :component="DocumentTextOutline" size="18" />
                            拼团服务内容
                        </h4>
                        <div class="section-content" v-html="serverIntro.serviceDescription"></div>
                    </div>

                    <!-- 服务器功能特性 -->
                    <div class="intro-section">
                        <h4 class="section-title">
                            <n-icon :component="ListOutline" size="18" />
                            服务器功能特性
                        </h4>
                        <div class="feature-grid">
                            <div 
                                v-for="(feature, index) in serverIntro.featureList" 
                                :key="index"
                                class="feature-item"
                            >
                                <div class="feature-icon-wrapper">
                                    <n-icon :component="getFeatureIcon(index)" size="20" class="feature-icon" />
                                </div>
                                <div class="feature-content">
                                    <span class="feature-text">{{ feature }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 配置指南 -->
                    <div class="intro-section">
                        <h4 class="section-title">
                            <n-icon :component="SettingsOutline" size="18" />
                            配置指南
                        </h4>
                        <n-steps vertical>
                            <n-step 
                                v-for="(step, index) in serverIntro.configurationGuide" 
                                :key="index"
                                :title="step.title"
                                :description="step.description"
                                :status="index === 0 ? 'process' : 'wait'"
                            />
                        </n-steps>
                    </div>
                </n-card>

                <!-- 参团用户列表 -->
                <n-card class="users-card">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-bold">参团用户 ({{ data.users?.length || 0 }}/{{ data.total }})</h3>
                            <!-- 手动添加用户按钮：需要 group:user:add 权限 -->
                            <n-button
                                v-if="hasPermission('group:user:add') && (data.status === 1 || data.status === 2)"
                                type="primary"
                                size="small"
                                ghost
                                @click="openAddUserModal"
                            >
                                <template #icon><n-icon :component="PersonAddOutline" /></template>
                                手动添加用户
                            </n-button>
                        </div>
                    </template>
                    
                    <div v-if="data.users && data.users.length > 0" class="users-grid">
                        <div 
                            v-for="(user, index) in data.users" 
                            :key="index"
                            class="user-item"
                        >
                            <n-avatar 
                                :size="60" 
                                :src="user.avatar || defaultAvatar"
                                round
                            >
                                {{ user.nickname?.charAt(0) || '用' }}
                            </n-avatar>
                            <div class="user-info">
                                <p class="user-nickname">{{ user.nickname || user.username || '匿名用户' }}</p>
                                <p class="user-phone">{{ useDesensitizePhone(user.phone) }}</p>
                                <p class="user-join-time">{{ formatTime(user.join_time) }}</p>
                            </div>
                        </div>
                    </div>
                    <Empty v-else desc="暂无参团用户" />
                </n-card>

                <!-- 手动添加用户弹窗 -->
                <n-modal
                    v-model:show="showAddUserModal"
                    preset="card"
                    title="手动添加参团用户"
                    style="width: 480px; max-width: 95vw"
                    :mask-closable="false"
                >
                    <div class="add-user-form">
                        <div class="form-item">
                            <label class="form-label">用户名 <span class="required">*</span></label>
                            <div style="position: relative;">
                                <n-input
                                    v-model:value="addUserForm.keyword"
                                    placeholder="请输入用户名进行搜索"
                                    clearable
                                    @input="handleUserInput"
                                    :disabled="addUserForm.selectedUserId !== null"
                                />
                                <!-- 下拉选项列表 -->
                                <div v-if="userSearchOptions.length > 0" class="search-dropdown">
                                    <div
                                        v-for="option in userSearchOptions"
                                        :key="option.userId"
                                        class="dropdown-item"
                                        @click="selectUser(option)"
                                    >
                                        {{ option.label }}
                                    </div>
                                </div>
                                <!-- 加载中提示 -->
                                <div v-if="userSearchLoading" class="search-loading">
                                    搜索中...
                                </div>
                            </div>
                            <div v-if="addUserForm.selectedUserId" class="selected-user-hint">
                                <n-icon :component="CheckmarkCircleOutline" size="16" color="#18a058" />
                                <span>已选择用户</span>
                            </div>
                        </div>
                        <div class="form-item">
                            <label class="form-label">备注（可选）</label>
                            <n-input
                                v-model:value="addUserForm.remark"
                                type="textarea"
                                placeholder="如：线下已付款，由管理员手动录入"
                                :rows="3"
                            />
                        </div>
                        <n-alert type="info" :show-icon="true" style="margin-top: 0.5rem">
                            手动添加操作记录将被保存，请确认用户信息无误后再提交。
                        </n-alert>
                    </div>
                    <template #footer>
                        <div class="modal-footer">
                            <n-button @click="showAddUserModal = false">取消</n-button>
                            <n-button
                                type="primary"
                                :loading="addUserLoading"
                                @click="handleAddUser"
                            >
                                确认添加
                            </n-button>
                        </div>
                    </template>
                </n-modal>

                <!-- 拼团成功 - 服务器详情（仅已参团用户可见） -->
                <n-card v-if="isCurrentUserJoined && data.status === 2 && data.server_info" class="server-card">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <n-icon :component="CheckmarkCircle" size="24" color="#18a058"/>
                            <h3 class="text-lg font-bold">拼团成功 - 服务器信息</h3>
                        </div>
                    </template>
                    
                    <n-alert type="success" :show-icon="false">
                        <div class="server-details">
                            <div class="detail-row">
                                <span class="detail-label">服务器名称：</span>
                                <span class="detail-value">{{ data.server_info.name || '-' }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">服务器IP：</span>
                                <span class="detail-value copyable" @click="copyToClipboard(data.server_info.ip)">
                                    {{ data.server_info.ip || '-' }}
                                    <n-icon :component="CopyOutline" size="16"/>
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">端口：</span>
                                <span class="detail-value">{{ data.server_info.port || '-' }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">用户名：</span>
                                <span class="detail-value">{{ data.server_info.username || '-' }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">密码：</span>
                                <span class="detail-value">
                                    {{ showPassword ? data.server_info.password : '********' }}
                                    <n-button text size="small" @click="showPassword = !showPassword">
                                        {{ showPassword ? '隐藏' : '显示' }}
                                    </n-button>
                                    <n-button text size="small" @click="copyToClipboard(data.server_info.password)">
                                        <n-icon :component="CopyOutline" size="16"/>
                                    </n-button>
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">配置信息：</span>
                                <span class="detail-value">{{ data.server_info.config || '-' }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">服务器开始时间：</span>
                                <span class="detail-value">{{ formatTime(data.serverStartTime) }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">服务器结束时间：</span>
                                <span class="detail-value">{{ formatTime(data.serverExpireTime) }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">剩余使用时间：</span>
                                <span class="detail-value remaining-time">{{ data.remainingMonths ? Math.ceil(data.remainingMonths) + '个月' : '-' }}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">有效期至：</span>
                                <span class="detail-value">{{ formatTime(data.server_info.expire_time) }}</span>
                            </div>
                            <div v-if="data.server_info.remark" class="detail-row">
                                <span class="detail-label">备注：</span>
                                <span class="detail-value">{{ data.server_info.remark }}</span>
                            </div>
                        </div>
                    </n-alert>
                </n-card>

                <!-- 操作按钮 -->
                <div class="action-bar">
                    <!-- 拼团状态标识：已成团（仅已参团用户可见） -->
                    <n-tag
                        v-if="isCurrentUserJoined && data.status === 2"
                        type="success"
                        size="large"
                        :bordered="false"
                        class="status-tag"
                    >
                        ✓ 拼团已成功
                    </n-tag>

                    <!-- 参团按鈕：以后端 canJoin 为准，如已成功且未达上限也可参团 -->
                    <n-button
                        v-if="(data.can_join || (data.status === 2 && data.current_num < data.total)) && !isCurrentUserJoined"
                        type="primary"
                        size="large"
                        :loading="joinLoading"
                        @click="handleJoin"
                    >
                        立即参团
                    </n-button>

                    <!-- 服务器配置教程：
                        1. 拼团成功(status===2) 且当前用户已参团
                        2. 或者：人数已满 且当前用户已参团（支付成功后后端可能还未更新 status）
                    -->
                    <n-button
                        v-if="isCurrentUserJoined"
                        type="primary"
                        size="large"
                        @click="navigateTo(`/group/server/${groupWorkId}`)"
                    >
                        服务器配置教程
                    </n-button>

                    <!-- 拼团结束 -->
                    <n-button
                        v-if="data.status === 3"
                        type="default"
                        size="large"
                        disabled
                    >
                        拼团已结束
                    </n-button>
                </div>
            </div>
        </LoadingGroup>
    </div>
</template>

<script setup>
import {
    NCard,
    NTag,
    NProgress,
    NAvatar,
    NAlert,
    NButton,
    NIcon,
    NModal,
    NInput,
    NAutoComplete,
    NSteps,
    NStep,
    createDiscreteApi
} from "naive-ui"
import { 
    CheckmarkCircle, 
    CopyOutline, 
    PersonAddOutline,
    ServerOutline,
    DocumentTextOutline,
    ListOutline,
    SettingsOutline,
    CheckmarkCircleOutline,
    DesktopOutline,
    FlashOutline,
    CloudOutline
} from '@vicons/ionicons5'
import { usePermission } from '~~/composables/usePermission'

const route = useRoute()
const groupWorkId = route.params.id

// 权限检查
const { hasPermission } = usePermission()

const defaultAvatar = 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
const showPassword = ref(false)
const joinLoading = ref(false)

definePageMeta({
    name: 'group-work-id'
})

useHead({ title: '拼团详情' })

// 优化:添加错误处理
let rawData, error, pending, refresh
try {
    const result = await useGetGroupWorkDetailApi(groupWorkId)
    rawData = result.data
    error = result.error
    pending = result.pending
    refresh = result.refresh
    
    // 调试:检查错误
    if (process.client && error.value) {
        console.error('API请求错误:', error.value)
        console.error('错误详情:', error.value?.message || error.value)
    }
} catch (err) {
    console.error('加载拼团详情失败:', err)
    // 将Error对象转换为字符串,避免类型警告
    error = ref(err?.message || err?.toString() || '加载失败')
    pending = ref(false)
    rawData = ref(null)
}

// 页面激活时自动刷新（从支付页面返回时）
onActivated(async () => {
    if (process.client && refresh) {
        console.log('[拼团详情页] 页面激活，检查是否需要刷新')
        
        // 检查是否有refresh参数（支付成功后返回）
        if (route.query.refresh === 'true') {
            console.log('[拼团详情页] 检测到refresh参数，刷新数据并显示成功提示')
            
            // 刷新数据
            await refresh()
            
            // 显示支付成功提示
            const { message } = createDiscreteApi(["message"])
            message.success('支付成功，您已参与拼团！')
            
            // 清除URL中的refresh参数，避免重复提示
            navigateTo(`/group/work/${groupWorkId}`, { replace: true })
        } else {
            // 普通激活（如从其他页面返回），也刷新数据
            await refresh()
        }
    }
})

// 适配后端数据结构
const data = computed(() => {
    if (!rawData.value) return null
    
    // 调试:打印原始数据
    if (process.client) {
        console.log('=== 拼团详情页数据调试 ===')
        console.log('rawData.value:', rawData.value)
    }
    
    // 如果后端返回的数据在 activity 字段中
    const activity = rawData.value.activity || rawData.value
    
    if (process.client) {
        console.log('activity对象:', activity)
        console.log('serverStartTime:', activity.serverStartTime)
        console.log('serverExpireTime:', activity.serverExpireTime)
    }
    
    return {
        ...activity,
        // 字段映射
        price: activity.currentPrice || activity.price,
        original_price: activity.basePrice || activity.original_price,
        memberPrice: activity.memberPrice, // 会员优惠价
        total: activity.groupMaxNum || activity.total,
        groupMinNum: activity.groupMinNum, // 拼团最低人数
        current_num: activity.currentNum || activity.current_num,
        // 时间字段映射
        created_time: activity.serverStartTime || activity.startTime || activity.created_time,
        end_time: activity.serverEndTime || activity.endTime || activity.end_time, // 注意：后端字段为 serverEndTime
        can_join: activity.canJoin !== undefined ? activity.canJoin : activity.can_join,
        // 服务器使用时间
        serverStartTime: activity.serverStartTime,
        serverExpireTime: activity.serverEndTime, // 映射后端 serverEndTime 字段
        // 剩余时间（后端已返回）
        remainingMonths: activity.remainingMonths,
        remainingDays: activity.remainingDays || activity.remaining_days // 剩余天数
    }
})

// ── 服务器详细介绍数据 ─────────────────────────────────────────────
const serverIntro = ref({
    // 默认值：拼团服务内容
    serviceDescription: '<p>这是拼团服务内容的测试内容</p>',
    // 默认值：服务器功能特性
    featureList: [
        '4核 CPU处理器',
        '8GB 内存配置',
        '100GB SSD高速存储'
    ],
    // 默认值：配置指南
    configurationGuide: [
        {
            title: '测试步骤1',
            description: '这是测试步骤1的说明内容'
        },
        {
            title: '测试步骤2',
            description: '这是测试步骤2的说明内容'
        },
        {
            title: '测试步骤3',
            description: '这是测试步骤3的说明内容'
        }
    ]
})

// 根据索引返回对应的图标
function getFeatureIcon(index) {
    const icons = [
        DesktopOutline,          // 0: CPU (使用桌面图标代表计算)
        FlashOutline,            // 1: 内存 (使用闪电图标代表速度)
        CloudOutline             // 2: 存储 (使用云图标代表存储)
    ]
    return icons[index] || CheckmarkCircleOutline
}

// 加载服务器教程详情 - 暂时禁用此接口调用，使用默认值
// TODO: 待后端实现服务器教程接口后重新启用
// let tutorialRaw, tutorialError
// try {
//     const tutorialResult = await useGetServerTutorialApi(groupWorkId)
//     tutorialRaw = tutorialResult.data
//     tutorialError = tutorialResult.error
//     
//     // 处理教程数据
//     if (tutorialRaw.value) {
//         serverIntro.value = {
//             serviceDescription: tutorialRaw.value.serviceDescription || '',
//             featureList: tutorialRaw.value.featureList || [],
//             configurationGuide: tutorialRaw.value.configurationGuide || []
//         }
//     }
// } catch (err) {
//     console.warn('加载服务器教程失败:', err)
//     tutorialError = ref(err)
// }

// 获取当前登录用户
const currentUser = useUser()

// 判断当前用户是否参团成功
// 拼团成功(status===2) 且 当前用户在参团用户列表中
// 或者：人数已满（current_num >= total）且当前用户已参团
const isCurrentUserJoined = computed(() => {
    if (!data.value) return false
    
    const status = data.value.status
    const currentNum = data.value.current_num || 0
    const total = data.value.total || 0
    
    // 如果拼团还未满员，必须是 status === 2 才认为是成功
    // 如果已满员（current_num >= total），即使 status 不是 2，也认为是成功
    const isSuccess = status === 2 || (currentNum >= total && currentNum > 0)
    
    if (!isSuccess) {
        console.log('[isCurrentUserJoined] 拼团未成功 - status:', status, 'currentNum:', currentNum, 'total:', total)
        return false
    }
    
    if (!currentUser.value) {
        console.log('[isCurrentUserJoined] 当前用户未登录')
        return false
    }

    const users = data.value.users
    if (!users || users.length === 0) {
        console.log('[isCurrentUserJoined] users 列表为空')
        return false
    }

    const uid = currentUser.value.userId || currentUser.value.id
    const username = currentUser.value.username
    const nickname = currentUser.value.nickname
    
    // 调试：打印当前用户信息
    if (process.client) {
        console.log('=== 当前用户参团状态检查 ===')
        console.log('拼团状态:', { status, currentNum, total, isSuccess })
        console.log('currentUser:', currentUser.value)
        console.log('uid:', uid)
        console.log('username:', username)
        console.log('nickname:', nickname)
        console.log('users 列表:', users)
        console.log('参团用户IDs:', users.map(u => u.userId || u.id))
        console.log('参团用户用户名:', users.map(u => u.username))
    }
    
    // 严格匹配：只匹配 ID 或 username（移除宽松的 nickname 交叉匹配）
    const isJoined = users.some(u => {
        const userId = u.userId || u.id
        const userName = u.username
        
        // 匹配用户 ID
        const matchById = uid && userId && String(uid) === String(userId)
        
        // 匹配用户名（完全匹配，不区分大小写）
        const matchByUsername = username && userName && 
            username.toLowerCase() === userName.toLowerCase()
        
        const match = matchById || matchByUsername
        
        if (process.client && match) {
            console.log('✅ 匹配成功:', {
                '匹配方式': matchById ? 'ID匹配' : '用户名匹配',
                '参团用户': u,
                '当前用户ID': uid,
                '当前用户名': username
            })
        }
        
        return match
    })
    
    if (process.client) {
        console.log('isCurrentUserJoined:', isJoined)
    }
    
    return isJoined
})

// 获取状态类型
function getStatusType(status) {
    const typeMap = {
        0: 'default',
        1: 'warning',
        2: 'success',
        3: 'error',
        4: 'info'
    }
    return typeMap[status] || 'default'
}

// 格式化时间 - 优化:增加时间格式化处理
function formatTime(time) {
    if (!time) return ''
    const date = new Date(time)
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 参与拼团
function handleJoin() {
    useHasAuth(async () => {
        const { message } = createDiscreteApi(["message"])
        
        // 1. 校验拼团状态
        const canJoin = data.value?.can_join || (data.value?.status === 2 && data.value?.current_num < data.value?.total)
        if (!canJoin) {
            return message.error('该拼团已满员或结束')
        }
        
        // 2. 检查是否已参团
        if (isCurrentUserJoined.value) {
            return message.warning('您已参与此拼团')
        }
        
        // 3. 显示loading状态
        joinLoading.value = true
        
        try {
            const result = await useJoinGroupWorkApi({
                activityId: groupWorkId,
                payMethod: 'wechat'  // 默认微信支付
            })
            
            // 调试：打印完整的响应数据
            if (process.client) {
                console.log('=== 参团接口响应调试 ===')
                console.log('result:', result)
                console.log('result.data.value:', result.data.value)
                console.log('result.error.value:', result.error.value)
            }
            
            // 检查是否有网络错误
            if (result.error.value) {
                const errorMsg = result.error.value?.data?.msg || result.error.value?.message || '参团失败'
                message.error(errorMsg)
                joinLoading.value = false
                return
            }
            
            // 检查后端返回的 code 字段
            const responseCode = result.data.value?.code
            const responseMsg = result.data.value?.msg
            const responseData = result.data.value?.data
            
            // code: 200 表示成功，其他值表示错误
            if (responseCode === 200 || responseCode === undefined) {
                // 成功情况
                
                // 提取订单号和needPay标识
                // 支持多种数据结构：data.order_no, data.orderNo, data.data.order_no 等
                const orderNo = responseData?.orderNo || responseData?.order_no || 
                               result.data.value?.orderNo || result.data.value?.order_no
                
                const needPay = responseData?.needPay !== false  // 默认为需要支付
                const price = responseData?.price || data.value?.memberPrice || 0
                
                if (process.client) {
                    console.log('最终使用的 orderNo:', orderNo)
                    console.log('是否需要支付:', needPay)
                    console.log('价格:', price)
                }
                
                // 判断是否需要支付
                if (needPay && orderNo) {
                    // 需要支付 → 跳转到支付页面
                    message.info('请完成支付以确认参团')
                    
                    // 延迟跳转，让用户看到提示
                    setTimeout(() => {
                        navigateTo(`/pay?no=${orderNo}&name=${encodeURIComponent(data.value?.activity?.title || '拼团支付')}&price=${price}&type=group&activityId=${route.params.id}`)
                    }, 800)
                } else {
                    // 无需支付（免费活动或已支付）
                    message.success('参团成功！')
                    // 刷新详情
                    if (refresh) refresh()
                }
            } else {
                // 错误情况 - 根据后端返回的 msg 显示具体错误信息
                if (responseMsg) {
                    message.error(responseMsg)
                } else {
                    message.error('参团失败，请重试')
                }
            }
        } catch (err) {
            console.error('参团操作失败:', err)
            
            // 网络异常处理
            if (err?.message?.includes('Network Error') || err?.message?.includes('Failed to fetch')) {
                message.error('网络异常，请检查网络连接后重试')
            } else {
                message.error('参团失败，请重试')
            }
        } finally {
            joinLoading.value = false
        }
    })
}

// 手动添加用户弹窗逻辑
const showAddUserModal = ref(false)
const addUserLoading = ref(false)
const addUserForm = ref({ keyword: '', remark: '', selectedUserId: null })

// 用户搜索相关
const userSearchLoading = ref(false)
const userSearchOptions = ref([])
let searchTimer = null

// 处理用户输入（带防抖）
async function handleUserInput(value) {
    console.log('[用户输入] value:', value)
    
    // 如果用户手动修改，重置选中状态
    if (addUserForm.value.selectedUserId) {
        console.log('[用户输入] 重置选中状态')
        addUserForm.value.selectedUserId = null
    }
    
    if (!value || value.trim().length === 0) {
        console.log('[用户输入] 值为空，清空选项')
        userSearchOptions.value = []
        return
    }

    // 防抖处理
    if (searchTimer) clearTimeout(searchTimer)
    
    searchTimer = setTimeout(async () => {
        console.log('[搜索用户] 开始搜索:', value.trim())
        userSearchLoading.value = true
        try {
            const { data, error } = await useSearchUsersApi(value.trim(), 10)
            console.log('[搜索用户] API响应 - data:', data.value, 'error:', error.value)
            
            if (!error.value && data.value && Array.isArray(data.value)) {
                // 将API返回的数据转换为下拉选项格式
                userSearchOptions.value = data.value.map(user => ({
                    label: `${user.username} (${user.nickname || '无昵称'})`,
                    value: user.username,
                    userId: user.userId
                }))
                console.log('[搜索用户] 转换后的选项:', userSearchOptions.value)
            } else {
                console.warn('[搜索用户] 没有返回数据或返回错误')
                userSearchOptions.value = []
            }
        } catch (err) {
            console.error('[搜索用户] 异常:', err)
            userSearchOptions.value = []
        } finally {
            userSearchLoading.value = false
        }
    }, 300)
}

// 选择用户
function selectUser(option) {
    console.log('[选择用户] option:', option)
    addUserForm.value.keyword = option.value
    addUserForm.value.selectedUserId = option.userId
    userSearchOptions.value = [] // 清空下拉列表
    console.log('[选择用户] 保存的 userId:', addUserForm.value.selectedUserId)
}

function openAddUserModal() {
    addUserForm.value = { keyword: '', remark: '', selectedUserId: null }
    userSearchOptions.value = []
    showAddUserModal.value = true
}

async function handleAddUser() {
    const { message } = createDiscreteApi(['message'])
    
    // 验证必填字段
    if (!addUserForm.value.keyword?.trim()) {
        return message.error('请输入用户名')
    }
    if (!addUserForm.value.selectedUserId) {
        return message.error('请从下拉列表中选择用户')
    }

    addUserLoading.value = true
    try {
        // 调用后端添加用户接口
        const result = await useAddGroupUserApi({
            activityId: Number(groupWorkId),
            userId: addUserForm.value.selectedUserId,
            remark: addUserForm.value.remark?.trim() || ''
        })
        
        console.log('[添加用户] API响应:', result)
        
        if (!result.error.value && result.data.value) {
            message.success(`已成功将用户「${result.data.value.username}」添加至拼团`)
            showAddUserModal.value = false
            // 刷新页面数据
            if (refresh) refresh()
        } else {
            message.error(result.error.value?.message || '添加失败，请重试')
        }
    } catch (err) {
        console.error('[添加用户] 异常:', err)
        message.error('添加失败，请重试')
    } finally {
        addUserLoading.value = false
    }
}
</script>

<style scoped>
.group-work-detail {
    padding: 1rem 0;
}

.detail-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.flex {
    display: flex;
}

.items-center {
    align-items: center;
}

.justify-between {
    justify-content: space-between;
}

.gap-2 {
    gap: 0.5rem;
}

.text-xl {
    font-size: 1.25rem;
}

.text-lg {
    font-size: 1.125rem;
}

.text-2xl {
    font-size: 1.5rem;
}

.text-sm {
    font-size: 0.875rem;
}

.font-bold {
    font-weight: 700;
}

.font-semibold {
    font-weight: 600;
}

.text-rose-500 {
    color: #f43f5e;
}

.text-gray-400 {
    color: #9ca3af;
}

.ml-2 {
    margin-left: 0.5rem;
}

.activity-card,
.users-card,
.server-card {
    border-radius: 12px;
}

.activity-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.activity-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
}

.meta-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.meta-label {
    font-size: 0.875rem;
    color: #6b7280;
}

.progress-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.progress-label {
    font-size: 1rem;
    font-weight: 600;
}

.progress-text {
    font-size: 0.875rem;
    color: #6b7280;
}

.time-info {
    background-color: #f9fafb;
    padding: 1rem;
    border-radius: 8px;
}

.time-row {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 0.875rem;
}

.time-row:last-child {
    margin-bottom: 0;
}

.time-label {
    color: #6b7280;
    min-width: 100px;
}

.time-value {
    font-weight: 500;
}

.countdown {
    color: #f43f5e;
    font-weight: 600;
}

.users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
}

.user-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background-color: #f9fafb;
    border-radius: 8px;
    transition: all 0.2s;
}

.user-item:hover {
    background-color: #f3f4f6;
}

.user-info {
    flex: 1;
}

.user-nickname {
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.user-phone {
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
}

.user-join-time {
    font-size: 0.75rem;
    color: #9ca3af;
}

.server-details {
    margin-top: 0.75rem;
}

.detail-row {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    font-size: 0.875rem;
}

.detail-row:last-child {
    margin-bottom: 0;
}

.detail-label {
    color: #6b7280;
    min-width: 120px;
    font-weight: 500;
}

.detail-value {
    font-weight: 500;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.detail-value.copyable {
    cursor: pointer;
    transition: color 0.2s;
}

.detail-value.copyable:hover {
    color: #2080f0;
}

.remaining-time {
    color: #f43f5e;
    font-weight: 600;
}

.action-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 2rem 0;
    flex-wrap: wrap;
}

.action-bar .n-button {
    min-width: 160px;
}

.status-tag {
    font-size: 1rem;
    padding: 0 1.25rem;
    height: 40px;
    line-height: 40px;
    font-weight: 600;
}

/* ── 服务器拼团详细介绍卡片样式 ────────────────────────────────── */
.server-intro-card {
    border-radius: 12px;
}

.intro-section {
    margin-bottom: 1.5rem;
}

.intro-section:last-child {
    margin-bottom: 0;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 0.75rem;
}

.section-content {
    line-height: 1.8;
    color: #333;
    font-size: 0.95rem;
}

.section-content :deep(p) {
    margin: 0.5rem 0;
}

.section-content :deep(ul),
.section-content :deep(ol) {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
}

.section-content :deep(li) {
    margin: 0.25rem 0;
}

/* 功能特性网格 */
.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    transition: all 0.3s ease;
    cursor: default;
}

.feature-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(24, 160, 88, 0.15);
    border-color: #18a058;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
}

.feature-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #18a058 0%, #0d7a44 100%);
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(24, 160, 88, 0.3);
    flex-shrink: 0;
}

.feature-icon {
    color: #ffffff;
}

.feature-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.feature-text {
    font-size: 1rem;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.4;
}

/* 手动添加弹窗 */
.add-user-form { display: flex; flex-direction: column; gap: 1.25rem; }

.form-item { display: flex; flex-direction: column; gap: 0.4rem; }

.selected-user-hint {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.35rem;
    font-size: 0.85rem;
    color: #18a058;
}

/* 搜索下拉框样式 */
.search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: #fff;
    border: 1px solid #e0e0e6;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-height: 240px;
    overflow-y: auto;
    z-index: 1000;
}

.dropdown-item {
    padding: 10px 12px;
    cursor: pointer;
    font-size: 0.9rem;
    color: #333;
    transition: background 0.2s;
}

.dropdown-item:hover {
    background: #f5f5f5;
}

.dropdown-item:first-child {
    border-radius: 8px 8px 0 0;
}

.dropdown-item:last-child {
    border-radius: 0 0 8px 8px;
}

.search-loading {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    padding: 10px 12px;
    background: #fff;
    border: 1px solid #e0e0e6;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    color: #999;
    font-size: 0.85rem;
    z-index: 1000;
}

.form-label { font-size: 0.9rem; font-weight: 600; color: #374151; }

.required { color: #f43f5e; margin-left: 2px; }

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}
</style>
