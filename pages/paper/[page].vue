<template>
  <n-grid :x-gap="20">
    <n-grid-item :span="18">
      <ClientOnly>
        <div v-if="showExamAdminBar" class="exam-admin-bar">
          <n-button v-if="canExamCreate" class="btn-create-exam" size="small" @click="openCreateExam">
            + 新增考试
          </n-button>
        </div>
      </ClientOnly>
      <LoadingGroup :pending="pending" :error="error" :is-empty="rows.length === 0">
        <TestpaperList
          v-for="item in rows"
          :key="item.id"
          :item="item"
          :can-edit="canExamEdit"
          :can-delete="canExamDelete"
          @edit="openEditExam"
          @delete="confirmDeleteExam"
        />
        <div class="pagination-wrapper">
          <n-pagination
            size="large"
            :page="page"
            :item-count="total"
            :page-size="limit"
            :on-update:page="handlePageChange"
          />
        </div>
      </LoadingGroup>
      <ExamEditModal
        v-model:show="examModalVisible"
        :init-data="examModalInit"
        :tag-options="examTagOptions"
        @success="onExamSaved"
      />
    </n-grid-item>
    <n-grid-item :span="6">
      <HotCourseList />
    </n-grid-item>
  </n-grid>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { NButton, NGrid, NGridItem, NPagination, createDiscreteApi } from 'naive-ui'
import ExamEditModal from '~/components/Exam/ExamEditModal.vue'
import { usePermission } from '~/composables/usePermission'
import { canManageExamByRoleLevel } from '~/composables/useAuth'
import { apiDeleteExam, apiGetExamTags } from '~/composables/Api/Exam/exam'

const route = useRoute()
const { hasPermission } = usePermission()

const canExamCreate = computed(
  () => hasPermission('exam:create') || canManageExamByRoleLevel()
)
const canExamEdit = computed(
  () => hasPermission('exam:update') || canManageExamByRoleLevel()
)
const canExamDelete = computed(
  () => hasPermission('exam:delete') || canManageExamByRoleLevel()
)
const showExamAdminBar = computed(
  () => canExamCreate.value || canExamEdit.value || canExamDelete.value
)

const {
  page,
  limit,
  total,
  handlePageChange,
  rows,
  pending,
  error,
  refresh,
} = await usePage(({ pageNum, pageSize }) => {
  return useListApi('testpaper', { pageNum, pageSize })
})

const examModalVisible = ref(false)
const examModalInit = ref(null)
const examTagOptions = ref([])

async function loadExamTagOptions() {
  if (!showExamAdminBar.value) return
  try {
    const res = await apiGetExamTags()
    const list = res?.code === 200 ? res.data || [] : []
    examTagOptions.value = list.map((t) => ({
      label: t.name != null ? String(t.name) : String(t.id ?? ''),
      value: t.name != null ? t.name : t.id,
    }))
  } catch {
    examTagOptions.value = []
  }
}

watch(
  showExamAdminBar,
  (v) => {
    if (v && process.client) loadExamTagOptions()
  },
  { immediate: true }
)

function openCreateExam() {
  examModalInit.value = null
  examModalVisible.value = true
}

function openEditExam(item) {
  examModalInit.value = item ? { ...item } : null
  examModalVisible.value = true
}

async function onExamSaved() {
  examModalInit.value = null
  await refresh()
}

function confirmDeleteExam(item) {
  const { dialog, message } = createDiscreteApi(['dialog', 'message'])
  dialog.warning({
    title: '确认删除',
    content: `确定删除试卷「${item.title}」？删除后不可恢复。`,
    positiveText: '删除',
    negativeText: '取消',
    async onPositiveClick() {
      try {
        const res = await apiDeleteExam(item.id)
        if (res?.code === 200) {
          message.success('删除成功')
          await refresh()
          return true
        }
        message.error(res?.msg || '删除失败')
        return true
      } catch (e) {
        message.error(e?.data?.msg || e?.message || '删除失败')
        return true
      }
    },
  })
}

useHead({
  title: '考试列表',
})
</script>

<style scoped>
.exam-admin-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.75rem;
}

.btn-create-exam {
  border-radius: 6px;
  font-weight: 500;
  border: 1px solid #18a058;
  color: #18a058;
  background: #fff;
}
.btn-create-exam:hover {
  background: #18a058;
  color: #fff;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.25rem;
  margin-bottom: 2.5rem;
}

.x-gap-20 {
  column-gap: 1.25rem;
}

.span-18 {
  flex: 0 0 75%;
}

.span-6 {
  flex: 0 0 25%;
}
</style>
