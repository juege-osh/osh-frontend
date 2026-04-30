export async function usePage(initListApiCallback,initialSearchParams){
    // 获取路由参数中的 page 和 limit   1 10
    const route = useRoute()
    const page = ref(parseInt(route.params.page))
    const limit = ref(12)

        // 兼容后端的接口 records 和 total
    const rows = computed(()=>data.value?.rows ?? data.value?.records ?? [])
    const total = computed(()=>data.value?.count ?? data.value?.total ?? 0)

    
    const {
        data,
        pending,
        error,
        refresh
    } = await initListApiCallback({
         // 映射为后端要求的字段名
        pageNum:page.value,
        pageSize:limit.value,
        ...initialSearchParams
    })

    const handlePageChange = (p)=>{
        navigateTo({
            params:{
                ...route.params,
                page:p
            },
            query:{
                ...route.query
            }
        })
    }

    // 此处传给 const { }
    return {
        page,
        limit,
        data,
        pending,
        error,
        refresh,
        rows,
        total,
        handlePageChange,
    }
}