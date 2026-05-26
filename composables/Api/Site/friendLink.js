/**
 * 友情链接 API
 */
import { fetchConfig } from '~/composables/useHttp'

const BASE = fetchConfig.baseURL

function getAuthHeaders() {
    const headers = { appid: fetchConfig.headers.appid }
    if (process.client) {
        let token = ''
        try { token = useCookie('token').value || '' } catch {}
        if (!token) {
            token = localStorage.getItem('token') || localStorage.getItem('Token') || ''
        }
        if (token) {
            headers.token = token
            headers.Authorization = `Bearer ${token}`
        }
    }
    return headers
}

/** 获取友情链接列表（匿名） */
export function apiFetchFriendLinks() {
    return $fetch(`${BASE}/site/friend-link/list`, {
        method: 'GET',
        headers: { appid: fetchConfig.headers.appid }
    })
}

/** 保存友情链接（管理员） */
export function apiSaveFriendLinks(links) {
    return $fetch(`${BASE}/site/friend-link/save`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: links
    })
}
