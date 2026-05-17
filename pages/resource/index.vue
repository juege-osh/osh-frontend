<template>
    <div class="resource-page">
        <!-- 页面头部 -->
        <div class="resource-header">
            <h2 class="resource-title">内部资源</h2>
            <div class="resource-header-actions">
                <n-input v-model:value="searchKeyword" placeholder="搜索资源组名称" clearable
                    style="width: 240px; margin-right: 8px;" @keyup.enter="handleSearch">
                    <template #prefix>
                        <n-icon>
                            <Search />
                        </n-icon>
                    </template>
                </n-input>
                <n-button type="primary" @click="handleSearch" style="margin-right: 8px;">搜索</n-button>
                <n-button type="primary" @click="openAddModal">
                    <template #icon>
                        <n-icon>
                            <Add />
                        </n-icon>
                    </template>
                    新增资源组
                </n-button>
            </div>
        </div>

        <!-- 资源组列表 -->
        <resource-group-list
            :items="resourceGroupList"
            :loading="loading"
            :finished="finished"
            empty-text="暂无资源组数据"
            finished-text="已加载全部资源组"
            @load-more="loadResourceGroups(true)"
        >
            <template #default="{ item: group }">
                <resource-group-card
                    :group="group"
                    @edit="openEditModal"
                    @delete="handleDelete"
                    @resource-update="handleResourceUpdate"
                />
            </template>
        </resource-group-list>

        <!-- 编辑/新增弹窗 -->
        <resource-group-modal v-model:show="showModal" :is-edit="isEdit" :group-id="currentGroupId"
            @success="handleModalSuccess" />
    </div>
</template>

<script setup>
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { Search, Add } from '@vicons/ionicons5'
import { useMessage, useDialog } from 'naive-ui'
import { 
    NInput, 
    NButton, 
    NIcon
} from 'naive-ui'
import { useResourceGroupListApi, useResourceGroupDeleteApi } from '~/composables/resource'
import ResourceGroupList from '~/components/Resource/ResourceGroupList.vue'
import ResourceGroupCard from '~/components/Resource/ResourceGroupCard.vue'

// 定义 ResourceGroupModal 组件
const ResourceGroupModal = defineAsyncComponent(() => import('./ResourceGroupModal.vue'))

const message = useMessage()
const dialog = useDialog()

// 搜索关键词
const searchKeyword = ref('')

// 资源组列表
const resourceGroupList = ref([])

// 加载状态
const loading = ref(false)
const finished = ref(false)

// 游标分页
const lastId = ref(null)
const pageSize = 10

// 弹窗控制
const showModal = ref(false)
const isEdit = ref(false)
const currentGroupId = ref(null)

// 加载资源组列表
async function loadResourceGroups(isLoadMore = false) {
    if (loading.value) return

    loading.value = true
    try {
        const params = {
            keyword: searchKeyword.value || null,
            lastId: lastId.value,
            pageSize: pageSize
        }
        
        console.log('Loading resource groups with params:', params)
        
        const { data } = await useResourceGroupListApi(params)

        console.log('Received data:', data.value)

        if (data.value) {
            const groups = data.value

            if (isLoadMore) {
                resourceGroupList.value = [...resourceGroupList.value, ...groups]
            } else {
                resourceGroupList.value = groups
            }

            // 判断是否还有更多数据
            if (groups.length < pageSize) {
                finished.value = true
            } else {
                // 更新游标
                lastId.value = groups[groups.length - 1].id
            }
            
            console.log('Current resource group list:', resourceGroupList.value)
        }
    } catch (error) {
        console.error('加载资源组列表失败:', error)
        message.error('加载资源组列表失败')
    } finally {
        loading.value = false
    }
}

// 搜索
function handleSearch() {
    lastId.value = null
    finished.value = false
    resourceGroupList.value = []
    loadResourceGroups(false)
}

// 打开新增弹窗
function openAddModal() {
    isEdit.value = false
    currentGroupId.value = null
    showModal.value = true
}

// 打开编辑弹窗
function openEditModal(group) {
    isEdit.value = true
    currentGroupId.value = group.id
    showModal.value = true
}

// 弹窗成功回调
function handleModalSuccess() {
    message.success(isEdit.value ? '修改成功' : '新增成功')
    lastId.value = null
    finished.value = false
    resourceGroupList.value = []
    loadResourceGroups(false)
}

// 资源更新回调
function handleResourceUpdate() {
    // 重新加载资源组列表以获取最新的资源信息
    lastId.value = null
    finished.value = false
    resourceGroupList.value = []
    loadResourceGroups(false)
    message.success('资源信息已更新')
}

// 删除资源组
function handleDelete(group) {
    dialog.warning({
        title: '确认删除',
        content: `确定要删除资源组"${group.name}"吗？此操作不可恢复。`,
        positiveText: '确定删除',
        negativeText: '取消',
        onPositiveClick: async () => {
            try {
                await useResourceGroupDeleteApi(group.id)
                message.success('删除成功')
                // 重新加载列表
                lastId.value = null
                finished.value = false
                resourceGroupList.value = []
                loadResourceGroups(false)
            } catch (error) {
                console.error('删除失败:', error)
                message.error('删除失败')
            }
        }
    })
}

// 页面加载时初始化
onMounted(() => {
    loadResourceGroups(false)
})
</script>

<style scoped>
.resource-page {
    width: 100%;
    min-height: 60vh;
    padding: 24px;
    background: #f5f7fa;
}

.resource-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.resource-title {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0;
}

.resource-header-actions {
    display: flex;
    align-items: center;
}
</style>
