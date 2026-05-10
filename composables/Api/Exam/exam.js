/**
 * 考试模块 API
 */
import { fetchConfig } from '~/composables/useHttp'

const EXAM_BASE = fetchConfig.baseURL

const examHeaders = () => {
  let tokenValue = ''
  if (process.client) {
    tokenValue = localStorage.getItem('token') || localStorage.getItem('Token') || ''
    if (!tokenValue) {
      try { tokenValue = useCookie('token').value || '' } catch {}
    }
  }
  return {
    appid: fetchConfig.headers.appid,
    token: tokenValue,
    Authorization: tokenValue ? `Bearer ${tokenValue}` : '',
  }
}

const examFetch = (url, options = {}) =>
  $fetch(url, {
    baseURL: EXAM_BASE,
    headers: { ...examHeaders(), ...(options.headers || {}) },
    ...options,
  })

/** 考试列表（POST /pc/exam/search） */
export async function apiSearchExams(payload = {}) {
  return examFetch('/exam/search', { method: 'POST', body: payload })
}

/** 开始考试 - 获取试卷详情（GET /pc/testpaper/read?id=xxx） */
export async function apiReadExam(id) {
  return examFetch('/testpaper/read', { method: 'GET', params: { id } })
}

/** 提交答卷（POST /pc/user_test/save） */
export async function apiSubmitExam(payload) {
  return examFetch('/user_test/save', { method: 'POST', body: payload })
}

/** 我的考试记录（GET /pc/user_test/list） */
export async function apiMyExamRecords(page = 1) {
  return examFetch('/user_test/list', { method: 'GET', params: { page } })
}

/** 新增/修改考试（POST /pc/exam/save） */
export async function apiSaveExam(payload) {
  return examFetch('/exam/save', { method: 'POST', body: payload })
}

/** 删除考试（POST /pc/exam/delete?id=xxx） */
export async function apiDeleteExam(id) {
  return examFetch('/exam/delete', { method: 'POST', params: { id } })
}

/** 保存题目（POST /pc/exam/question/save） */
export async function apiSaveExamQuestion(payload) {
  return examFetch('/exam/question/save', { method: 'POST', body: payload })
}

/** 删除题目（POST /pc/exam/question/delete?id=&examId=） */
export async function apiDeleteExamQuestion(id, examId) {
  return examFetch('/exam/question/delete', { method: 'POST', params: { id, examId } })
}

/** 收藏/取消收藏（POST /pc/exam/collect?examId=xxx） */
export async function apiToggleCollect(examId) {
  return examFetch('/exam/collect', { method: 'POST', params: { examId } })
}

/** 标签列表（GET /pc/exam/tag/list） */
export async function apiGetExamTags() {
  return examFetch('/exam/tag/list', { method: 'GET' })
}
