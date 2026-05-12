<template>
    <div class="server-tutorial-page">
        <LoadingGroup :pending="pending" :error="error">
            <div v-if="data" class="tutorial-layout">

                <!-- 左侧：服务器信息栏 -->
                <aside class="server-sidebar">
                    <div class="sidebar-card">
                        <!-- 标题 -->
                        <div class="sidebar-header">
                            <n-tag type="success" :bordered="false" size="small" class="success-tag">✓ 拼团成功</n-tag>
                            <h2 class="sidebar-title">{{ data.title }}</h2>
                        </div>

                        <!-- 硬件规格 -->
                        <div class="spec-list">
                            <div class="spec-row">
                                <div class="spec-icon cpu"><n-icon :component="HardwareChipOutline" /></div>
                                <div>
                                    <p class="spec-key">CPU</p>
                                    <p class="spec-val">{{ data.cpu || '—' }}</p>
                                </div>
                            </div>
                            <div class="spec-row">
                                <div class="spec-icon mem"><n-icon :component="ServerOutline" /></div>
                                <div>
                                    <p class="spec-key">内存</p>
                                    <p class="spec-val">{{ data.memory || '—' }}</p>
                                </div>
                            </div>
                            <div class="spec-row">
                                <div class="spec-icon disk"><n-icon :component="SaveOutline" /></div>
                                <div>
                                    <p class="spec-key">存储</p>
                                    <p class="spec-val">{{ data.storage || '—' }}</p>
                                </div>
                            </div>
                            <div class="spec-row">
                                <div class="spec-icon dur"><n-icon :component="TimeOutline" /></div>
                                <div>
                                    <p class="spec-key">使用时长</p>
                                    <p class="spec-val">{{ data.totalDuration ? `${data.totalDuration} 个月` : '—' }}</p>
                                </div>
                            </div>
                        </div>

                        <n-divider />

                        <!-- 使用时间 -->
                        <div class="time-block">
                            <div class="time-row">
                                <span class="time-key">开始使用</span>
                                <span class="time-val">{{ data.serverStartTime ? formatTime(data.serverStartTime) : '待分配' }}</span>
                            </div>
                            <div class="time-row">
                                <span class="time-key">到期时间</span>
                                <span class="time-val">{{ data.serverExpireTime ? formatTime(data.serverExpireTime) : '待分配' }}</span>
                            </div>
                            <div class="time-row" v-if="data.remainingMonths != null">
                                <span class="time-key">剩余月数</span>
                                <span class="time-val green">{{ Math.ceil(data.remainingMonths) }} 个月</span>
                            </div>
                        </div>

                        <n-divider />

                        <!-- ====================================================
                             TODO: 后端实现后在此展示 SSH 连接信息
                             接口示例：GET /pc/group/server/info?activityId={id}
                             期望返回字段：ip, port, username, password, remark
                             ==================================================== -->
                        <div class="ssh-block placeholder">
                            <n-icon :component="LockClosedOutline" size="18" class="lock-icon" />
                            <p class="placeholder-text">SSH 连接信息将在后端接口实现后展示</p>
                        </div>

                        <n-button
                            block
                            secondary
                            class="mt-4"
                            @click="$router.go(-1)"
                        >
                            返回拼团详情
                        </n-button>
                    </div>
                </aside>

                <!-- 右侧：服务器详细介绍 + 图文教程主体 -->
                <main class="tutorial-main">
                    <!-- 服务器详细介绍卡片 -->
                    <n-card class="server-intro-card" v-if="serverIntro">
                        <template #header>
                            <div class="intro-card-header">
                                <n-icon :component="ServerOutline" size="20" class="header-icon" />
                                <span>服务器拼团详细介绍</span>
                            </div>
                        </template>

                        <!-- 服务内容说明 -->
                        <div v-if="serverIntro.serviceDescription" class="intro-section">
                            <h3 class="section-title">
                                <n-icon :component="DocumentTextOutline" size="18" />
                                拼团服务内容
                            </h3>
                            <div class="section-content" v-html="serverIntro.serviceDescription"></div>
                        </div>

                        <!-- 服务器功能特性 -->
                        <div v-if="serverIntro.featureList && serverIntro.featureList.length" class="intro-section">
                            <h3 class="section-title">
                                <n-icon :component="ListOutline" size="18" />
                                服务器功能特性
                            </h3>
                            <div class="feature-grid">
                                <div 
                                    v-for="(feature, index) in serverIntro.featureList" 
                                    :key="index"
                                    class="feature-item"
                                >
                                    <n-icon :component="CheckmarkCircleOutline" size="16" class="feature-icon" />
                                    <span>{{ feature }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- 配置指南步骤 -->
                        <div v-if="serverIntro.configurationGuide && serverIntro.configurationGuide.length" class="intro-section">
                            <h3 class="section-title">
                                <n-icon :component="SettingsOutline" size="18" />
                                配置指南
                            </h3>
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

                    <!-- SSH连接信息卡片 -->
                    <n-card class="ssh-info-card" v-if="sshInfo">
                        <template #header>
                            <div class="ssh-card-header">
                                <n-icon :component="TerminalOutline" size="20" class="header-icon" />
                                <span>SSH 连接信息</span>
                            </div>
                        </template>

                        <div class="ssh-details">
                            <div class="ssh-row">
                                <span class="ssh-label">服务器 IP：</span>
                                <span class="ssh-value copyable" @click="copyToClipboard(sshInfo.ip)">
                                    {{ sshInfo.ip }}
                                    <n-icon :component="CopyOutline" size="14" />
                                </span>
                            </div>
                            <div class="ssh-row">
                                <span class="ssh-label">SSH 端口：</span>
                                <span class="ssh-value">{{ sshInfo.port || 22 }}</span>
                            </div>
                            <div class="ssh-row">
                                <span class="ssh-label">用户名：</span>
                                <span class="ssh-value copyable" @click="copyToClipboard(sshInfo.username)">
                                    {{ sshInfo.username }}
                                    <n-icon :component="CopyOutline" size="14" />
                                </span>
                            </div>
                            <div class="ssh-row">
                                <span class="ssh-label">密码：</span>
                                <span class="ssh-value">
                                    {{ showPassword ? sshInfo.password : '********' }}
                                    <n-button text size="small" @click="showPassword = !showPassword">
                                        {{ showPassword ? '隐藏' : '显示' }}
                                    </n-button>
                                    <n-button text size="small" @click="copyToClipboard(sshInfo.password)">
                                        <n-icon :component="CopyOutline" size="14" />
                                    </n-button>
                                </span>
                            </div>
                            <div v-if="sshInfo.remark" class="ssh-row">
                                <span class="ssh-label">备注：</span>
                                <span class="ssh-value remark">{{ sshInfo.remark }}</span>
                            </div>
                        </div>
                    </n-card>

                    <!-- 图文教程卡片 -->
                    <n-card class="tutorial-card">
                        <template #header>
                            <div class="tutorial-card-header">
                                <n-icon :component="BookOutline" size="20" class="book-icon" />
                                <span>服务器配置图文教程</span>
                            </div>
                        </template>

                        <!-- ====================================================
                             TODO: 后端实现后替换此区域为接口返回的富文本内容
                             接口示例：GET /pc/group/server/tutorial?activityId={id}
                             期望返回字段：content (HTML富文本), title
                             调用示例：
                               const { data: tutorialData } = await useGetServerTutorialApi(activityId)
                               tutorialContent.value = tutorialData.value?.content || ''
                             ==================================================== -->

                        <!-- 当后端有富文本内容时：用 v-html 渲染 -->
                        <article
                            v-if="tutorialContent"
                            class="tutorial-article"
                            v-html="tutorialContent"
                        />

                        <!-- 暂无内容时：展示外链教程入口 + 占位提示 -->
                        <div v-else class="tutorial-fallback">
                            <!-- 如有外链教程 URL，展示快速入口 -->
                            <div v-if="data.serverTutorialUrl" class="external-tutorial">
                                <div class="external-header">
                                    <n-icon :component="LinkOutline" size="22" />
                                    <span>在线配置教程</span>
                                </div>
                                <p class="external-desc">
                                    点击下方按钮可查看完整的图文配置步骤，包含服务器初始化、环境部署等详细说明。
                                </p>
                                <n-button
                                    type="primary"
                                    size="large"
                                    tag="a"
                                    :href="data.serverTutorialUrl"
                                    target="_blank"
                                >
                                    <template #icon><n-icon :component="OpenOutline" /></template>
                                    打开配置教程
                                </n-button>
                            </div>

                            <!-- 占位区：后端接口未实现时展示 -->
                            <n-alert type="info" class="api-placeholder-alert" :show-icon="true">
                                <template #header>功能开发中</template>
                                详细的图文配置教程将在后端接口实现后自动加载，包含环境搭建、服务部署等完整步骤。
                            </n-alert>

                            <!-- 步骤预览（静态占位，后端接口上线后可删除） -->
                            <div class="steps-preview">
                                <div class="steps-title">配置流程概览</div>
                                <n-steps vertical>
                                    <n-step title="获取服务器连接信息" description="通过 SSH 工具使用分配的 IP、端口、账号登录服务器" status="process" />
                                    <n-step title="初始化系统环境" description="更新软件包、配置基础运行环境" status="wait" />
                                    <n-step title="部署所需服务" description="按教程安装并启动对应服务组件" status="wait" />
                                    <n-step title="验证部署结果" description="通过浏览器或接口验证服务是否正常运行" status="wait" />
                                </n-steps>
                            </div>
                        </div>
                    </n-card>
                </main>

            </div>
        </LoadingGroup>
    </div>
</template>

<script setup>
import {
    NCard, NButton, NIcon, NTag, NAlert,
    NDivider, NSteps, NStep,
    createDiscreteApi
} from "naive-ui"
import {
    ArrowBack,
    HardwareChipOutline,
    ServerOutline,
    SaveOutline,
    TimeOutline,
    BookOutline,
    LinkOutline,
    OpenOutline,
    LockClosedOutline,
    DocumentTextOutline,
    ListOutline,
    SettingsOutline,
    CheckmarkCircleOutline,
    TerminalOutline,
    CopyOutline,
} from '@vicons/ionicons5'

const route = useRoute()
const activityId = route.params.id

definePageMeta({ name: 'group-server-id' })
useHead({ title: '服务器配置教程' })

// ── 复用拼团详情接口获取服务器基础字段 ──────────────────────────────
let rawData, error, pending
try {
    const result = await useGetGroupWorkDetailApi(activityId)
    rawData = result.data
    error = result.error
    pending = result.pending
} catch (err) {
    error = ref(err?.message || '加载失败')
    pending = ref(false)
    rawData = ref(null)
}

// ─ 适配后端数据结构（与详情页保持一致）────────────────────────────
const data = computed(() => {
    if (!rawData.value) return null
    const a = rawData.value.activity || rawData.value
    return { ...a }
})

// ── 服务器详细介绍数据 ──────────────────────────────────────────────
const serverIntro = ref(null)
const sshInfo = ref(null)
const showPassword = ref(false)

// 加载服务器教程详情
let tutorialRaw, tutorialError
try {
    const tutorialResult = await useGetServerTutorialApi(activityId)
    tutorialRaw = tutorialResult.data
    tutorialError = tutorialResult.error
    
    // 处理教程数据
    if (tutorialRaw.value) {
        serverIntro.value = {
            serviceDescription: tutorialRaw.value.serviceDescription || '',
            featureList: tutorialRaw.value.featureList || [],
            configurationGuide: tutorialRaw.value.configurationGuide || [],
            serverTutorialUrl: tutorialRaw.value.serverTutorialUrl || data.value?.serverTutorialUrl
        }
    }
} catch (err) {
    console.warn('加载服务器教程失败:', err)
    tutorialError = ref(err)
}

// 加载SSH连接信息
let sshRaw, sshError
try {
    const sshResult = await useGetServerSshInfoApi(activityId)
    sshRaw = sshResult.data
    sshError = sshResult.error
    
    if (sshRaw.value) {
        sshInfo.value = {
            ip: sshRaw.value.ip || '',
            port: sshRaw.value.port || 22,
            username: sshRaw.value.username || '',
            password: sshRaw.value.password || '',
            remark: sshRaw.value.remark || ''
        }
    }
} catch (err) {
    console.warn('加载SSH连接信息失败:', err)
    sshError = ref(err)
}

// ── TODO: 后端实现图文教程接口后在此接入 ────────────────────────────
// 接口示例：GET /pc/group/server/tutorial?activityId={activityId}
// 接入方式：
//   const { data: tutorialRaw } = await useHttpGet('ServerTutorial',
//       `/group/server/tutorial?activityId=${activityId}`, { lazy: true })
//   const tutorialContent = computed(() => tutorialRaw.value?.content || '')
const tutorialContent = ref('')   // 接口上线后替换此行

// ── 工具函数 ───────────────────────────────────────────────────────
function formatTime(time) {
    if (!time) return ''
    return new Date(time).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    })
}

// 复制到剪贴板
function copyToClipboard(text) {
    if (!text) return
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            const { message } = createDiscreteApi(["message"])
            message.success('复制成功')
        }).catch(() => {
            fallbackCopy(text)
        })
    } else {
        fallbackCopy(text)
    }
}

// 备用复制方法
function fallbackCopy(text) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    
    try {
        document.execCommand('copy')
        const { message } = createDiscreteApi(["message"])
        message.success('复制成功')
    } catch (err) {
        const { message } = createDiscreteApi(["message"])
        message.error('复制失败')
    }
    
    document.body.removeChild(textarea)
}
</script>

<style scoped>
.server-tutorial-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 1.5rem 1rem 3rem;
}

/* ── 双栏布局 ─────────────────────────────────────────────────────── */
.tutorial-layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 1.25rem;
    align-items: start;
}
@media (max-width: 768px) {
    .tutorial-layout { grid-template-columns: 1fr; }
}

/* ── 左侧信息栏 ───────────────────────────────────────────────────── */
.sidebar-card {
    background: #fff;
    border: 1px solid #e8ecf0;
    border-radius: 16px;
    padding: 1.25rem;
    position: sticky;
    top: 80px;
}

.sidebar-header {
    margin-bottom: 1.1rem;
}
.success-tag { margin-bottom: 0.5rem; }
.sidebar-title {
    font-size: 1rem;
    font-weight: 700;
    margin: 0;
    line-height: 1.45;
    color: #1a1a1a;
}

/* 规格列表 */
.spec-list { display: flex; flex-direction: column; gap: 0.7rem; }
.spec-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}
.spec-icon {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    font-size: 18px;
}
.spec-icon.cpu  { background: #e8f5e9; color: #2e7d32; }
.spec-icon.mem  { background: #e3f2fd; color: #1565c0; }
.spec-icon.disk { background: #fff3e0; color: #e65100; }
.spec-icon.dur  { background: #f3e5f5; color: #6a1b9a; }
.spec-key { font-size: 0.75rem; color: #999; margin: 0 0 2px; }
.spec-val { font-size: 0.9rem; font-weight: 600; margin: 0; color: #1a1a1a; }

/* 时间块 */
.time-block { display: flex; flex-direction: column; gap: 0.6rem; }
.time-row { display: flex; justify-content: space-between; align-items: center; }
.time-key { font-size: 0.8rem; color: #888; }
.time-val { font-size: 0.82rem; font-weight: 600; color: #333; }
.time-val.green { color: #18a058; }

/* SSH 占位 */
.ssh-block.placeholder {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 10px;
    border: 1px dashed #d0d0d0;
}
.lock-icon { color: #bbb; flex-shrink: 0; }
.placeholder-text { font-size: 0.78rem; color: #aaa; margin: 0; line-height: 1.4; }

/* ── 右侧教程主体 ─────────────────────────────────────────────────── */
.tutorial-card { border-radius: 16px; }
.tutorial-card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1rem;
}
.book-icon { color: #18a058; }

/* ── 图文教程渲染区（参照 book-article 样式）────────────────────── */
.tutorial-article {
    padding: 1rem 1.5rem;
    line-height: 1.85;
    font-size: 15px;
    color: #333;
}
.tutorial-article :deep(h1),
.tutorial-article :deep(h2) {
    font-size: 1.4rem; font-weight: 700;
    margin: 1.75rem 0 0.9rem; color: #1a1a1a;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 0.5rem;
}
.tutorial-article :deep(h3) {
    font-size: 1.15rem; font-weight: 600;
    margin: 1.25rem 0 0.6rem; color: #333;
}
.tutorial-article :deep(p) { margin: 0.75rem 0; }
.tutorial-article :deep(ul),
.tutorial-article :deep(ol) { padding-left: 1.5rem; margin: 0.75rem 0; }
.tutorial-article :deep(li) { margin: 0.45rem 0; }
.tutorial-article :deep(img) {
    max-width: 100% !important;
    height: auto !important;
    display: block;
    margin: 1.6rem auto;
    border-radius: 14px;
    box-shadow: 0 14px 36px rgba(15,23,42,0.12);
}
.tutorial-article :deep(code) {
    background: rgba(15,23,42,0.06);
    padding: 2px 7px;
    border-radius: 6px;
    font-family: 'SFMono-Regular', 'Consolas', monospace;
    font-size: 13.5px;
    color: #d03050;
}
.tutorial-article :deep(pre) {
    background: linear-gradient(180deg, #1f232b 0%, #141820 100%);
    color: #d8dee9;
    padding: 1.25rem 1.4rem;
    border-radius: 18px;
    overflow-x: auto;
    margin: 1.5rem 0;
    box-shadow: 0 16px 32px rgba(15,23,42,0.14);
}
.tutorial-article :deep(pre code) {
    background: none; padding: 0; color: inherit; font-size: 13.5px;
}
.tutorial-article :deep(blockquote) {
    margin: 1.25rem 0;
    padding: 0.9rem 1.25rem;
    background: #f8f9fa;
    border-left: 4px solid #18a058;
    border-radius: 4px;
    color: #666;
}

/* ── 占位区样式 ───────────────────────────────────────────────────── */
.tutorial-fallback { padding: 0.5rem 0; }

.external-tutorial {
    padding: 1.25rem;
    background: #f0faf5;
    border: 1px solid #b7e8cc;
    border-radius: 12px;
    margin-bottom: 1.25rem;
}
.external-header {
    display: flex; align-items: center; gap: 0.5rem;
    font-weight: 700; font-size: 1rem; color: #18a058;
    margin-bottom: 0.6rem;
}
.external-desc {
    font-size: 0.88rem; color: #555; margin: 0 0 1rem;
    line-height: 1.6;
}

.api-placeholder-alert { margin-bottom: 1.5rem; }

.steps-preview {
    padding: 1.25rem;
    background: #fafafa;
    border: 1px solid #eee;
    border-radius: 12px;
}
.steps-title {
    font-weight: 700; font-size: 0.95rem;
    color: #444; margin-bottom: 1rem;
}

.mt-4 { margin-top: 1rem; }

/* ── 服务器详细介绍卡片样式 ─────────────────────────────────────── */
.server-intro-card,
.ssh-info-card {
    border-radius: 16px;
    margin-bottom: 1.25rem;
}

.intro-card-header,
.ssh-card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 700;
    font-size: 1rem;
}

.header-icon {
    color: #18a058;
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

/* 功能特性网格 */
.feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.75rem;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #374151;
}

.feature-icon {
    color: #18a058;
    flex-shrink: 0;
}

/* SSH连接信息样式 */
.ssh-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.ssh-row {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
}

.ssh-label {
    min-width: 100px;
    color: #6b7280;
    font-weight: 500;
}

.ssh-value {
    flex: 1;
    color: #374151;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.ssh-value.copyable {
    cursor: pointer;
    transition: color 0.2s;
}

.ssh-value.copyable:hover {
    color: #2080f0;
}

.ssh-value.remark {
    color: #6b7280;
    font-style: italic;
}
</style>
