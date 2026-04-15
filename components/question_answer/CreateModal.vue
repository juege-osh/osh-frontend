<template>
  <n-modal
    :show="show"
    preset="card"
    title="我要提问"
    style="width: 800px"
    :segmented="{ content: 'soft', footer: 'soft' }"
    @update:show="$emit('update:show', $event)"
  >
    <n-form label-placement="left" label-width="100">
      <n-form-item label="资源类型">
        <n-select
          v-model:value="formValue.resourceType"
          placeholder="请选择资源类型（可不选）"
          :options="resourceTypeOptions"
          clearable
        />
      </n-form-item>

      <n-form-item label="资源ID" v-if="formValue.resourceType">
        <n-input-number
          v-model:value="formValue.resourceNo"
          placeholder="请输入资源ID"
          :min="1"
          style="width: 100%"
        />
      </n-form-item>

      <n-form-item label="问题内容" required>
        <n-input
          v-model:value="formValue.content"
          type="textarea"
          placeholder="详细描述你的问题，包括报错信息、环境等...&#10;&#10;提示：清晰的问题描述能帮助你更快获得解答"
          :autosize="{ minRows: 6, maxRows: 12 }"
          maxlength="2000"
          show-count
        />
      </n-form-item>

      <n-form-item label="问题类型">
        <n-radio-group v-model:value="formValue.isPaidOnly">
          <n-space>
            <n-radio :value="0">
              <span>🔓 公开问题（所有人可见）</span>
            </n-radio>
            <n-radio :value="1">
              <span>🔒 付费专属（仅付费用户可见）</span>
            </n-radio>
          </n-space>
        </n-radio-group>
      </n-form-item>

      <n-form-item label="标签">
        <div style="width: 100%">
          <n-space>
            <n-tag
              v-for="(tag, i) in formValue.tags"
              :key="i"
              closable
              @close="formValue.tags.splice(i, 1)"
              type="success"
            >
              {{ tag }}
            </n-tag>
          </n-space>
          <n-space style="margin-top: 10px">
            <n-input
              v-model:value="newTag"
              placeholder="输入标签后回车添加（最多5个）"
              style="width: 300px"
              maxlength="20"
              @keyup.enter="addTag"
            />
            <n-button @click="addTag" :disabled="formValue.tags.length >= 5">
              添加
            </n-button>
          </n-space>
          <div v-if="suggestTags.length > 0" style="margin-top: 10px">
            <n-text depth="3" style="font-size: 12px">推荐标签：</n-text>
            <n-space style="margin-top: 6px">
              <n-tag
                v-for="t in suggestTags"
                :key="t"
                :bordered="false"
                style="cursor: pointer"
                @click="addSuggestTag(t)"
              >
                {{ t }}
              </n-tag>
            </n-space>
          </div>
        </div>
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button @click="$emit('update:show', false)">取消</n-button>
        <n-button
          type="primary"
          @click="handlePublish"
          :loading="loading"
          :disabled="!canSubmit"
        >
          立即发布
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import { createDiscreteApi } from 'naive-ui';
import { apiCreateQuestion, apiPublishQuestion, apiGetQnaTags } from '~/composables/Api/QuestionAnswer/qna.js';
import {
  NModal, NForm, NFormItem, NInput, NInputNumber, NSelect, NRadioGroup, NRadio,
  NSpace, NButton, NTag, NText,
} from 'naive-ui';

const props = defineProps({ show: Boolean });
const emit = defineEmits(['update:show', 'success']);

const { message } = createDiscreteApi(['message']);

const loading = ref(false);
const newTag = ref('');
const suggestTags = ref([]);

const formValue = reactive({
  resourceType: null,
  resourceNo: null,
  content: '',
  isPaidOnly: 0,
  tags: [],
});

const resourceTypeOptions = [
  { label: '课程', value: '课程' },
  { label: '网站', value: '网站' },
  { label: '电子书', value: '电子书' },
];

// 表单验证
const canSubmit = computed(() => {
  return formValue.content.trim().length >= 10;
});

// 监听弹窗打开，加载标签
watch(() => props.show, async (newVal) => {
  if (newVal && suggestTags.value.length === 0) {
    await loadTags();
  }
});

// 加载推荐标签
async function loadTags() {
  try {
    const res = await apiGetQnaTags();
    console.log('标签列表响应:', res);
    
    if (res?.code === 200 && res.data) {
      if (Array.isArray(res.data)) {
        suggestTags.value = res.data
          .map(t => t.name || t)
          .filter(t => t)
          .slice(0, 10);
      }
    }
  } catch (e) {
    console.error('加载标签失败:', e);
  }
}

// 添加标签
function addTag() {
  const t = newTag.value.trim();
  if (!t) {
    return;
  }
  if (formValue.tags.length >= 5) {
    message.warning('最多添加5个标签');
    return;
  }
  if (formValue.tags.includes(t)) {
    message.warning('标签已存在');
    return;
  }
  formValue.tags.push(t);
  newTag.value = '';
}

// 添加推荐标签
function addSuggestTag(t) {
  if (formValue.tags.includes(t)) {
    return;
  }
  if (formValue.tags.length >= 5) {
    message.warning('最多添加5个标签');
    return;
  }
  formValue.tags.push(t);
}

// 重置表单
function resetForm() {
  formValue.resourceType = null;
  formValue.resourceNo = null;
  formValue.content = '';
  formValue.isPaidOnly = 0;
  formValue.tags = [];
  newTag.value = '';
}

// 立即发布（改为：创建问题）
async function handlePublish() {
  // 验证
  if (!formValue.content.trim()) {
    message.warning('请输入问题内容');
    return;
  }
  if (formValue.content.trim().length < 10) {
    message.warning('问题描述至少需要10个字符');
    return;
  }
  if (formValue.resourceType && !formValue.resourceNo) {
    message.warning('请输入资源ID');
    return;
  }

  loading.value = true;
  try {
    // 构建请求数据
    const requestData = {
      content: formValue.content.trim(),
      resourceType: formValue.resourceType || '',
      isPaidOnly: String(formValue.isPaidOnly),
    };

    // 可选字段：资源ID
    if (formValue.resourceNo) {
      requestData.resourceNo = Number(formValue.resourceNo);
    }

    // 暂时不传标签，等后端完善
    // if (formValue.tags.length > 0) {
    //   requestData.tags = formValue.tags;
    // }

    console.log('创建问题请求数据:', requestData);

    // 创建问题
    const createRes = await apiCreateQuestion(requestData);
    
    console.log('创建问题响应:', createRes);
    
    if (createRes?.code === 200) {
      message.success('🎉 问题创建成功！');
      emit('update:show', false);
      emit('success');
      setTimeout(resetForm, 300);
    } else {
      message.error(createRes?.msg || '创建失败，请重试');
    }
  } catch (error) {
    console.error('创建问题失败:', error);
    if (error?.data?.msg) {
      message.error(error.data.msg);
    } else if (error?.message) {
      message.error(error.message);
    } else {
      message.error('创建失败，请检查网络后重试');
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
/* 样式保持简洁 */
</style>
