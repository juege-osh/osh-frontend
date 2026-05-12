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
  }
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

// 管理员权限判断（基于用户等级或权限列表）
// 优先级：
// 1. 如果用户对象中有 level/userLevel 字段，使用字段值判断
// 2. 否则使用权限列表判断（有 group:* 或 * 权限视为管理员）
export function useHasGroupAdminPermission() {
    const user = useUser()
    const permissions = usePermissions()
    
    return computed(() => {
        // 未登录用户没有权限
        if (!user.value) {
            if (process.client) {
                console.log('[useHasGroupAdminPermission] 用户未登录')
            }
            return false
        }
        
        // 方式1：尝试从用户对象获取等级字段
        const userLevel = user.value?.userLevel ?? 
                         user.value?.level ?? 
                         user.value?.role ?? 
                         user.value?.type ?? 
                         user.value?.user_type ?? 
                         null
        
        // 如果有等级字段，使用等级判断
        if (userLevel !== null && userLevel !== undefined) {
            const isAdmin = userLevel <= 2
            if (process.client) {
                console.log('=== 管理员权限检查（使用等级字段）===')
                console.log('userLevel:', userLevel)
                console.log('isAdmin:', isAdmin)
            }
            return isAdmin
        }
        
        // 方式2：使用权限列表判断
        const permList = Array.isArray(permissions.value) ? permissions.value : []
        
        // 如果有超级管理员权限（* 或 *:*:*）
        if (permList.includes('*') || permList.includes('*:*:*')) {
            if (process.client) {
                console.log('=== 管理员权限检查（使用权限列表-超级管理员）===')
                console.log('permissions:', permList)
                console.log('isAdmin: true (超级管理员)')
            }
            return true
        }
        
        // 如果有拼团管理权限（group:* 或 group:admin）
        const hasGroupPermission = permList.some(perm => 
            perm === 'group:*' || 
            perm === 'group:admin' || 
            (typeof perm === 'string' && perm.startsWith('group:'))
        )
        
        if (process.client) {
            console.log('=== 管理员权限检查（使用权限列表）===')
            console.log('permissions:', permList)
            console.log('hasGroupPermission:', hasGroupPermission)
            console.log('isAdmin:', hasGroupPermission)
        }
        
        return hasGroupPermission
    })
}

// 兼容旧版本：useIsAdmin 映射到 useHasGroupAdminPermission
export function useIsAdmin() {
    return useHasGroupAdminPermission()
}

// 检查管理员权限（带提示）
export function useCheckAdmin(callback) {
    const { message } = createDiscreteApi(['message'])
    const hasPermission = useHasGroupAdminPermission()
    
    if (!hasPermission.value) {
        message.error("需要管理员权限才能操作（用户等级需 ≤ 2）")
        return false
    }
    
    if (callback && typeof callback === "function") {
        callback()
        return true
    }
    
    return true
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