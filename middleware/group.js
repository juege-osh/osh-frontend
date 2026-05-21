// 拼团模块中间件
export default defineNuxtRouteMiddleware((to, from) => {
    const routeName = to.name
    
    // 拼团活动列表页
    if (routeName === 'group') {
        to.meta.title = '拼团活动'
        useHead({ title: '拼团活动' })
        return
    }
    
    // 我的拼团页
    if (routeName === 'group-my') {
        to.meta.title = '我的拼团'
        useHead({ title: '我的拼团' })
        return
    }
    
    // 拼团详情页
    if (routeName === 'group-work-id') {
        to.meta.title = '拼团详情'
        useHead({ title: '拼团详情' })
        return
    }
})
