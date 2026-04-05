<template>
    <div class="site-page">
        <!-- 页面头部 -->
        <div class="site-header">
            <h2 class="site-title">内部网站</h2>
            <div class="site-header-actions">
                <n-input v-model:value="searchForm.siteName" placeholder="搜索网站名称" clearable
                    style="width: 200px; margin-right: 8px;" @keyup.enter="handleSearch">
                    <template #prefix>
                        <n-icon>
                            <Search />
                        </n-icon>
                    </template>
                </n-input>
                <n-select v-model:value="searchForm.status" placeholder="状态筛选" :options="statusOptions" clearable
                    style="width: 120px; margin-right: 8px;" @update:value="handleSearch" />
                <n-button type="primary" @click="handleSearch" style="margin-right: 8px;">搜索</n-button>
                <n-button type="primary" @click="openTagManageModal" style="margin-right: 8px;">
                    <template #icon><n-icon>
                            <Add />
                        </n-icon></template>
                    管理标签
                </n-button>
                <n-button type="primary" @click="openAddModal">
                    <template #icon><n-icon>
                            <Add />
                        </n-icon></template>
                    新增网站
                </n-button>
            </div>
        </div>

        <!-- 网站卡片列表 -->
        <div v-if="loading" class="loading-container">
            <n-spin size="large" />
        </div>

        <div v-else-if="siteList.length === 0" class="empty-container">
            <n-empty description="暂无网站数据" />
        </div>

        <div v-else class="site-grid">
            <div v-for="site in siteList" :key="site.id" class="site-card">
                <!-- 封面图 -->
                <div class="site-cover" @click="handleSiteClicked(site)">
                    <img v-if="site.cover" :src="site.cover" :alt="site.siteName" class="cover-img" />
                    <div v-else class="cover-placeholder">
                        <n-icon size="40" color="#9ca3af">
                            <Globe />
                        </n-icon>
                    </div>
                    <!-- 状态徽标 -->
                    <!-- <span class="status-badge" :class="site.status === 1 ? 'badge-active' : 'badge-disabled'">
                        {{ site.status === 1 ? '启用' : '禁用' }}
                    </span> -->
                </div>

                <!-- 网站信息 -->
                <div class="site-info">
                    <div class="site-name">{{ site.siteName }}</div>
                    <!-- <div class="site-url">
                        <n-icon size="12" color="#6b7280">
                            <LinkOutline />
                        </n-icon>
                        <a :href="site.siteUrl" target="_blank" class="url-link" @click.stop>{{ site.siteUrl }}</a>
                    </div> -->
                    <div v-if="site.description" class="site-desc">{{ site.description }}</div>
                    <!-- 标签 -->
                    <div v-if="site.tagList && site.tagList.length > 0" class="site-tags">
                        <n-tag v-for="(tag, index) in site.tagList" :key="index" size="tiny" type="info"
                            style="margin-right: 3px; margin-top: 3px;">{{ tag }}</n-tag>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="site-actions">
                    <n-button size="small" @click="openEditModal(site)" style="margin-right: 6px;">
                        <template #icon>
                            <n-icon>
                                <CreateOutline />
                            </n-icon>
                        </template>
                    </n-button>
                    <n-button size="small" type="error" @click="handleDelete(site.id)">
                        <template #icon>
                            <n-icon>
                                <TrashOutline />
                            </n-icon>
                        </template>
                    </n-button>
                </div>
            </div>
        </div>

        <!-- 分页 -->
         <!-- 
                <div v-if="total > 0" class="pagination-container">
            <n-pagination v-model:page="currentPage" :page-count="Math.ceil(total / pageSize)" :page-size="pageSize"
                show-quick-jumper @update:page="handlePageChange" />
        </div>
         -->

        <!-- 新增/编辑 弹窗 -->
        <n-modal v-model:show="showModal" :title="modalTitle" preset="card" style="width: 560px;"
            :mask-closable="false">
            <n-form ref="formRef" :model="formData" :rules="formRules" label-placement="left" label-width="90px">
                <n-form-item label="网站名称" path="siteName">
                    <n-input v-model:value="formData.siteName" placeholder="请输入网站名称" maxlength="100" show-count />
                </n-form-item>
                <n-form-item label="访问地址" path="siteUrl">
                <n-input v-model:value="formData.siteUrl" placeholder="请输入网站地址，如 https://example.com"
                        maxlength="500" />
                </n-form-item>
                <n-form-item label="封面图片" path="cover">
                    <Uploader v-model:value="formData.cover" :data="formApiData" @update:model-value="handleCoverUploaded"/>
                </n-form-item>
                <n-form-item label="网站描述" path="description">
                    <n-input v-model:value="formData.description" type="textarea" placeholder="请输入网站描述（可选）"
                        maxlength="500" show-count :autosize="{ minRows: 2, maxRows: 4 }" />
                </n-form-item>
                <n-form-item label="标签" path="tags">
                    <div style="display: flex; gap: 8px; width: 100%;">
                        <n-select 
                            v-model:value="formData.tags" 
                            placeholder="请选择或输入标签"
                            :options="tagOptions"
                            multiple
                            filterable
                            tag
                            style="flex: 1;"
                        />
                        <n-button type="primary" @click="openTagManageModal" style="min-width: 100px;">
                            管理标签
                        </n-button>
                    </div>
                </n-form-item>
            </n-form>
            <template #footer>
                <div style="display: flex; justify-content: flex-end; gap: 8px;">
                    <n-button @click="showModal = false">取消</n-button>
                    <n-button type="primary" :loading="submitting" @click="handleSubmit">确定</n-button>
                </div>
            </template>
        </n-modal>

        <!-- 标签管理弹窗 -->
        <n-modal v-model:show="showTagManageModal" title="管理标签" preset="card" style="width: 500px;"
            :mask-closable="false">
            <div style="margin-bottom: 12px;">
                <n-input 
                    v-model:value="newTagName" 
                    placeholder="输入新标签名称"
                    @keyup.enter="handleAddTag"
                    maxlength="50"
                >
                    <template #suffix>
                        <n-button type="primary" size="small" @click="handleAddTag" :loading="addingTag">
                            添加
                        </n-button>
                    </template>
                </n-input>
            </div>
            <n-data-table
                :columns="tagColumns"
                :data="allTags"
                :bordered="false"
                :single-line="false"
                style="max-height: 300px; overflow-y: auto;"
            />
            <template #footer>
                <div style="display: flex; justify-content: flex-end;">
                    <n-button @click="showTagManageModal = false">关闭</n-button>
                </div>
            </template>
        </n-modal>
    </div>
</template>

<script setup>
import {
    NInput, NButton, NSelect, NModal, NForm, NFormItem,
    NRadioGroup, NRadio, NTag, NSpin, NEmpty,
    NIcon, createDiscreteApi, NDataTable
} from 'naive-ui'
import { Search, Add, Globe, CreateOutline, TrashOutline } from '@vicons/ionicons5'
import { h } from 'vue'

useHead({
    title: '内部网站 - 开源助手',
})

const formApiData = {
    type: "image"
}

function handleCoverUploaded(file) {
    if (file) {
        formData.cover = file.url
    }
}

// 状态选项
const statusOptions = [
    { label: '正常', value: 1 },
    { label: '异常', value: 0 },
]

const protocolOptions = [
    { label: 'http://www', value: 1 },
    { label: 'https://www', value: 2 },
]

const protocolValue = ref(1)

// 列表数据
const siteList = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(100000)

// 搜索表单
const searchForm = reactive({
    siteName: '',
    status: null,
})

// 弹窗
const showModal = ref(false)
const modalTitle = ref('新增网站')
const submitting = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const defaultFormData = () => ({
    id: null,
    siteName: '测试站点',
    siteUrl: 'https://www.baidu.com',
    cover: '',
    description: '',
    tags: '',
    status: 1,
})

const formData = reactive(defaultFormData())

// 标签相关
const allTags = ref([])
const tagOptions = ref([])
const showTagManageModal = ref(false)
const newTagName = ref('')
const addingTag = ref(false)

const fileList = ref([])

// 标签表格列定义
const tagColumns = [
    {
        title: '标签名称',
        key: 'tagName',
        width: 200,
        render: (row) => {
            return h(NInput, {
                value: row.tagName,
                size: 'small',
                onUpdateValue: (v) => {
                    row.tagName = v
                }
            })
        }
    },
    {
        title: '已添加网站数',
        key: 'usageCount',
        width: 100,
        render: (row) => {
            return h('span', { 
                style: 'color: #18a058; font-weight: bold;' 
            }, row.usageCount || 0)
        }
    },
    {
        title: '操作',
        key: 'actions',
        width: 150,
        fixed: 'right',
        render: (row) => {
            return h('div', { style: 'display: flex; gap: 4px;' }, [
                h(NButton, {
                    size: 'small',
                    type: 'primary',
                    onClick: () => handleUpdateTag(row)
                }, { default: () => '保存' }),
                h(NButton, {
                    size: 'small',
                    type: 'error',
                    onClick: () => handleDeleteTag(row)
                }, { default: () => '删除' })
            ])
        }
    }
]

const formRules = {
    siteName: [{ required: true, message: '请输入网站名称', trigger: 'blur' }],
    siteUrl: [
        { required: true, message: '请输入网站地址', trigger: 'blur' },
        { pattern: /^https?:\/\/.+/, message: '请输入以 http:// 或 https:// 开头的地址', trigger: 'blur' }
    ],
}

// 加载列表
async function loadList() {
    loading.value = true
    try {
        const query = {
            pageNum: currentPage.value,
            pageSize: pageSize.value,
        }
        if (searchForm.siteName) query.siteName = searchForm.siteName
        if (searchForm.status !== null) query.status = searchForm.status

        const { data } = await useSiteInfoListApi(query)
        if (data.value ) {
            const sites = data.value.rows || []
            // 为每个网站加载标签
            for (const site of sites) {
                try {
                    const { data: tagsData } = await useSiteTagsBySiteIdApi(site.id)
                    site.tagList = tagsData.value || []
                } catch (error) {
                    console.error(`加载网站 ${site.id} 的标签失败:`, error)
                    site.tagList = []
                }
            }
            siteList.value = sites
            total.value = data.value.total || 0
        }
    } finally {
        loading.value = false
    }
}

// 搜索
function handleSearch() {
    currentPage.value = 1
    loadList()
}

// 分页
function handlePageChange(page) {
    currentPage.value = page
    loadList()
}

// 新增还是修改：新增为 false，修改为 true
const isUpdate = ref(false)

// 打开新增弹窗
function openAddModal() {
    isEdit.value = false
    modalTitle.value = '新增网站'
    isUpdate.value = false
    Object.assign(formData, defaultFormData())
    showModal.value = true
}

// 打开编辑弹窗
function openEditModal(site) {
    isEdit.value = true
    modalTitle.value = '编辑网站'
    isUpdate.value = true

    Object.assign(formData, {
        id: site.id,
        siteName: site.siteName || '',
        siteUrl: site.siteUrl || '',
        cover: site.cover || '',
        description: site.description || '',
        tags: site.tags || '',
        status: site.status ?? 1,
    })
    showModal.value = true
}

// 提交表单
async function handleSubmit() {
    try {
        await formRef.value.validate()
    } catch {
        return
    }

    submitting.value = true
    const { message } = createDiscreteApi(['message'])
    try {
        if (isEdit.value) {
            await useSiteInfoUpdateApi({ ...formData })
            message.success('修改成功')
        } else {
            await useSiteInfoAddApi({ ...formData })
            message.success('新增成功')
        }
        showModal.value = false
        loadList()
    } catch {
        message.error(isEdit.value ? '修改失败' : '新增失败')
    } finally {
        submitting.value = false
    }
}

// 删除
function handleDelete(id) {
    const { dialog, message } = createDiscreteApi(['dialog', 'message'])
    dialog.warning({
        title: '提示',
        content: '确认删除该网站吗？',
        positiveText: '删除',
        negativeText: '取消',
        onPositiveClick: async () => {
            try {
                await useSiteInfoDeleteApi(id)
                message.success('删除成功')
                loadList()
            } catch {
                message.error('删除失败')
            }
        },
    })
}

// ========== 标签管理相关方法 ==========

// 加载所有标签
async function loadAllTags() {
    try {
        const { data } = await useSiteTagsListApi()
        if (data.value) {
            allTags.value = data.value.map(tag => ({
                id: tag.id,
                tagName: tag.tagName,
                usageCount: tag.usageCount || 0
            }))
            tagOptions.value = data.value.map(tag => ({
                label: `${tag.tagName} (${tag.usageCount || 0})`,
                value: tag.tagName
            }))
        }
    } catch (error) {
        console.error('加载标签失败:', error)
    }
}

// 打开标签管理弹窗
function openTagManageModal() {
    showTagManageModal.value = true
    loadAllTags()
}

// 添加新标签
async function handleAddTag() {
    if (!newTagName.value || !newTagName.value.trim()) {
        const { message } = createDiscreteApi(['message'])
        message.warning('请输入标签名称')
        return
    }
    
    addingTag.value = true
    const { message } = createDiscreteApi(['message'])
    
    try {
        await useSiteTagAddApi({
            tagName: newTagName.value.trim()
        })
        message.success('添加成功')
        newTagName.value = ''
        await loadAllTags() // 重新加载标签列表
    } catch {
        message.error('添加失败')
    } finally {
        addingTag.value = false
    }
}

// 更新标签
async function handleUpdateTag(row) {
    const { message } = createDiscreteApi(['message'])
    
    if (!row.tagName || !row.tagName.trim()) {
        message.warning('标签名称不能为空')
        return
    }
    
    try {
        await useSiteTagUpdateApi({
            id: row.id,
            tagName: row.tagName.trim()
        })
        message.success('修改成功')
        await loadAllTags()
    } catch {
        message.error('修改失败')
    }
}

// 删除标签
async function handleDeleteTag(row) {
    const { dialog, message } = createDiscreteApi(['dialog', 'message'])
    
    dialog.warning({
        title: '提示',
        content: '确认删除该标签吗？',
        positiveText: '删除',
        negativeText: '取消',
        onPositiveClick: async () => {
            try {
                await useSiteTagDeleteApi([row.id])
                message.success('删除成功')
                await loadAllTags()
            } catch {
                message.error('删除失败')
            }
        },
    })
}


function handleSiteClicked(site) {
    // 处理网站点击事件
    useSiteUrlApi(site.id).then(({ data }) => {
        if (data.value) {
            // 打开浏览器页签
            // TODO 权限校验
            window.open(data.value.siteUrl, '_blank')
        }
    })
}


onMounted(() => {
    loadList()
    loadAllTags()
})
</script>

<style scoped>
.site-page {
width: 100vw;
    min-height: 60vh;
}

.site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    background: #fff;
    border-radius: 8px;
    padding: 16px 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.site-title {
    font-size: 18px;
    font-weight: 700;
    color: #111827;
    margin: 0;
}

.site-header-actions {
    display: flex;
    align-items: center;
}

.loading-container,
.empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    background: #fff;
    border-radius: 8px;
}

.site-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 8px;
}

.site-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
    transition: box-shadow 0.2s, transform 0.2s;
    display: flex;
    flex-direction: column;
}

.site-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.site-cover {
    position: relative;
    height: 70px;
    background: #f3f4f6;
    overflow: hidden;
    cursor: pointer;
}

.cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #e0f2fe 0%, #e0e7ff 100%);
}

.status-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
}

.badge-active {
    background: #d1fae5;
    color: #065f46;
}

.badge-disabled {
    background: #fee2e2;
    color: #991b1b;
}

.site-info {
    padding: 6px 8px;
    flex: 1;
}

.site-name {
    font-size: 12px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.site-url {
    display: flex;
    align-items: center;
    gap: 3px;
    margin-bottom: 4px;
}

.url-link {
    font-size: 10px;
    color: #2563eb;
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100px;
}

.url-link:hover {
    text-decoration: underline;
}

.site-desc {
    font-size: 10px;
    color: #6b7280;
    margin-bottom: 4px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.site-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
}

.site-actions {
    padding: 6px 8px;
    border-top: 1px solid #f3f4f6;
    display: flex;
    justify-content: flex-end;
}

.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    padding: 16px 0;
}
</style>
