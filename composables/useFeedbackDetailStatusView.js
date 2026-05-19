import { computed } from 'vue'
import { resolveFeedbackStatusText } from '~/composables/assistant'

export function useFeedbackDetailStatusView(detail) {
  // 进度条：已受理合并入处理中，只保留 4 个节点
  const statusSteps = [
    { label: '已提交', value: 'PENDING' },
    { label: '处理中', value: 'PROCESSING' },
    { label: '待确认', value: 'PENDING_CONFIRM' },
    { label: '已解决', value: 'RESOLVED' }
  ]

  const currentStepIndex = computed(() => {
    const currentStatus = detail.value?.status
    if (currentStatus === 'PENDING') return 0
    // TRIAGED 历史数据兼容：显示在处理中节点
    if (currentStatus === 'TRIAGED' || currentStatus === 'PROCESSING' || currentStatus === 'REOPENED') return 1
    if (currentStatus === 'PENDING_CONFIRM') return 2
    if (currentStatus === 'RESOLVED' || currentStatus === 'CLOSED' || currentStatus === 'REJECTED') return 3
    return 0
  })

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
        // logType 同时驱动时间轴圆点颜色和状态 tag 颜色，必须与全局状态色盘保持一致
        let logType = 'operation'
        if (record.toStatus === 'CLOSED' || record.toStatus === 'REJECTED') {
          logType = 'close'
        } else if (record.toStatus === 'RESOLVED') {
          logType = 'resolve'
        } else if (record.toStatus === 'PENDING_CONFIRM') {
          logType = 'pending'
        } else if (record.toStatus === 'REOPENED') {
          logType = 'reopen'
        }

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
        { label: '开始处理', value: 'PROCESSING', type: 'primary', placeholder: '请输入处理说明' }
      ]
    }
    // TRIAGED 历史数据兼容：和 PENDING 一样，允许直接推进到 PROCESSING
    if (currentStatus === 'TRIAGED') {
      return [
        { label: '关闭', value: 'CLOSED', type: 'default', placeholder: '请输入关闭原因' },
        { label: '驳回', value: 'REJECTED', type: 'warning', placeholder: '请输入驳回原因' },
        { label: '开始处理', value: 'PROCESSING', type: 'primary', placeholder: '请输入处理说明' }
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
        { label: '继续处理', value: 'PROCESSING', type: 'primary', placeholder: '请输入继续处理说明，处理完成后可再次提交用户确认' }
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
