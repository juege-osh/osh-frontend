// 获取内部网站列表
export function useSiteInfoListApi(query = {}) {
    const q = useQueryToString(query)
    return useHttpGet("SiteInfoList", `/site/list${q}`, {
        $: true
    })
}

// 获取内部网站详情
export function useSiteInfoDetailApi(id) {
    return useHttpGet("SiteInfoDetail", `/site/${id}`, {
        $: true
    })
}

// 使用内部网站
export function useSiteUrlApi(id) {
    return useHttpPost("SiteInfoDetail", `/site/use/${id}`, {
        $: true
    })
}


// 获取内部网站详情
export function useGetSiteInfoByIdApi(id, needUrl = false) {
    return useHttpGet("SiteInfoDetail", `/site/${id}?needUrl=${needUrl}`, {
        $: true
    })
}


// 上传网站封面
export function useUploadSiteCoverApi(cover) {
    return useHttpPost("SiteInfoDetail", `/site/cover/upload`, {
        file: cover
    })
}

// 新增内部网站
export function useSiteInfoAddApi(body) {
    return useHttpPost("SiteInfoAdd", "/site", {
        $: true,
        body
    })
}

// 修改内部网站
export function useSiteInfoUpdateApi(body) {
    return useHttp("SiteInfoUpdate", "/site", {
        $: true,
        method: "PUT",
        body
    })
}

// 删除内部网站
export function useSiteInfoDeleteApi(id) {
    return useHttp("SiteInfoDelete", `/site/${id}`, {
        $: true,
        method: "DELETE"
    })
}

// 获取所有标签列表
export function useSiteTagsAllApi() {
    return useHttpGet("SiteTagsAll", "/site/tags/all", {
        $: true
    })
}

// 获取所有标签及其使用次数
export function useSiteTagsListApi() {
    return useHttpGet("SiteTagsList", `/site/tags/list`, {
        $: true
    })
}

// 新增标签
export function useSiteTagAddApi(body) {
    return useHttpPost("SiteTagAdd", "/site/tags", {
        $: true,
        body
    })
}

// 修改标签
export function useSiteTagUpdateApi(body) {
    return useHttp("SiteTagUpdate", "/site/tags", {
        $: true,
        method: "PUT",
        body
    })
}

// 删除标签
export function useSiteTagDeleteApi(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids]
    const idParams = idArray.join(',')
    return useHttp("SiteTagDelete", `/site/tags/${idParams}`, {
        $: true,
        method: "DELETE"
    })
}

// 获取网站的标签列表
export function useSiteTagsBySiteIdApi(siteId) {
    return useHttpGet("SiteTagsBySiteId", `/site/tags/${siteId}`, {
        $: true
    })
}
