<template>
  <n-modal
    v-model:show="show"
    preset="card"
    title="发布新问题"
    style="width: 800px"
  >
    <n-grid :x-gap="24" :cols="24">
      <n-gi :span="16">
        <n-form label-placement="top">
          <n-form-item label="资源类型">
            <n-select
              v-model:value="form.type"
              :options="typeOptions"
              placeholder="请选择资源类型"
            />
          </n-form-item>

          <n-form-item label="课程编号" v-if="form.type !== 'none'">
            <n-input
              v-model:value="form.no"
              placeholder="输入1024试试..."
              @input="checkResourceAuth"
            />
          </n-form-item>

          <n-form-item label="问题标题及描述">
            <n-input
              v-model:value="form.title"
              placeholder="一句话描述你的问题"
              style="margin-bottom: 10px"
            />
            <n-input
              v-model:value="form.content"
              type="textarea"
              placeholder="## 如何解决Python爬虫中的SSL错误，如何配置环境..."
              :autosize="{ minRows: 4 }"
            />
          </n-form-item>
        </n-form>
      </n-gi>

      <n-gi :span="8">
        <div class="paid-status-box">
          <div class="gold-banner">
            <n-icon size="24" color="#b8860b"><LockOpenOutline /></n-icon>
            <div class="banner-text">
              <div class="main-t">当前资源为付费专属</div>
              <div class="sub-t">Automatically Paid Exclusive</div>
            </div>
          </div>
          <p class="hint-text">根据资源权限自动判定。</p>
        </div>

        <n-form-item label="添加标签" style="margin-top: 20px">
          <n-dynamic-tags v-model:value="form.tags" />
        </n-form-item>

        <n-checkbox v-model:checked="form.notify">回复时通知我</n-checkbox>
      </n-gi>
    </n-grid>

    <template #footer>
      <n-space>
        <n-button type="primary" color="#2c3e50" @click="handleSave"
          >保存草稿</n-button
        >
        <n-button @click="show = false">取消</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import {
  NModal,
  NGrid,
  NGi,
  NForm,
  NFormItem,
  NSelect,
  NInput,
  NDynamicTags,
  NCheckbox,
  NSpace,
  NButton,
  NIcon,
} from 'naive-ui';
import { LockOpenOutline } from '@vicons/ionicons5';

// 1. 定义 Props 和 Emits (用于 v-model:show)
const props = defineProps({
  show: Boolean,
});
const emit = defineEmits(['update:show']);

// 2. 这里的计算属性解决了 show 的双向绑定问题
const show = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val),
});

// 3. 定义表单数据 (对应 template 中的 form.xxx)
const form = reactive({
  type: 'course',
  no: '',
  title: '',
  content: '',
  tags: ['Python', '环境配置'],
  notify: true,
});

// 4. 定义选择项 (对应报错的 typeOptions)
const typeOptions = [
  { label: '无', value: 'none' },
  { label: '网站', value: 'website' },
  { label: '课程', value: 'course' },
  { label: '电子书', value: 'ebook' },
];

// 5. 定义方法 (对应报错的 checkResourceAuth)
const checkResourceAuth = () => {
  console.log('正在校验资源权限:', form.no);
};

const handleSave = () => {
  console.log('保存数据:', form);
  show.value = false;
};
</script>

<style scoped>
.paid-status-box {
  background: #fff9e6;
  border: 1px solid #fbcf33;
  border-radius: 8px;
  padding: 12px;
}
.gold-banner {
  display: flex;
  align-items: center;
  gap: 10px;
}
.banner-text .main-t {
  color: #b8860b;
  font-weight: bold;
  font-size: 14px;
}
.banner-text .sub-t {
  font-size: 10px;
  color: #b8860b;
  opacity: 0.7;
}
.hint-text {
  font-size: 12px;
  color: #998a60;
  margin-top: 8px;
  text-align: center;
}
</style>
