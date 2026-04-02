export async function usePage(initListApiCallback){
    const route = useRoute()
    const page = ref(parseInt(route.params.page))
    const limit = ref(10)

    const {
        data,
        pending,
        error,
        refresh
    } = await initListApiCallback({
        page:page.value,
        limit:limit.value
    })

    // 兼容后端的接口 records 和 total
    const rows = computed(()=>data.value?.rows ?? data.value?.records ?? [])
    const total = computed(()=>data.value?.count ?? data.value?.total ?? 0)

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

    return {
        page,
        limit,
        data,
        pending,
        error,
        refresh,
        rows,
        total,
        handlePageChange
    }
}