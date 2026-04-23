import { fetchConfig } from '~/composables/useHttp'

export const BOOK_RESOURCE_TYPE = '电子书'

export const getBookAuthHeaders = () => {
  let tokenValue = ''
  if (process.client) {
    tokenValue = localStorage.getItem('token') || localStorage.getItem('Token') || ''
    if (!tokenValue) {
      try {
        tokenValue = useCookie('token').value || ''
      } catch {}
    }
  }
  return {
    appid: fetchConfig.headers.appid,
    token: tokenValue,
    Authorization: tokenValue ? `Bearer ${tokenValue}` : '',
  }
}

const bookFetch = (url, options = {}) => {
  return $fetch(url, {
    baseURL: fetchConfig.baseURL,
    headers: {
      ...getBookAuthHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  })
}

export async function apiSearchBooks(payload = {}) {
  return bookFetch('/book/search', {
    method: 'POST',
    body: payload,
  })
}

export async function apiGetBookDetail(bookId, params = {}) {
  return bookFetch('/book/getById', {
    method: 'GET',
    params: {
      id: Number(bookId),
      ...params,
    },
  })
}

export async function apiGetBookMenus(bookId) {
  return bookFetch('/book/menus', {
    method: 'GET',
    params: { id: Number(bookId) },
  })
}

export async function apiGetBookChapter(bookId, chapterId) {
  return bookFetch('/book/detail', {
    method: 'GET',
    params: {
      book_id: Number(bookId),
      id: Number(chapterId),
    },
  })
}

export async function apiCreateBook(payload) {
  return bookFetch('/book/create', {
    method: 'POST',
    body: payload,
  })
}

export async function apiUpdateBook(payload) {
  return bookFetch('/book/update', {
    method: 'POST',
    body: payload,
  })
}

export async function apiDeleteBook(bookId) {
  return bookFetch('/book/delete', {
    method: 'DELETE',
    params: { id: Number(bookId) },
  })
}

export async function apiGetBookTags() {
  return bookFetch('/book/getTagList', {
    method: 'GET',
  })
}

export async function apiGetBookRelationStatus(bookId) {
  return bookFetch('/book/relation/status', {
    method: 'GET',
    params: { bookId: Number(bookId) },
  })
}

export async function apiFavoriteBook(bookId, status) {
  return bookFetch('/book/relation/favorite', {
    method: 'POST',
    body: {
      bookId: Number(bookId),
      status: Number(status),
    },
  })
}

export async function apiFollowBook(bookId, status) {
  return bookFetch('/book/relation/follow', {
    method: 'POST',
    body: {
      bookId: Number(bookId),
      status: Number(status),
    },
  })
}

export async function apiUploadBookImage(file, { minute = 120 } = {}) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'image')
  formData.append('preview', 'true')
  formData.append('minute', String(minute))
  return bookFetch('/upload', {
    method: 'POST',
    body: formData,
  })
}

export async function apiGetPreviewUrls(paths, minute = 120) {
  return bookFetch('/upload/preview-urls', {
    method: 'POST',
    body: {
      paths,
      minute,
    },
  })
}

const IMG_SRC_REGEX = /<img\b[^>]*?\bsrc=(["'])(.*?)\1[^>]*>/gi

export function extractImageSrcs(html) {
  if (!html) return []
  IMG_SRC_REGEX.lastIndex = 0
  const srcs = []
  let match
  while ((match = IMG_SRC_REGEX.exec(html)) !== null) {
    if (match[2]) srcs.push(match[2])
  }
  return srcs
}

export function replaceImageSrc(html, oldSrc, newSrc) {
  if (!html || !oldSrc || oldSrc === newSrc) return html
  return html.replaceAll(oldSrc, newSrc)
}

export async function hydrateRelativeImages(html, minute = 120) {
  const srcs = extractImageSrcs(html)
  const relativePaths = [...new Set(srcs.filter((src) => src && !src.startsWith('http') && !src.startsWith('data:')))]
  if (relativePaths.length === 0) return html

  const response = await apiGetPreviewUrls(relativePaths, minute)
  const pathMap = response?.data || response || {}
  let nextHtml = html

  Object.entries(pathMap).forEach(([path, previewUrl]) => {
    nextHtml = replaceImageSrc(nextHtml, path, previewUrl)
  })

  return nextHtml
}
