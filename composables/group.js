/**
 * 拼团模块 API Composables
 * 包含拼团活动、参团记录、组团详情等相关接口
 * 
 * 后端接口文档:
 * 1. GET /pc/group/activity/list - 查询拼团活动列表
 * 2. GET /pc/group/activity/mylist - 查询我的拼团列表
 * 3. GET /pc/group/work/detail - 拼团详情
 * 4. POST /pc/group/work/join - 参与拼团
 * 5. GET /pc/group/activity/initiable - 获取可发起的拼团活动列表
 * 6. POST /pc/group/work/create - 发起拼团
 */

/**
 * 1. 查询拼团活动列表接口
 * @param {Object} params - 查询参数
 * @param {Number} params.status - 状态筛选: 1-进行中, 2-已成功 (可选)
 * @param {String} params.type - 类型筛选: 'server'-服务器拼团, 'ai'-AI拼团 (可选)
 * @param {Number} page - 页码,默认1
 * @returns {Object} { data, error, pending, refresh }
 * 
 * 后端接口文档:
 * GET /pc/group/activity/initiated/list?page={page}&status={status}&type={type}
 */
export function useGetGroupActivityListApi(params = {}, page = 1) {
    const { status, type } = params
    let url = `/group/activity/initiated/list?page=${page}`
    
    // 状态筛选: 支持 1(进行中), 2(已成功), 3(已结束)
    if (status !== undefined && status !== null && [1, 2, 3].includes(status)) {
        url += `&status=${status}`
    }
    
    // 类型筛选: server-服务器拼团, ai-AI拼团
    if (type !== undefined && type !== null && type !== '') {
        url += `&type=${type}`
    }
    
    return useHttpGet("GetGroupActivityList", url, {
        lazy: true,
        initialCache: true,
        // 错误时返回空数据而不是抛出异常
        onResponseError({ response }) {
            console.warn('拼团活动列表API请求失败:', response.status)
        }
    })
}

/**
 * 2. 查询我的拼团列表接口 (需要登录)
 * @param {Object} params - 查询参数
 * @param {Number} params.groupStatus - 组团状态筛选: 0-进行中, 1-已成团, 2-已取消过期 (可选,不传则返回全部)
 * @param {Number} page - 页码,默认1
 * @returns {Object} { data, error, pending, refresh }
 */
export function useGetMyGroupActivityListApi(params = {}, page = 1) {
    const { groupStatus } = params
    let url = `/group/activity/mylist?page=${page}`
    
    // 组团状态筛选: 0-进行中 / 1-已成团 / 2-已取消过期
    if (groupStatus !== undefined && groupStatus !== null && [0, 1, 2].includes(groupStatus)) {
        url += `&groupStatus=${groupStatus}`
    }
    
    return useHttpGet("GetMyGroupActivityList", url, {
        lazy: true,
        initialCache: false, // 我的拼团列表不缓存,确保数据最新
        onResponseError({ response }) {
            console.warn('我的拼团列表API请求失败:', response.status)
        }
    })
}

/**
 * 3. 拼团详情 - 查询单个组团信息
 * @param {Number|String} activityId - 活动ID
 * @returns {Object} { data, error, pending, refresh }
 */
export function useGetGroupWorkDetailApi(activityId) {
    return useHttpGet("GetGroupWorkDetail", `/group/work/detail?activityId=${activityId}`, {
        lazy: true,
        initialCache: false, // 详情页不缓存,确保数据最新
        onResponseError({ response }) {
            console.warn('拼团详情API请求失败:', response.status)
        }
    })
}

/**
 * 4. 参与拼团接口 (需要登录)
 * @param {Object} params - 查询参数
 * @param {Number} params.activityId - 活动ID
 * @param {String} params.payMethod - 支付方式 (wechat/alipay)
 * @returns {Object} { data, error, pending }
 * 
 * 后端期望返回格式：
 * 成功时：
 * {
 *   "code": 200,
 *   "msg": "参团成功",
 *   "data": {
 *     "order_no": "订单号（如需支付则返回，免费则不返回）"
 *   }
 * }
 * 
 * 错误时：
 * {
 *   "code": 500,
 *   "msg": "您已参与该拼团活动"
 * }
 */
export function useJoinGroupWorkApi(params) {
    const { activityId, payMethod = 'wechat' } = params
    const url = `/group/work/join?activityId=${activityId}&payMethod=${payMethod}`
    
    return useHttpPost("JoinGroupWork", url, {
        body: {}  // POST请求但参数在URL中
    })
}

/**
 * 5. 获取可发起的拼团活动列表 (需要登录)
 * @returns {Object} { data, error, pending, refresh }
 */
export function useGetInitiableActivitiesApi() {
    return useHttpGet("GetInitiableActivities", '/group/activity/initiable', {
        lazy: true,
        initialCache: false
    })
}

/**
 * 6. 发起拼团(创建组团) (需要登录)
 * @param {Object} body - 请求体
 * @param {Number} body.activityId - 活动ID
 * @param {Number} body.minNum - 最低拼团人数
 * @param {Number} body.maxNum - 最多拼团人数
 * @param {Number} body.price - 支付费用
 * @param {Number} body.duration - 服务器使用时间(月)
 * @returns {Object} { data, error, pending }
 */
export function useCreateGroupWorkApi(body) {
    return useHttpPost("CreateGroupWork", "/group/work/create", {
        body
    })
}

// 辅助函数：格式化拼团状态
export function useGroupStatusText(status) {
    const statusMap = {
        1: '进行中',
        2: '已成功',
        3: '已结束',  // 修改：从"已失败"改为"已结束"
        4: '未开始'
    }
    return statusMap[status] || '未知状态'
}

// 辅助函数：格式化参团状态
export function useGroupJoinStatusText(status) {
    const statusMap = {
        0: '待成团',
        1: '拼团中',
        2: '已成功',
        3: '已失败',
        4: '已退款'
    }
    return statusMap[status] || '未知状态'
}

// 辅助函数：计算拼团进度百分比
export function useGroupProgress(currentNum, totalNum) {
    if (!totalNum || totalNum === 0) return 0
    return Math.min(100, Math.round((currentNum / totalNum) * 100))
}

// 辅助函数：手机号脱敏
export function useDesensitizePhone(phone) {
    if (!phone || phone.length < 11) return phone
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 7. 获取服务器配置教程详情（需要登录）
 * @param {Number|String} activityId - 活动ID
 * @returns {Object} { data, error, pending, refresh }
 * 
 * 后端接口文档:
 * GET /pc/group/server/tutorial?activityId={id}
 * 
 * 期望返回字段：
 * - tutorialContent: HTML富文本内容（服务器使用方法、功能描述、配置指南等）
 * - serviceDescription: 拼团提供的具体服务内容说明
 * - featureList: 服务器功能特性列表（数组）
 * - configurationGuide: 配置指南步骤（数组）
 * - serverTutorialUrl: 外链教程URL（可选）
 */
export function useGetServerTutorialApi(activityId) {
    return useHttpGet("GetServerTutorial", `/group/server/tutorial?activityId=${activityId}`, {
        lazy: true,
        initialCache: false,
        onResponseError({ response }) {
            console.warn('服务器教程API请求失败:', response.status)
        }
    })
}

/**
 * 8. 获取SSH连接信息（需要登录）
 * @param {Number|String} activityId - 活动ID
 * @returns {Object} { data, error, pending, refresh }
 * 
 * 后端接口文档:
 * GET /pc/group/server/ssh-info?activityId={id}
 * 
 * 期望返回字段：
 * - ip: 服务器IP地址
 * - port: SSH端口（默认22）
 * - username: 登录用户名
 * - password: 登录密码
 * - remark: 备注信息
 */
export function useGetServerSshInfoApi(activityId) {
    return useHttpGet("GetServerSshInfo", `/group/server/ssh-info?activityId=${activityId}`, {
        lazy: true,
        initialCache: false,
        onResponseError({ response }) {
            console.warn('SSH连接信息API请求失败:', response.status)
        }
    })
}

/**
 * 9. 搜索用户（用于手动添加参团用户）
 * @param {string} keyword - 搜索关键词
 * @param {number} limit - 返回结果数量限制
 * @returns {Object} { data, error, pending, refresh }
 * 
 * 后端接口文档:
 * GET /pc/group/user/search?keyword={keyword}&limit={limit}
 * 
 * 期望返回字段：
 * - userId: 用户ID
 * - username: 用户名
 * - nickname: 昵称
 * - avatar: 头像URL
 * - status: 状态
 */
export function useSearchUsersApi(keyword, limit = 10) {
    return useHttpGet("SearchUsers", `/group/user/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`, {
        lazy: true,
        initialCache: false,
        onResponseError({ response }) {
            console.warn('搜索用户API请求失败:', response.status)
        }
    })
}

/**
 * 10. 手动添加参团用户（管理员功能）
 * @param {Object} body - 请求体
 * @param {number} body.activityId - 活动ID
 * @param {number} body.userId - 用户ID
 * @param {string} body.remark - 备注（可选）
 * @returns {Object} { data, error, pending, execute }
 * 
 * 后端接口文档:
 * POST /pc/group/user/add
 * 
 * 请求体格式：
 * {
 *   "activityId": 1234567890,
 *   "userId": 1720100000001,
 *   "remark": "线下已付款，由管理员手动录入"
 * }
 * 
 * 期望返回字段：
 * - recordId: 记录ID
 * - activityId: 活动ID
 * - userId: 用户ID
 * - username: 用户名
 * - joinTime: 加入时间
 */
export function useAddGroupUserApi(body) {
    return useHttpPost("AddGroupUser", '/group/user/add', {
        body: body
    })
}

/**
 * 11. 拼团支付接口（微信支付）
 * @param {Object} params - 参数
 * @param {String} params.orderNo - 订单号
 * @param {String} params.payMethod - 支付方式 (wechat/alipay)
 * @param {String} params.name - 商品名称（拼团活动名称）
 * @returns {Object} { data, error, pending }
 * 
 * 后端接口文档:
 * POST /pc/group/work/pay?orderNo={orderNo}&payMethod={payMethod}&name={name}
 * 
 * 期望返回格式：
 * {
 *   "code": 200,
 *   "msg": "操作成功",
 *   "data": {
 *     "payUrl": "微信支付二维码URL",
 *     "qrcode": "二维码URL",
 *     "code_url": "二维码链接",
 *     "price": 2388.00,
 *     "orderNo": "订单号"
 *   }
 * }
 */
export function useJoinGroupPaymentApi({ orderNo, payMethod = 'wechat', name = '拼团支付' }) {
    const url = `/group/work/pay?orderNo=${orderNo}&payMethod=${payMethod}&name=${encodeURIComponent(name)}`
    
    return useHttpPost("JoinGroupPayment", url, {
        body: {}  // POST请求但参数在URL中
    })
}

/**
 * 12. 查询订单支付状态
 * @param {String} orderNo - 订单号
 * @returns {Object} { data, error, pending, refresh }
 * 
 * 后端接口文档:
 * GET /pc/group/order/status?orderNo={orderNo}
 * 
 * 期望返回字段：
 * - orderNo: 订单号
 * - status: 订单状态 (0-待支付, 1-已支付, 2-已取消, 3-已退款)
 * - payTime: 支付时间
 * - price: 订单金额
 * - needPay: 是否需要支付 (true/false)
 */
export function useGetOrderStatusApi(orderNo) {
    return useHttpGet("GetOrderStatus", `/group/order/status?orderNo=${orderNo}`, {
        lazy: true,
        initialCache: false,
        onResponseError({ response }) {
            console.warn('订单状态查询失败:', response.status)
        }
    })
}
