<template>
  <div>
    <div class="settings-wrap">
      <div class="settings-panel">
        <div class="panel-title">检查任务配置</div>
        <n-form label-placement="left" label-width="120">
          <n-form-item label="检查间隔">
            <n-input-number
              v-model:value="config.interval"
              :min="10"
              :max="3600"
              style="width:160px"
            />
            <span style="margin-left:8px;color:#6b7280;font-size:13px">秒</span>
          </n-form-item>
          <n-form-item label="超时时间">
            <n-input-number
              v-model:value="config.timeout"
              :min="1"
              :max="30"
              style="width:160px"
            />
            <span style="margin-left:8px;color:#6b7280;font-size:13px">秒</span>
          </n-form-item>
          <n-form-item label="离线提醒">
            <n-switch v-model:value="config.alertOffline" />
            <span style="margin-left:8px;color:#6b7280;font-size:13px">检测到离线时弹出提醒</span>
          </n-form-item>
          <n-form-item label="自动检查">
            <n-switch v-model:value="config.autoCheck" />
            <span style="margin-left:8px;color:#6b7280;font-size:13px">进入页面时自动执行检查</span>
          </n-form-item>
        </n-form>
        <div style="margin-top:16px">
          <n-button type="primary" @click="saveConfig">保存配置</n-button>
        </div>
      </div>

      <div class="settings-panel danger-zone">
        <div class="panel-title danger">危险操作</div>
        <p style="font-size:13px;color:#6b7280;margin-bottom:16px">以下操作不可恢复，请谨慎操作。</p>
        <n-button type="error" secondary @click="confirmClear">清空所有网站数据</n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { NForm, NFormItem, NInputNumber, NSwitch, NButton, createDiscreteApi } from 'naive-ui'

definePageMeta({ layout: 'internal' })

const config = reactive({
  interval: 60,
  timeout: 5,
  alertOffline: true,
  autoCheck: true,
})

function saveConfig() {
  const { message } = createDiscreteApi(['message'])
  message.success('配置已保存')
}

function confirmClear() {
  const { dialog } = createDiscreteApi(['dialog'])
  dialog.error({
    title: '确认清空',
    content: '将删除所有网站记录，此操作不可恢复！',
    positiveText: '确认清空',
    negativeText: '取消',
    onPositiveClick: () => {
      const sites = useInternalSites()
      sites.value = []
      if (process.client) localStorage.removeItem('osh_internal_sites')
      const { message } = createDiscreteApi(['message'])
      message.success('已清空')
    },
  })
}
</script>

<style scoped>
.settings-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
}
.settings-panel {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}
.panel-title.danger { color: #d03050; }
.danger-zone { border: 1px solid #fde8ec; }
</style>
