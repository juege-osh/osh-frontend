import { computed } from 'vue'
import {
  FEEDBACK_STATUS_CONFIG,
  resolveFeedbackStatusText,
  resolveFeedbackStatusStepIndex,
  resolveFeedbackStatusTone
} from '~/composables/assistant'

export function useFeedbackDetailStatusView(detail) {
  // 进度条节点：从配置中提取 stepIndex >= 0 的状态，按顺序排列，去重
  const statusSteps = Object.entries(FEEDBACK_STATUS_CONFIG)
    .filter(([, cfg]) => cfg.stepIndex >= 0)
    .reduce((acc, [value, cfg]) => {
      if (!acc.some(s => s.stepIndex === cfg.stepIndex)) {
        acc.push({ label: cfg.label, value, stepIndex: cfg.stepIndex })
      }
      return acc
    }, [])
    .sort((a, b) => a.stepIndex - b.stepIndex)

  const currentStepIndex = computed(() => resolveFeedbackStatusStepIndex(detail.value?.status))

  const isFeedbackClosed = computed(() => {
    return ['CLOSED', 'RESOLVED', 'REJECTED'].includes(detail.value?.status)
  })

  const operationLogs = computed(() => {
    const submitterName = detail.value?.userName || ''

    /** 将操作人名称规范化：提交人用"提交人"，其余原样显示 */
    const resolveOperatorLabel = (operatorName) => {
      const name = operatorName || '系统'
      return submitterName && name === submitterName ? '提交人' : name
    }

    if (detail.value?.processRecords?.length) {
      return detail.value.processRecords.map(record => {
        const operator = resolveOperatorLabel(record.operatorName)
        if (!record.fromStatus) {
          return {
            text: `【${operator}】提交了反馈`,
            time: formatAbsoluteTime(record.createTime),
            type: 'system',
            remark: record.remark,
            recordId: record.id,
            toStatus: null,
            toStatusText: null
          }
        }

        const toText = resolveFeedbackStatusText(record.toStatus)
        const logType = resolveFeedbackStatusTone(record.toStatus)

        return {
          text: `【${operator}】变更为`,
          time: formatAbsoluteTime(record.createTime),
          type: logType,
          remark: record.remark,
          recordId: record.id,
          toStatus: record.toStatus,
          toStatusText: toText
        }
      })
    }

    return [{
      text: '【系统】创建反馈',
      time: formatAbsoluteTime(detail.value?.createTime),
      type: 'system',
      toStatus: null,
      toStatusText: null
    }]
  })

  const availableStatusActions = computed(() => {
    const currentStatus = detail.value?.status
    if (currentStatus === 'PENDING') {
      return [
        { label: '关闭', value: 'CLOSED', type: 'default', placeholder: '请输入关闭原因' },
        { label: '驳回', value: 'REJECTED', type: 'warning', placeholder: '请输入驳回原因' },
        { label: '开始处理', value: 'PROCESSING', type: 'primary', placeholder: '请输入处理说明' },
        { label: '提交用户确认', value: 'PENDING_CONFIRM', type: 'primary', placeholder: '问题已处理完成，请输入说明，将通知用户确认是否已解决' }
      ]
    }
    // TRIAGED 历史数据兼容：和 PENDING 一样，允许直接推进到 PROCESSING 或 PENDING_CONFIRM
    if (currentStatus === 'TRIAGED') {
      return [
        { label: '关闭', value: 'CLOSED', type: 'default', placeholder: '请输入关闭原因' },
        { label: '驳回', value: 'REJECTED', type: 'warning', placeholder: '请输入驳回原因' },
        { label: '开始处理', value: 'PROCESSING', type: 'primary', placeholder: '请输入处理说明' },
        { label: '提交用户确认', value: 'PENDING_CONFIRM', type: 'primary', placeholder: '问题已处理完成，请输入说明，将通知用户确认是否已解决' }
      ]
    }
    if (currentStatus === 'PROCESSING') {
      return [
        { label: '关闭', value: 'CLOSED', type: 'default', placeholder: '请输入关闭原因' },
        { label: '驳回', value: 'REJECTED', type: 'warning', placeholder: '请输入驳回原因' },
        { label: '提交用户确认', value: 'PENDING_CONFIRM', type: 'primary', placeholder: '请输入说明，将通知用户确认问题是否已解决' }
      ]
    }
    if (currentStatus === 'REOPENED') {
      return [
        { label: '关闭', value: 'CLOSED', type: 'default', placeholder: '请输入关闭原因' },
        { label: '驳回', value: 'REJECTED', type: 'warning', placeholder: '请输入驳回原因' },
        { label: '开始处理', value: 'PROCESSING', type: 'primary', placeholder: '请输入继续处理说明，处理完成后可再次提交用户确认' },
        { label: '提交用户确认', value: 'PENDING_CONFIRM', type: 'primary', placeholder: '问题已处理完成，请输入说明，将通知用户确认是否已解决' }
      ]
    }
    return []
  })

  return {
    statusSteps,
    currentStepIndex,
    isFeedbackClosed,
    operationLogs,
    availableStatusActions
  }
}

function formatAbsoluteTime(time) {
  if (!time) {
    return ''
  }
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
