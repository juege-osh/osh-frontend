<template>
    <LoadingGroup :pending="pending" :error="error">
        <template v-if="data">

        <section class="py-4" v-if="data.isbuy && ((data.type != 'media' && type=='course') || type == 'live')">
            <ClientOnly>
                <template #fallback>
                    <LoadingSkeleton/>
                </template>
                <PlayerAudio v-if="data.type == 'audio'" :title="data.title" :url="data.content" :cover="data.cover"/>
                <!-- 引入视频播放器 -->
                <PlayerVideo v-else-if="data.type == 'video'" :url="data.content" />
                <!-- 引入直播播放器 -->
                <PlayerLive v-else-if="type == 'live'" :url="data.playUrl"/>
            </ClientOnly>
        </section>

        <section v-else class="detail-top">
            <div class="book-cover-container" v-if="type == 'book'">
                <img :src="data.cover" class="book-cover-large" />
                <div class="book-badge" v-if="data.price == 0">免费</div>
            </div>
            <n-image v-else :src="data.cover" object-fit="cover" class="image"/>
            
            <div class="info">
                <div class="flex flex-col items-start">
                    <div class="book-header">
                        <h1 class="book-title">{{ data.title }}</h1>
                        <FavaBtn :isfava="data.isfava" :goods_id="data.id" :type="type"/>
                    </div>
                    <div class="book-meta">
                        <span class="meta-item">
                            <n-icon size="16"><PeopleOutline /></n-icon>
                            {{ data.sub_count || 0 }}人学过
                        </span>
                        <span class="meta-divider">|</span>
                        <span class="meta-item" v-if="type === 'course'">
                            【{{ o[data.type] }}】
                        </span>
                    </div>

                    <template v-if="!data.isbuy">
                        <DetailActiveBar :data="data" v-if="data.group || data.flashsale"/>

                        <template v-else>
                            <div class="price-section">
                                <Price :value="data.price" class="current-price"/>
                                <Price :value="data.t_price" through class="original-price"/>
                            </div>

                            <!-- 领取优惠券 -->
                            <CouponModal v-if="type != 'live'"/>
                            <LiveStatusBar v-else :start="data.start_time" :end="data.end_time"/>
                        </template>
                    </template>

                </div>

                <div class="action-buttons">
                    <template v-if="type == 'book'">
                        <template v-if="menus.length > 0">
                            <n-button type="primary" size="large" :loading="loading" @click="buy" class="primary-btn">
                                <template #icon><n-icon><BookOutline /></n-icon></template>
                                立即学习
                            </n-button>
                            <n-button v-if="freeId" size="large" strong secondary type="primary" @click="learn({ id:freeId })" class="secondary-btn">
                                <template #icon><n-icon><EyeOutline /></n-icon></template>
                                免费试看
                            </n-button>
                        </template>
                        <n-button v-else type="primary" size="large" disabled>敬请期待</n-button>
                    </template>

                    <n-button v-else type="primary" size="large" :loading="loading" @click="buy" class="primary-btn">
                        {{ btn }}
                    </n-button>
                    
                    <!-- 编辑删除按钮 - 仅电子书显示，使用 ClientOnly 避免 SSR 问题 -->
                    <ClientOnly>
                        <template v-if="type == 'book'">
                            <n-button v-if="canEditBook" size="large" secondary @click="handleEdit" class="edit-btn">
                                <template #icon>
                                    <n-icon><CreateOutline /></n-icon>
                                </template>
                                编辑电子书
                            </n-button>
                            <n-button v-if="canDeleteBook" size="large" tertiary type="error" @click="handleDelete" class="edit-btn">
                                删除电子书
                            </n-button>
                        </template>
                    </ClientOnly>
                </div>
            </div>
        </section>

        <n-grid :x-gap="20">
            <n-grid-item :span="18">
                <DetailGroupworks v-if="!data.isbuy && data.group" :group_id="data.group.id"/>

                <section class="detail-bottom">
                    <UiTab class="border-b">
                        <UiTabItem :active="tab == item.value" v-for="(item,index) in tabs" :key="index" @click="changeTab(item.value)">{{ item.label }}</UiTabItem>
                    </UiTab>
                    <div v-if="tab == 'content'" class="content" v-html="detailContent"></div>

                    <DetailMenu v-else>
                        <DetailMenuItem v-for="(item,index) in menus"
                        :key="index" :item="item" :index="index" @click="learn(item)"/>

                        <Empty v-if="menus.length == 0" desc="暂无目录"/>
                    </DetailMenu>

                </section>
                <BookQuestionPanel v-if="type == 'book' && data?.id" :book-id="data.id" class="book-qna-block" />
            </n-grid-item>
            <n-grid-item :span="6">
                <HotCourseList/>
            </n-grid-item>
        </n-grid>
        </template>
    </LoadingGroup>
</template>
<script setup>
    import {
        NImage,
        NButton,
        NGrid,
        NGridItem,
        NIcon,
        createDiscreteApi,
    } from "naive-ui"
    import { CreateOutline, PeopleOutline, BookOutline, EyeOutline } from '@vicons/ionicons5'
    import { fetchConfig } from '~/composables/useHttp'
    import { usePermission } from '~/composables/usePermission'
    
    const route = useRoute()
    const { id,type } = route.params
    
    // 使用权限系统，和课程模块保持一致
    const { hasPermission } = usePermission()
    
    // 电子书管理权限判断：需要 book:update 和 book:delete 权限
    const canEditBook = computed(() => hasPermission('book:update'))
    const canDeleteBook = computed(() => hasPermission('book:delete'))

    useInitHead()

    const {
        tabs,
        tab,
        changeTab
    } = useInitDetailTabs(type)

    // 获取请求参数
    const query = useRequestQuery()

    const {
        data,
        error,
        pending,
        refresh
    } = await usegetByIdDetailApi(type,query)

    const title = computed(()=> !pending.value ? data.value?.title : "详情页")

    useHead({ title })
    
    const o = {
        media:"图文",
        video:"视频",
        audio:"音频"
    }

    const subTitle = computed(()=>{
        let pre = ""
        if(type === "course" && data.value){
            pre = `【${o[data.value.type]}】`
        }
        return `${pre}${data.value?.sub_count || 0}人学过`
    })

    const btn = computed(()=>{
        if(data.value?.group){
            return "立即拼团"
        } else if(data.value?.flashsale){
            return "立即秒杀"
        }
        return "立即学习"
    })

    const detailContent = computed(() => {
        if (!data.value) return ''
        if (type === 'book') {
            return data.value.try || data.value.desc || '<p>暂无内容介绍</p>'
        }
        return (data.value.type == 'media' && data.value.isbuy) ? data.value.content : data.value.try
    })

    // 购买学习
    const loading = ref(false)
    const buy = ()=>{
        useHasAuth(async ()=>{
            // 免费学习
            if(data.value.price == 0){
                loading.value = true
                let {
                    error:learnError
                } = await useLearnApi({
                    goods_id:data.value.id,
                    type
                })

                loading.value = false

                // 请求成功，刷新数据
                if(!learnError.value) refresh()

                return
            }

            // 发起拼团
            if(data.value.group){
                loading.value = true
                useCreateOrderApi({
                    group_id:data.value.group.id
                },"group")
                .then(res=>{
                    if(!res.error.value){
                        navigateTo(`/pay?no=${res.data.value.no}`)
                    }
                })
                .finally(()=>{
                    loading.value = false
                })
                return
            }

            // 付费学习
            let ty = "course"
            let id = data.value.id
            if(type == "book"){
                ty = "book"
            } else if(type == "live"){
                ty = "live"
            } else if(type == "column"){
                ty = "column"
            }

            if(data.value.flashsale){
                ty = "flashsale"
                id = data.value.flashsale.id
            }

            navigateTo(`/createorder?id=${id}&type=${ty}`)

        })
    }

    // 菜单
    const menus = computed(()=> {
        if (!data.value) return []
        return (type == 'book' ? data.value.book_details : data.value.column_courses ) || []
    })

    // 点击菜单
    const learn = (item)=>{
        useHasAuth(()=>{
            const { message } = createDiscreteApi(["message"])

            // 专栏
            if(type == "column" && item.price != 0 && !data.value.isbuy){
                return message.error("请先购买该专栏")
            }


            // 跳转
            let url = ""
            if(type == "column"){
                url = `/detail/course/${item.id}?column_id=${data.value.id}`
            } else if(type == 'book'){
                url = `/book/${data.value.id}/${item.id}`
            }
            navigateTo(url)
        })
    }

    // 电子书第一个免费章节ID
    const freeId = computed(()=>{
        let fid = 0
        if(type == 'book' && data.value){
            let item = (data.value.book_details || []).find(o => Number(o.isFree ?? o.isfree) === 1)
            if(item){
                fid = item.id
            }
        }
        return fid
    })

    // 编辑电子书
    const handleEdit = () => {
        navigateTo(`/book/edit/${id}`)
    }

    const getAuthHeaders = () => {
        let tokenValue = ''
        if (process.client) {
            tokenValue = localStorage.getItem('token') || localStorage.getItem('Token') || ''
            if (!tokenValue) {
                tokenValue = useCookie('token').value || ''
            }
        }
        return {
            appid: fetchConfig.headers.appid,
            token: tokenValue,
            Authorization: tokenValue ? `Bearer ${tokenValue}` : ''
        }
    }

    const handleDelete = async () => {
        const { dialog, message } = createDiscreteApi(['dialog', 'message'])
        dialog.warning({
            title: '删除确认',
            content: '确定删除该电子书吗？此操作不可恢复。',
            positiveText: '删除',
            negativeText: '取消',
            onPositiveClick: async () => {
                try {
                    const res = await $fetch(`/book/delete?id=${id}`, {
                        method: 'DELETE',
                        baseURL: fetchConfig.baseURL,
                        headers: getAuthHeaders()
                    })
                    if (res.code === 200) {
                        message.success('删除成功')
                        navigateTo('/list/book/1')
                    } else {
                        message.error(res.msg || '删除失败')
                    }
                } catch (err) {
                    message.error(err.message || '删除失败')
                }
            }
        })
    }

    // 获取query
    function useRequestQuery(){
        const {
            column_id,
            flashsale_id,
            group_id
        } = route.query

        let query = {
            id
        }
        if(column_id){
            query.column_id = column_id
        }

        if(flashsale_id){
            query.flashsale_id = flashsale_id
        } else if(group_id){
            query.group_id = group_id
        }

        return query
    }

    // 初始化tab
    function useInitDetailTabs(t){
        const tabs = computed(()=>{
            let ts = [{
                label:"详情",
                value:"content"
            }]

            if(t == "column" || t == "book"){
                ts.push({
                    label:"目录",
                    value:"menu"
                })
            }

            return ts
        })

        const tab = ref("content")

        const changeTab = (e)=> tab.value = e

        return {
            tabs,
            tab,
            changeTab
        }
    }

    // 初始化head
    function useInitHead(){
        if(type === "course"){
            useHead({
                link:[{
                    rel:"stylesheet",
                    href:"/aplayer/APlayer.min.css"
                }],
                script:[{
                    src:"/aplayer/APlayer.min.js",
                },{
                    src:"//unpkg.byted-static.com/xgplayer/2.31.2/browser/index.js"
                }]
            })
        }

        if(type === "live"){
            useHead({
                script:[{
                    src:"//unpkg.byted-static.com/xgplayer/2.31.2/browser/index.js",
                },{
                    src:"//unpkg.byted-static.com/xgplayer-flv/2.5.1/dist/index.min.js"
                }]
            })
        }
    }

</script>
<style>
    .flex {
      display: flex;
    }
    
    .items-center {
      align-items: center;
    }
    
    .items-start {
      align-items: flex-start;
    }
    
    .flex-col {
      flex-direction: column;
    }
    
    .mr-2 {
      margin-right: 0.5rem;
    }
    
    .ml-1 {
      margin-left: 0.25rem;
    }
    
    .ml-2 {
      margin-left: 0.5rem;
    }
    
    .my-2 {
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
    
    .mt-2 {
      margin-top: 0.5rem;
    }
    
    .mt-auto {
      margin-top: auto;
    }
    
    .text-xl {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }
    
    .text-xs {
      font-size: 0.75rem;
      line-height: 1rem;
    }
    
    .text-gray-400 {
      color: #9ca3af;
    }
    
    .border-b {
      border-bottom-width: 1px;
    }
    
    .rounded {
      border-radius: 0.25rem;
    }
    
    .bg-white {
      background-color: #fff;
    }
    
    .py-4 {
      padding-top: 1rem;
      padding-bottom: 1rem;
    }
    
    .py-2 {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    
    .px-5 {
      padding-left: 1.25rem;
      padding-right: 1.25rem;
    }
    
    .pb-5 {
      padding-bottom: 1.25rem;
    }
    
    .object-fit {
      object-fit: cover;
    }
    
    .detail-top {
        display: flex;
        padding: 2rem;
        border-radius: 12px;
        background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        gap: 2rem;
    }
    
    .book-cover-container {
        position: relative;
        flex-shrink: 0;
    }
    
    .book-cover-large {
        width: 200px;
        height: 280px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        transition: transform 0.3s ease;
        object-fit: cover;
        display: block;
    }
    
    .book-cover-large:hover {
        transform: translateY(-4px);
    }
    
    .book-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: linear-gradient(135deg, #18a058 0%, #0e7a3e 100%);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(24,160,88,0.3);
    }
    
    .detail-top .image {
        width: 340px;
        height: 200px;
        border-radius: 12px;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .detail-top .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .book-header {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .book-title {
        font-size: 28px;
        font-weight: 700;
        color: #1a1a1a;
        margin: 0;
        line-height: 1.3;
    }
    
    .book-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #666;
        font-size: 14px;
        margin-top: 0.5rem;
    }
    
    .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
    }
    
    .meta-divider {
        color: #ddd;
    }
    
    .price-section {
        display: flex;
        align-items: baseline;
        gap: 0.75rem;
        margin-top: 1rem;
    }
    
    .current-price {
        font-size: 32px;
        font-weight: 700;
        color: #d03050;
    }
    
    .original-price {
        font-size: 16px;
        color: #999;
    }
    
    .action-buttons {
        display: flex;
        gap: 1rem;
        margin-top: auto;
        flex-wrap: wrap;
    }
    
    .primary-btn {
        min-width: 140px;
    }
    
    .secondary-btn {
        min-width: 120px;
    }
    
    .edit-btn {
      min-width: 120px;
    }

    .book-qna-block {
      margin-top: 24px;
    }

    .detail-bottom {
        background-color: #fff;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        overflow: hidden;
    }

    .detail-bottom .content {
        padding: 2rem;
        line-height: 1.8;
        font-size: 16px;
        color: #333;
    }
    
    .detail-bottom .content img {
        max-width: 100% !important;
        border-radius: 8px;
        margin: 1rem 0;
    }
    
    .detail-bottom .content h2 {
        font-size: 24px;
        font-weight: 600;
        margin: 1.5rem 0 1rem;
        color: #1a1a1a;
    }
    
    .detail-bottom .content h3 {
        font-size: 20px;
        font-weight: 600;
        margin: 1.25rem 0 0.75rem;
        color: #333;
    }
    
    .detail-bottom .content p {
        margin: 0.75rem 0;
    }
    
    .detail-bottom .content ul, 
    .detail-bottom .content ol {
        padding-left: 1.5rem;
        margin: 0.75rem 0;
    }
    
    .detail-bottom .content li {
        margin: 0.5rem 0;
    }
    
    .detail-bottom .content code {
        background: #f5f7fa;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        color: #d03050;
    }
    
    .detail-bottom .content pre {
        background: #f5f7fa;
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
        margin: 1rem 0;
    }
    
    .detail-bottom .content pre code {
        background: none;
        padding: 0;
        color: #333;
    }
</style>
