// composables/seckill.js — 秒杀模块 API

// 获取秒杀活动列表（含场次信息）
export function useSeckillActivityApi(query = {}) {
  return useHttpGet('SeckillActivity', '/seckill/activity/list', {
    query,
    lazy: true,
  })
}

// 获取某场次的秒杀商品列表
export function useSeckillGoodsListApi(query = {}) {
  return useHttpGet('SeckillGoodsList', '/seckill/goods/list', {
    query,
    lazy: true,
  })
}

// 获取秒杀商品详情
export function useSeckillGoodsDetailApi(id) {
  return useHttpGet('SeckillGoodsDetail', `/seckill/goods/detail/${id}`, {
    lazy: true,
  })
}

// 获取服务端当前时间戳（用于倒计时校准，防止客户端时间作弊）
export function useSeckillServerTimeApi() {
  return useHttpGet('SeckillServerTime', '/seckill/server-time', {
    $: true,
  })
}

// 创建秒杀订单 — 复用 order.js 中的 useCreateOrderApi(body, 'flashsale')
// POST /pc/order/flashsale
// body: { goods_id, session_id, type: 'flashsale' }

// 新增秒杀商品
export function useSeckillGoodsAddApi(body) {
  return useHttpPost('SeckillGoodsAdd', '/seckill/goods/save', {
    $: true,
    body,
  })
}

// 修改秒杀商品
export function useSeckillGoodsUpdateApi(body) {
  return useHttp('SeckillGoodsUpdate', '/seckill/goods/update', {
    $: true,
    method: 'PUT',
    body,
  })
}

// 删除秒杀商品
export function useSeckillGoodsDeleteApi(id) {
  return useHttp('SeckillGoodsDelete', `/seckill/goods/${id}`, {
    $: true,
    method: 'DELETE',
  })
}
