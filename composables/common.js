export function useSearchListApi(query){
    return useHttpGet("searchList",()=>{
        let q = useQueryToString(query())
        return `/search${q}`
    },{
        lazy:true
    })
}

// 获取可用优惠券列表
export function useCouponListApi(){
    return useHttpGet("CouponList","/coupon/list")
}


// 通用列表
export function useListApi(type,query = {}){
    let q = useQueryToString(query)
    return useHttpGet(type + "List",`/${type}/list${q}`,{
        lazy:true
    })
}


// 电子书抽离接口，获取电子书列表
export function useBookListApi(type,query = {}){
    return useHttpPost(type + "List",'/book/search',{
        body:{
            ...query
        }
    })
}

// 查看课程/专栏详情
export function useReadDetailApi(type,query = {}){
    let q = useQueryToString(query)
    return useHttpGet("readDetail",`/${type}/read${q}`,{
        lazy:true
    })
}




// 电子书详情 本来是 /read， 后端改成了 /getById
export function usegetByIdDetailApi(type,query = {}){
    let q = useQueryToString(query)
    return useHttpGet("readDetail",`/${type}/getById${q}`,{
        lazy:true
    })
}