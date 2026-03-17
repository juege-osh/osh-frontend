<template>
    <div class="test-item">
        <div class="title">
            第{{ index + 1 }}题 {{ typeOptions[item.type] }}
        </div>
        <div class="p-4">
            <!-- 题目内容 -->
            <p class="mb-5" v-html="item.title"></p>

            <!-- 题目选项 -->
            <div v-if="item.type == 'radio' || item.type == 'trueOrfalse' || item.type == 'checkbox'">
                <p class="tip">答案：</p>
                <ul>
                    <li class="option" v-for="(q,qI) in item.options" :key="qI"
                    @click="handleChooseOption(qI)"
                    :class="{ active:isActive(qI) }">
                        <span class="mr-2">{{ en[qI] }}</span>
                        <div v-html="q"></div>
                    </li>
                </ul>
            </div>

            <!-- 填空 -->
            <div v-else-if="item.type == 'completion'">
                <div class="mb-3 border rounded p-3"
                v-for="(uv,uvI) in modelValue" :key="uvI">
                    <div class="flex items-center justify-between mb-3">
                        <h5 class="text-sm">填空 {{ uvI + 1 }}</h5>
                        <n-icon v-if="uvI > 0" @click="remove(uvI)">
                            <Close/>
                        </n-icon>
                    </div>
                    <n-input
                        v-model:value="modelValue[uvI]"
                        type="textarea"
                        :placeholder="'填空 ' + (uvI + 1)"
                    />
                </div>

                <n-button type="primary" dashed class="w-full my-3" @click="add">
                    添加填空
                </n-button>

            </div>

            <!-- 问答 -->
            <div v-else>
                <div class="mb-3 border rounded p-3">
                    <n-input
                        v-model:value="modelValue[0]"
                        type="textarea"
                        placeholder="请填写内容"
                    />
                </div>
            </div>

        </div>
    </div>
</template>
<script setup>
    import {
        NIcon,
        NInput,
        NButton,
        createDiscreteApi
    } from "naive-ui"

    import {
        Close
    } from "@vicons/ionicons5"

    
    const props = defineProps({
        item:Object,
        index:Number
    })

    const modelValue = ref(props.item.user_value)

    // 移除填空
    function remove(i){
        const { dialog } = createDiscreteApi(["dialog"])
        dialog.warning({
            content:"是否要删除该填空？",
            positiveText:"确定",
            negativeText:"取消",
            onPositiveClick(){
                modelValue.value.splice(i,1)
            }
        })
    }

    // 添加填空
    function add(){
        modelValue.value.push("")
    }

    // 单选/多选是否选中
    function isActive(v){
        const { item } = props
        if(item.type == "radio" || item.type == "trueOrfalse"){
            return modelValue.value == v
        }
        return modelValue.value.includes(v)
    }

    function handleChooseOption(val){
        const { item } = props
        if(item.type == "radio" || item.type == "trueOrfalse"){
            modelValue.value = modelValue.value == val ? -1 : val
        } else {
            let i = modelValue.value.findIndex(v=>v == val)
            if(i == -1){
                modelValue.value.push(val)
            } else {
                modelValue.value.splice(i,1)
            }
        }
    }

    // 题目类型
    const typeOptions = {
        answer:"问答题",
        completion:"填空题",
        trueOrfalse:"判断题",
        checkbox:"多选题",
        radio:"单选题"
    }

    // 选项转化
    const en = {
        0:"A",
        1:"B",
        2:"C",
        3:"D",
        4:"E",
        5:"F",
        6:"G",
    }

    // 监听值变化
    const emit = defineEmits(["change"])
    watch(modelValue,(newVal)=>{
        emit("change",unref(newVal))
    },{
        deep:true
    })

</script>
<style>
    .test-item{
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        border-radius: 0.25rem;
        margin-bottom: 1.25rem;
    }

    .test-item .title{
        background-color: #f3f4f6;
        padding: 1rem;
        border-bottom-width: 1px;
        font-size: 0.875rem;
        line-height: 1.25rem;
    }

    .test-item .tip {
        font-size: 0.75rem;
        line-height: 1rem;
        margin-bottom: 0.75rem;
        color: #6b7280;
    }

    .test-item .option {
        transition: all 0.2s;
        display: flex;
        border: 1px solid #d1d5db;
        padding: 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
        line-height: 1.25rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
    }

    .test-item .option:hover {
        border-color: #0ea5e9 !important;
        background-color: #eff6ff !important;
        color: #0ea5e9 !important;
    }

    .test-item .option:active {
        background-color: #e0f2fe !important;
    }

    .test-item .active {
        border-color: #0ea5e9 !important;
        background-color: #eff6ff !important;
        color: #0ea5e9 !important;
    }
</style>