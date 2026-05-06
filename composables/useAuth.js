import { createDiscreteApi } from "naive-ui";
           
const { message } = createDiscreteApi(["message"])

export const useUser = ()=> useState("user",()=>null)

// 权限列表：优先从 localStorage 读，保证刷新后不丢失
export const usePermissions = () => {
  const state = useState("permissions", () => {
    if (process.client) {
      try {
        const stored = localStorage.getItem('__permissions__')
        return stored ? JSON.parse(stored) : []
      } catch { return [] }
    }
    return []
  })
  return state
}

// 保存权限到 localStorage
export const savePermissions = (list) => {
  if (process.client) {
    try {
      localStorage.setItem('__permissions__', JSON.stringify(list || []))
    } catch {}
  }
}

// 清除权限
export const clearPermissions = () => {
  if (process.client) {
    localStorage.removeItem('__permissions__')
    localStorage.removeItem('__user_role__')
  }
}

export const clearAuthState = () => {
  const user = useUser()
  user.value = null

  const token = useCookie("token")
  token.value = null

  if (process.client) {
    localStorage.removeItem('token')
    localStorage.removeItem('Token')
  }

  clearPermissions()
  const permissions = usePermissions()
  permissions.value = []
}

let authExpiredHandling = false

export const handleAuthExpired = (redirectTo = null, tip = "登录已过期，请重新登录") => {
  if (!process.client) return
  // 并发请求同时失效时，只处理一次，避免重复弹错和重复跳转。
  if (authExpiredHandling) return
  authExpiredHandling = true

  clearAuthState()
  message.error(tip)

  const currentPath = window.location.pathname + window.location.search
  const target = redirectTo || `/login?from=${encodeURIComponent(currentPath)}`

  window.location.href = target
}

// 更新用户信息
export async function useRefreshUserInfo(){
    const token = useCookie("token")
    const user = useUser()
    // 用户已登录，直接获取用户信息
    if(token.value){
        let {
            data,
            error
        } = await useGetinfoApi()

        if(data.value){
            // 合并数据，保留 permissionList 等登录时存的字段
            user.value = {
                ...user.value,
                ...data.value,
            }
        }
    }
}

// 退出登录
export async function useLogout(){
    await useLogoutApi()
    const user = useUser()
    user.value = null
    const token = useCookie("token")
    token.value = null
    // 清除权限缓存
    clearPermissions()
    const permissions = usePermissions()
    permissions.value = []
    // 断开 WebSocket 连接并清空通知
    if (process.client) {
        const { disconnect, clearAll } = useWebSocket()
        disconnect()
        clearAll()
    }
    message.success("退出登录成功")
    // 强制跳转首页并刷新，确保内存状态完全清除
    if (process.client) {
        window.location.href = '/'
    }
}

// 登录并且绑定手机号之后才能操作
export function useHasAuth(callback = null){
    const route = useRoute()
    const token = useCookie("token")
    const user = useUser()
    // 未登录
    if(!token.value){
        message.error("请先登录")
        return navigateTo("/login?from="+route.fullPath)
    }

    // 未绑定手机号 
    // const phone = user.value?.phone
    // if(!phone && route.name != 'bindphone'){
    //     message.error("请先绑定手机号")
    //     return navigateTo("/bindphone?from="+route.fullPath)
    // }

    if(callback && typeof callback === "function"){
        callback()
    }
}

// 点赞/取消点赞
export function useHandleSupportPost(){
    const supportLoading = ref(false)
    // 点赞/取消点赞
    const handleSupport = (item)=>{
        useHasAuth(async ()=>{
            // 行为判断
            let type = item.issupport ? 'unsupport' : 'support'
            let msg = item.issupport ? '取消点赞' : '点赞'

            supportLoading.value = true

            const {
                error
            } = await usePostSupportApi(item.id,type)

            supportLoading.value = false

            // 操作失败，直接返回
            if(error.value) return

            // 点赞数 +1/-1
            if(type === 'unsupport'){
                item.support_count--
            } else {
                item.support_count++
            }

            item.issupport = !item.issupport


            message.success(msg + '成功')
        })
    }

    return {
        supportLoading,
        handleSupport
    }
}
