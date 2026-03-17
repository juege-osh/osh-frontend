<template>
    <div>
        <div class="comments-header">
            <h4>精彩评论</h4>
        </div>

        <LoadingGroup :pending="pending" :error="error" :is-empty="rows.length === 0">
            
            <CommentList v-for="(item,index) in rows" :key="index" :item="item"
            @commentSuccess="handleCommentSuccess">
                <CommentList v-for="(item2,index2) in item.post_comments" :key="index2" :item="item2" @commentSuccess="handleCommentSuccess"/>
            </CommentList>

            <div class="pagination-container">
                <n-pagination size="large" :page="page" :item-count="total" :page-size="limit" :on-update:page="handlePageChange"/>
            </div>
        </LoadingGroup>

    </div>
</template>
<script setup>
    import {
        NPagination
    } from "naive-ui"

    const props = defineProps(["post_id"])
    const page = ref(1)
    const limit = ref(5)

    const {
        total,
        rows,
        pending,
        error,
        refresh
    } = await usePage(()=> {
        return usePostCommentApi(()=>{
            return {
                limit:limit.value,
                page:page.value,
                post_id:props.post_id
            }
        })
    })

    console.log(rows)

    // 分页
    function handlePageChange(p){
        page.value = p
        refresh()
    }

    function handleCommentSuccess(){
        console.log("回复成功")
        refresh()
    }

    defineExpose({
        handlePageChange
    })

</script>

<style scoped>
.comments-header {
  padding-left: 1.25rem;
  padding-bottom: 1.25rem;
}

.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.25rem;
  margin-bottom: 2.5rem;
}
</style>