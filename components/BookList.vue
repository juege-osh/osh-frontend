<template>
    <section class="book-section">
        <UiImage :src="item.cover" class="book-cover"/>
        <div class="book-info">
            <h4>{{ item.title }}</h4>
            <div class="book-footer">
                <div class="price-container">
                    <Price :value="item.price"/>
                    <Price :value="item.t_price" through class="ml-2"/>
                </div>
                <n-button strong secondary round type="primary" class="subscribe-btn"
                @click="open">
                    {{ item.sub_count == 0 ? '立即订阅' : (item.sub_count + '人订阅') }}
                </n-button>
            </div>
        </div>
    </section>
</template>

<script setup>
    import {
        NButton
    } from "naive-ui"
    const props = defineProps({
        item:Object
    })
    const open = ()=>{
        navigateTo(`/detail/book/${props.item.id}`)
    }
</script>

<style scoped>
.book-section {
    background-color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-radius: 0.5rem;
    padding: 1.25rem;
    display: flex;
    align-items: stretch;
    margin-bottom: 1.25rem;
}

.book-cover {
    width: 108px;
    height: 138px;
    border-radius: 0.25rem;
    flex-shrink: 0;
    background-color: #f9fafb;
}

.book-info {
    display: flex;
    flex-direction: column;
    padding-left: 1.25rem;
    flex: 1;
}

.book-footer {
    margin-top: auto;
    display: flex;
    align-items: center;
}

.price-container {
    display: flex;
    align-items: flex-end;
}

.subscribe-btn {
    margin-left: auto;
}
</style>