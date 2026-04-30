// 内部网站数据管理（本地状态，实际项目可替换为API调用）

const STORAGE_KEY = 'osh_internal_sites'

// 默认示例数据
const defaultSites = [
  {
    id: 1,
    name: '后台管理系统',
    url: 'http://localhost:8080',
    category: '管理系统',
    owner: '张三',
    description: '若依后台管理系统，负责内容和用户管理',
    status: 'unknown',
    lastChecked: null,
    createdAt: '2026-01-10 09:00:00',
  },
  {
    id: 2,
    name: 'Elasticsearch',
    url: 'http://43.242.200.25:9200',
    category: '基础设施',
    owner: '李四',
    description: '全文搜索引擎，用于课程和内容检索',
    status: 'unknown',
    lastChecked: null,
    createdAt: '2026-01-10 09:00:00',
  },
  {
    id: 3,
    name: 'Druid 监控',
    url: 'http://localhost:8080/druid',
    category: '监控',
    owner: '王五',
    description: '数据库连接池监控面板',
    status: 'unknown',
    lastChecked: null,
    createdAt: '2026-01-10 09:00:00',
  },
]

// 读取本地存储
function loadSites() {
  if (process.server) return [...defaultSites]
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : [...defaultSites]
  } catch {
    return [...defaultSites]
  }
}

// 保存到本地存储
function saveSites(sites) {
  if (process.server) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sites))
}

// 全局状态
export const useInternalSites = () => useState('internalSites', () => loadSites())

// 生成ID
function genId(sites) {
  return sites.length > 0 ? Math.max(...sites.map(s => s.id)) + 1 : 1
}

// 格式化时间
function nowStr() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
}

// 新增
export function useAddSite(form) {
  const sites = useInternalSites()
  const newSite = {
    ...form,
    id: genId(sites.value),
    status: 'unknown',
    lastChecked: null,
    createdAt: nowStr(),
  }
  sites.value = [newSite, ...sites.value]
  saveSites(sites.value)
  return newSite
}

// 更新
export function useUpdateSite(id, form) {
  const sites = useInternalSites()
  sites.value = sites.value.map(s =>
    s.id === id ? { ...s, ...form } : s
  )
  saveSites(sites.value)
}

// 删除
export function useDeleteSite(id) {
  const sites = useInternalSites()
  sites.value = sites.value.filter(s => s.id !== id)
  saveSites(sites.value)
}

// 更新单个站点状态
export function useUpdateSiteStatus(id, status) {
  const sites = useInternalSites()
  sites.value = sites.value.map(s =>
    s.id === id ? { ...s, status, lastChecked: nowStr() } : s
  )
  saveSites(sites.value)
}

// 检查单个站点状态（通过 img 探测，跨域友好）
export async function checkSiteStatus(site) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => resolve('offline'), 5000)
    const img = new Image()
    img.onload = () => { clearTimeout(timeout); resolve('online') }
    img.onerror = () => {
      // onerror 也可能是跨域导致的，说明服务器有响应
      clearTimeout(timeout)
      resolve('online')
    }
    // 加时间戳防缓存
    img.src = site.url + '/favicon.ico?_t=' + Date.now()
  })
}
