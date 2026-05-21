// ==================== 资源组相关 API ====================

// 游标分页查询资源组列表（按需加载）
export function useResourceGroupListApi(body = {}) {
    return useHttpPost("ResourceGroupList", `/internal/group/list`, {
        $: true,
        body: {
            keyword: body.keyword || null,
            lastId: body.lastId || null,
            pageSize: body.pageSize || 10
        }
    })
}

// 获取资源组详情
export function useResourceGroupDetailApi(id) {
    return useHttpGet("ResourceGroupDetail", `/internal/group/${id}`, {
        $: true
    })
}

// 新增资源组
export function useResourceGroupAddApi(body) {
    return useHttpPost("ResourceGroupAdd", "/internal/group", {
        $: true,
        body
    })
}

// 修改资源组
export function useResourceGroupUpdateApi(body) {
    return useHttp("ResourceGroupUpdate", "/internal/group", {
        $: true,
        method: "PUT",
        body
    })
}

// 删除资源组
export function useResourceGroupDeleteApi(id) {
    return useHttp("ResourceGroupDelete", `/internal/group/${id}`, {
        $: true,
        method: "DELETE"
    })
}

// ==================== 资源相关 API ====================

// 分页查询资源列表
export function useResourcePageApi(params = {}) {
    const q = useQueryToString(params)
    return useHttpGet("ResourcePage", `/internal/resource/page${q}`, {
        $: true
    })
}

// 获取全量资源列表（用于下拉选择）
export function useResourceListApi(params = {}) {
    const q = useQueryToString(params)
    return useHttpGet("ResourceList", `/internal/resource/list${q}`, {
        $: true
    })
}

// 获取资源详情
export function useResourceDetailApi(id) {
    return useHttpGet("ResourceDetail", `/internal/resource/${id}`, {
        $: true
    })
}

// 新增资源
export function useResourceAddApi(body) {
    return useHttpPost("ResourceAdd", "/internal/resource", {
        $: true,
        body
    })
}

// 修改资源
export function useResourceUpdateApi(body) {
    return useHttp("ResourceUpdate", "/internal/resource", {
        $: true,
        method: "PUT",
        body
    })
}

// 删除资源
export function useResourceDeleteApi(id) {
    return useHttp("ResourceDelete", `/internal/resource/${id}`, {
        $: true,
        method: "DELETE"
    })
}

// 按ID集合查询资源VO
export function useResourceVOByIdsApi(ids) {
    return useHttpPost("ResourceVOByIds", `/internal/resource/vo-by-ids`, {
        $: true,
        body: ids
    })
}

// 上传资源文件
export function useResourceUploadApi(formData) {
    return useHttpPost("ResourceUpload", `/internal/resource/upload`, {
        $: true,
        body: formData
    })
}

// 下载资源文件
export async function useResourceDownloadApi(id) {
    const url = `/internal/resource/download/${id}`
    const { data, fileName, error } = await useHttpDownload(url, {})
    return { data, fileName, error }
}

// 获取资源关联的链接列表
export function useResourceLinksApi(resourceId) {
    return useHttpGet("ResourceLinks", `/internal/resource/${resourceId}/links`, {
        $: true
    })
}

// 建立资源组与资源的关联
export function useResourceLinkAddApi(body) {
    return useHttpPost("ResourceLinkAdd", "/internal/group/link-resource", {
        $: true,
        body
    })
}

// ==================== 链接相关 API ====================

// 分页查询链接列表
export function useLinkPageApi(params = {}) {
    const q = useQueryToString(params)
    return useHttpGet("LinkPage", `/internal/link/page${q}`, {
        $: true
    })
}

// 获取全量链接列表（用于下拉选择）
export function useLinkListApi(params = {}) {
    const q = useQueryToString(params)
    return useHttpGet("LinkList", `/internal/link/list${q}`, {
        $: true
    })
}

// 获取链接详情
export function useLinkDetailApi(id) {
    return useHttpGet("LinkDetail", `/internal/link/${id}`, {
        $: true
    })
}

// 新增链接
export function useLinkAddApi(body) {
    return useHttpPost("LinkAdd", "/internal/link", {
        $: true,
        body
    })
}

// 修改链接
export function useLinkUpdateApi(body) {
    return useHttp("LinkUpdate", "/internal/link", {
        $: true,
        method: "PUT",
        body
    })
}

// 删除链接
export function useLinkDeleteApi(id) {
    return useHttp("LinkDelete", `/internal/link/${id}`, {
        $: true,
        method: "DELETE"
    })
}

// 按ID集合查询链接VO
export function useLinkVOByIdsApi(ids) {
    return useHttpPost("LinkVOByIds", `/internal/link/vo-by-ids`, {
        $: true,
        body: ids
    })
}
