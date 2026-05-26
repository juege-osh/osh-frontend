<template>
    <div class="footer">
        <!-- 展示模式 -->
        <div v-if="!editing" class="ad-grid">
            <a
                v-for="link in links"
                :key="link.id || link.sortOrder"
                :href="link.url || '#'"
                target="_blank"
                class="ad-card"
            >
                <div class="ad-card-name">{{ link.name }}</div>
                <div class="ad-card-desc" v-if="link.description">{{ link.description }}</div>
                <div class="ad-card-url">{{ formatUrl(link.url) }}</div>
            </a>
            <div v-if="links.length === 0" class="ad-empty">暂无推荐链接</div>
            <button v-if="isAdmin" class="edit-trigger" @click="startEdit">✎ 管理广告位</button>
        </div>

        <!-- 编辑模式 -->
        <div v-else class="edit-panel">
            <div class="edit-title">编辑广告位（最多5个）</div>
            <div class="edit-list">
                <div v-for="(item, idx) in editList" :key="idx" class="edit-card">
                    <div class="edit-card-header">广告 {{ idx + 1 }}</div>
                    <div class="edit-field">
                        <label>名称</label>
                        <input v-model="item.name" placeholder="广告标题" class="edit-input" />
                    </div>
                    <div class="edit-field">
                        <label>描述</label>
                        <input v-model="item.description" placeholder="一句话介绍" class="edit-input" />
                    </div>
                    <div class="edit-field">
                        <label>链接</label>
                        <input v-model="item.url" placeholder="https://..." class="edit-input" />
                    </div>
                </div>
            </div>
            <div class="edit-actions">
                <button class="action-btn save-btn" @click="saveLinks">保存</button>
                <button class="action-btn cancel-btn" @click="cancelEdit">取消</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { apiFetchFriendLinks, apiSaveFriendLinks } from '~/composables/Api/Site/friendLink'

const links = ref([])
const editing = ref(false)
const editList = ref([])

const isAdmin = computed(() => {
    if (!process.client) return false
    try {
        const roleStr = localStorage.getItem('__user_role__')
        if (roleStr) {
            const role = JSON.parse(roleStr)
            return parseInt(role.level || '0') >= 4
        }
    } catch {}
    return false
})

function formatUrl(url) {
    if (!url || url === '#') return ''
    try {
        return new URL(url).hostname
    } catch {
        return url
    }
}

async function loadLinks() {
    try {
        const res = await apiFetchFriendLinks()
        links.value = res?.data || res || []
    } catch {
        links.value = []
    }
}

function startEdit() {
    const list = []
    for (let i = 0; i < 5; i++) {
        if (links.value[i]) {
            list.push({
                name: links.value[i].name || '',
                url: links.value[i].url || '',
                description: links.value[i].description || ''
            })
        } else {
            list.push({ name: '', url: '', description: '' })
        }
    }
    editList.value = list
    editing.value = true
}

function cancelEdit() {
    editing.value = false
}

async function saveLinks() {
    const toSave = editList.value
        .filter(item => item.name.trim() || item.url.trim())
        .map(item => ({
            name: item.name.trim(),
            url: item.url.trim(),
            description: item.description.trim()
        }))
    try {
        await apiSaveFriendLinks(toSave)
        editing.value = false
        await loadLinks()
    } catch (e) {
        if (process.client) {
            alert('保存失败，请确认是否有管理员权限')
        }
    }
}

onMounted(() => {
    loadLinks()
})
</script>

<style>
.footer {
    margin-top: auto;
    background: linear-gradient(180deg, #1a1f2e 0%, #141824 100%);
    color: #e2e8f0;
    padding: 2rem 1rem 1.5rem;
}

/* ── 广告卡片网格 ── */
.ad-grid {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    position: relative;
}

.ad-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 200px;
    padding: 1rem 1.25rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.75rem;
    text-decoration: none;
    color: #e2e8f0;
    transition: all 0.25s ease;
    cursor: pointer;
}

.ad-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(96, 165, 250, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(96, 165, 250, 0.1);
}

.ad-card-name {
    font-size: 0.9rem;
    font-weight: 600;
    color: #f1f5f9;
    margin-bottom: 0.4rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ad-card-desc {
    font-size: 0.75rem;
    color: #94a3b8;
    line-height: 1.4;
    margin-bottom: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.ad-card-url {
    font-size: 0.7rem;
    color: #64748b;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.ad-empty {
    color: #64748b;
    font-size: 0.875rem;
    padding: 1.5rem;
}

/* ── 管理按钮 ── */
.edit-trigger {
    position: absolute;
    right: 0;
    top: -0.5rem;
    padding: 0.3rem 0.75rem;
    font-size: 0.7rem;
    color: #64748b;
    background: transparent;
    border: 1px solid #334155;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.edit-trigger:hover {
    color: #e2e8f0;
    border-color: #60a5fa;
}

/* ── 编辑面板 ── */
.edit-panel {
    max-width: 1200px;
    margin: 0 auto;
}

.edit-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: #f1f5f9;
    margin-bottom: 1rem;
}

.edit-list {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.edit-card {
    width: 210px;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid #334155;
    border-radius: 0.5rem;
}

.edit-card-header {
    font-size: 0.7rem;
    color: #64748b;
    font-weight: 600;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.edit-field {
    margin-bottom: 0.4rem;
}

.edit-field label {
    display: block;
    font-size: 0.65rem;
    color: #94a3b8;
    margin-bottom: 0.15rem;
}

.edit-input {
    width: 100%;
    padding: 0.35rem 0.5rem;
    font-size: 0.8rem;
    border: 1px solid #334155;
    border-radius: 4px;
    background: #1e293b;
    color: #f1f5f9;
    outline: none;
    box-sizing: border-box;
}

.edit-input:focus {
    border-color: #60a5fa;
}

.edit-input::placeholder {
    color: #475569;
}

.edit-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.action-btn {
    padding: 0.4rem 1.25rem;
    font-size: 0.8rem;
    border-radius: 6px;
    cursor: pointer;
    border: none;
    font-weight: 500;
    transition: background 0.2s;
}

.save-btn {
    background: #3b82f6;
    color: white;
}

.save-btn:hover {
    background: #2563eb;
}

.cancel-btn {
    background: #334155;
    color: #e2e8f0;
}

.cancel-btn:hover {
    background: #475569;
}
</style>
