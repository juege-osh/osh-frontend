<template>
    <n-modal v-model:show="showModal" :mask-closable="false" preset="card" :title="modalTitle" style="width: 800px;">
        <n-form ref="formRef" :model="formData" :rules="formRules" label-placement="left" label-width="100">
            <n-form-item label="资源组名称" path="name">
                <n-input v-model:value="formData.name" placeholder="请输入资源组名称" maxlength="200" show-count />
            </n-form-item>

            <n-form-item label="资源组描述" path="description">
                <n-input v-model:value="formData.description" type="textarea" placeholder="请输入资源组描述（可选）"
                    maxlength="1000" show-count :autosize="{ minRows: 3, maxRows: 6 }" />
            </n-form-item>

            <n-form-item label="关联链接" path="links">
                <div style="width: 100%;">
                    <!-- 链接输入区域 -->
                    <div class="quick-link-list">
                        <div v-for="(link, index) in newLinks" :key="index" class="quick-link-item">
                            <div style="flex: 0 0 150px;">
                                <n-input v-model:value="link.name" placeholder="链接名称" size="small" 
                                    :status="linkErrors[index]?.name ? 'error' : undefined" />
                                <span v-if="linkErrors[index]?.name" class="inline-error">{{ linkErrors[index].name }}</span>
                            </div>
                            <div style="flex: 1;">
                                <n-input v-model:value="link.url" placeholder="跳转地址（https://...）" size="small" 
                                    :status="linkErrors[index]?.url ? 'error' : undefined" />
                                <span v-if="linkErrors[index]?.url" class="inline-error">{{ linkErrors[index].url }}</span>
                            </div>
                            <n-input v-model:value="link.remark" placeholder="备注（可选）" size="small" style="flex: 0 0 120px;" />
                            <n-tooltip trigger="hover" placement="top">
                                <template #trigger>
                                    <n-button 
                                        size="small" 
                                        type="primary" 
                                        quaternary
                                        circle
                                        @click="handleAddLink(index)" 
                                        style="flex-shrink: 0;"
                                    >
                                        <template #icon>
                                            <n-icon>
                                                <Add />
                                            </n-icon>
                                        </template>
                                    </n-button>
                                </template>
                                新增此链接并添加下一行
                            </n-tooltip>
                            <n-tooltip v-if="newLinks.length > 1" trigger="hover" placement="top">
                                <template #trigger>
                                    <n-button 
                                        size="small" 
                                        quaternary 
                                        type="error"
                                        circle
                                        @click="removeNewLink(index)"
                                        style="flex-shrink: 0;"
                                    >
                                        <template #icon>
                                            <n-icon>
                                                <TrashOutline />
                                            </n-icon>
                                        </template>
                                    </n-button>
                                </template>
                                删除此行
                            </n-tooltip>
                        </div>
                    </div>
                </div>
            </n-form-item>

            <n-form-item label="备注" path="remark">
                <n-input v-model:value="formData.remark" type="textarea" placeholder="请输入备注（可选）" maxlength="500"
                    show-count :autosize="{ minRows: 2, maxRows: 4 }" />
            </n-form-item>
        </n-form>

        <template #footer>
            <n-space justify="end">
                <n-button @click="showModal = false">取消</n-button>
                <n-button type="primary" @click="handleSubmit" :loading="submitting">确定</n-button>
            </n-space>
        </template>
    </n-modal>
</template>

<script setup>
import {
    NInput, NButton, NTooltip,
    NModal, NSpace, NForm, NFormItem,
    NIcon
} from 'naive-ui'
import { ref, computed, watch } from 'vue'
import { Add, TrashOutline } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import {
    useResourceGroupDetailApi,
    useResourceGroupAddApi,
    useResourceGroupUpdateApi,
    useLinkAddApi
} from '~/composables/resource'

const props = defineProps({
    show: {
        type: Boolean,
        default: false
    },
    isEdit: {
        type: Boolean,
        default: false
    },
    groupId: {
        type: Number,
        default: null
    }
})

const emit = defineEmits(['update:show', 'success'])

const message = useMessage()

const showModal = computed({
    get: () => props.show,
    set: (val) => emit('update:show', val)
})

const modalTitle = computed(() => props.isEdit ? '编辑资源组' : '新增资源组')

// 表单相关
const formRef = ref(null)
const submitting = ref(false)

const formData = ref({
    id: null,
    name: '',
    description: '',
    remark: '',
    links: []  // 存储链接数据
})

const formRules = {
    name: [
        { required: true, message: '请输入资源组名称', trigger: 'blur' },
        { max: 200, message: '资源组名称不能超过200个字符', trigger: 'blur' }
    ]
}

// 链接输入行（支持多行）
const newLinks = ref([
    { name: '', url: '', remark: '' }
])

// 链接校验错误信息
const linkErrors = ref([{}])

// 新增链接（验证后添加新行）
function handleAddLink(index) {
    const link = newLinks.value[index]
    const errors = {}
    
    // 验证当前行（不触发整个资源组表单校验）
    if (!link.name || !link.name.trim()) {
        errors.name = '请输入链接名称'
    }
    if (!link.url || !link.url.trim()) {
        errors.url = '请输入跳转地址'
    } else if (!/^https?:\/\/.+/.test(link.url)) {
        errors.url = '链接地址格式不正确'
    }
    
    // 如果有错误，显示并返回
    if (Object.keys(errors).length > 0) {
        linkErrors.value[index] = errors
        return
    }
    
    // 清除错误
    linkErrors.value[index] = {}
    
    // 验证通过，添加新行
    newLinks.value.push({ name: '', url: '', remark: '' })
    linkErrors.value.push({})
}

// 删除行
function removeNewLink(index) {
    if (newLinks.value.length > 1) {
        newLinks.value.splice(index, 1)
        linkErrors.value.splice(index, 1)
    }
}

// 加载资源组详情（编辑模式）
async function loadGroupDetail() {
    if (!props.isEdit || !props.groupId) return

    try {
        const { data } = await useResourceGroupDetailApi(props.groupId)
        if (data.value) {
            const group = data.value
            formData.value = {
                id: group.id,
                name: group.name || '',
                description: group.description || '',
                remark: group.remark || '',
                links: group.links || []
            }

            // 加载已有链接到输入行
            if (group.links && group.links.length > 0) {
                newLinks.value = group.links.map(l => ({
                    id: l.id,
                    name: l.name || '',
                    url: l.url || '',
                    remark: l.remark || ''
                }))
                linkErrors.value = group.links.map(() => ({}))
            } else {
                newLinks.value = [{ name: '', url: '', remark: '' }]
                linkErrors.value = [{}]
            }
        }
    } catch (error) {
        console.error('加载资源组详情失败:', error)
        message.error('加载资源组详情失败')
    }
}

// 提交表单
async function handleSubmit() {
    try {
        await formRef.value?.validate()
    } catch {
        return
    }

    submitting.value = true
    try {
        // 过滤出有效的链接（有名称和URL）
        const validLinks = newLinks.value.filter(link => 
            link.name && link.name.trim() && link.url && link.url.trim()
        )

        // 验证链接格式
        for (const link of validLinks) {
            if (!/^https?:\/\/.+/.test(link.url)) {
                message.error(`链接 "${link.name}" 的地址格式不正确，请以 http:// 或 https:// 开头`)
                submitting.value = false
                return
            }
        }

        const submitData = {
            name: formData.value.name,
            description: formData.value.description,
            remark: formData.value.remark,
            links: validLinks  // 传入链接数组
        }

        if (props.isEdit) {
            submitData.id = formData.value.id
            await useResourceGroupUpdateApi(submitData)
        } else {
            await useResourceGroupAddApi(submitData)
        }

        // 不显示成功提示，由父组件统一处理
        showModal.value = false
        emit('success')
    } catch (error) {
        console.error('提交失败:', error)
        message.error(props.isEdit ? '修改失败' : '新增失败')
    } finally {
        submitting.value = false
    }
}

// 重置表单
function resetForm() {
    formData.value = {
        id: null,
        name: '',
        description: '',
        remark: '',
        links: []
    }
    newLinks.value = [{ name: '', url: '', remark: '' }]
    linkErrors.value = [{}]
}

// 监听弹窗显示状态
watch(() => props.show, (val) => {
    if (val) {
        if (props.isEdit) {
            loadGroupDetail()
        } else {
            resetForm()
        }
    }
})
</script>

<style scoped>
/* 快速新增链接列表 */
.quick-link-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.quick-link-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

/* 内联错误提示 */
.inline-error {
    font-size: 12px;
    color: #d03050;
    line-height: 1.4;
    margin-top: 4px;
    display: block;
    min-height: 0;
}
</style>
