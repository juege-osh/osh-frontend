<template>
  <n-modal
    :show="show"
    preset="card"
    title="新增工具"
    style="width: 920px"
    size="huge"
    :segmented="{ content: 'soft', footer: 'soft' }"
    @update:show="$emit('update:show', $event)"
  >
    <n-form label-placement="left" label-width="100">
      <div class="form-grid">
        <n-form-item label="工具名称">
          <n-input v-model:value="formValue.toolName" placeholder="请输入工具名称，如图片转PDF" />
        </n-form-item>

        <n-form-item label="访问类型">
          <n-select
            v-model:value="formValue.accessType"
            :options="accessTypeOptions"
            placeholder="请选择访问类型"
          />
        </n-form-item>
      </div>

      <n-form-item label="工具封面">
        <div class="cover-upload">
          <div v-if="formValue.logoUrl" class="cover-preview" @click="triggerCover">
            <img :src="formValue.logoPreview || formValue.logoUrl" class="cover-img" />
            <div class="cover-mask">点击更换</div>
          </div>
          <div v-else class="cover-placeholder" :class="{ loading: coverUploading }" @click="triggerCover">
            {{ coverUploading ? '上传中...' : '+ 点击上传封面' }}
          </div>
          <input ref="coverInputRef" type="file" accept="image/*" style="display:none" @change="handleCoverChange" />
          <span class="upload-tip">建议 16:9，JPG/PNG，≤5MB</span>
        </div>
      </n-form-item>

      <n-form-item label="工具描述">
        <n-input
          v-model:value="formValue.description"
          type="textarea"
          placeholder="请输入工具简介、使用场景或能力说明"
          :autosize="{ minRows: 3 }"
        />
      </n-form-item>

      <div class="form-grid">
        <n-form-item :label="formValue.accessType === 2 ? 'iframe地址' : '前端路由'">
          <n-input
            v-if="formValue.accessType === 2"
            v-model:value="formValue.iframeUrl"
            placeholder="请输入第三方 iframe 地址"
          />
          <n-input
            v-else
            v-model:value="formValue.routePath"
            placeholder="请输入站内工具路由，如 /tool/image-to-pdf"
          />
        </n-form-item>

        <n-form-item label="GitHub">
          <n-input v-model:value="formValue.githubUrl" placeholder="可选，GitHub 地址" />
        </n-form-item>
      </div>

      <div class="form-grid">
        <n-form-item label="资源类型">
          <n-select
            v-model:value="formValue.resourceType"
            :options="resourceTypeOptions"
            placeholder="请选择资源类型"
          />
        </n-form-item>

        <n-form-item label="资源等级">
          <n-input-number v-model:value="formValue.level" :min="1" :max="99" style="width: 100%" />
        </n-form-item>
      </div>

      <div class="form-grid">
        <n-form-item label="当前价格">
          <n-input-number v-model:value="formValue.price" :min="0" style="width: 100%">
            <template #prefix>￥</template>
          </n-input-number>
        </n-form-item>

        <n-form-item label="原价">
          <n-input-number v-model:value="formValue.originalPrice" :min="0" style="width: 100%">
            <template #prefix>￥</template>
          </n-input-number>
        </n-form-item>
      </div>

      <div class="form-grid">
        <n-form-item label="积分消耗">
          <n-input-number v-model:value="formValue.pointCost" :min="0" style="width: 100%" />
        </n-form-item>

        <n-form-item label="工具标签">
          <n-select
            v-model:value="formValue.tags"
            multiple
            filterable
            tag
            placeholder="选择已有标签或输入新标签后回车"
            :options="tagOptions"
          />
        </n-form-item>
      </div>

      <n-form-item label="备注">
        <n-input v-model:value="formValue.remark" placeholder="可选，后台备注" />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space>
        <n-button type="primary" :loading="loading" :disabled="loading" @click="handleSubmit">保存并发布</n-button>
        <n-button @click="$emit('update:show', false)">取消</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { createDiscreteApi } from 'naive-ui';
import {
  NModal, NForm, NFormItem, NInput, NSelect, NSpace,
  NInputNumber, NButton,
} from 'naive-ui';
import { apiSaveTool, apiUploadToolCover } from '~/composables/Api/Tool/tool';

const props = defineProps({
  show: Boolean,
  tagOptions: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:show', 'success']);

const { message } = createDiscreteApi(['message']);
const loading = ref(false);
const coverUploading = ref(false);
const coverInputRef = ref(null);

const formValue = reactive({
  toolName: '',
  description: '',
  logoUrl: '',
  logoPreview: '',
  accessType: 1,
  routePath: '',
  iframeUrl: '',
  githubUrl: '',
  price: 0,
  originalPrice: 0,
  pointCost: 0,
  status: 1,
  remark: '',
  resourceType: 'FREE',
  level: 1,
  tags: [],
});

const accessTypeOptions = [
  { label: '站内工具', value: 1 },
  { label: 'iframe第三方工具', value: 2 },
];

const resourceTypeOptions = [
  { label: '免费', value: 'FREE' },
  { label: '仅现金', value: 'CASH_ONLY' },
  { label: '现金&积分', value: 'CASH_POINT' },
  { label: 'VIP免费', value: 'VIP' },
  { label: '小班免费', value: 'SMALL_CLASS' },
  { label: '内部免费', value: 'INTERNAL' },
];

watch(() => props.show, (value) => {
  if (value) resetForm();
});

function resetForm() {
  formValue.toolName = '';
  formValue.description = '';
  formValue.logoUrl = '';
  formValue.logoPreview = '';
  formValue.accessType = 1;
  formValue.routePath = '';
  formValue.iframeUrl = '';
  formValue.githubUrl = '';
  formValue.price = 0;
  formValue.originalPrice = 0;
  formValue.pointCost = 0;
  formValue.status = 1;
  formValue.remark = '';
  formValue.resourceType = 'FREE';
  formValue.level = 1;
  formValue.tags = [];
}

const triggerCover = () => coverInputRef.value?.click();

async function handleCoverChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    message.warning('封面不能超过 5MB');
    e.target.value = '';
    return;
  }
  coverUploading.value = true;
  try {
    const res = await apiUploadToolCover(file);
    if (res?.code === 200) {
      formValue.logoPreview = res.data?.url || '';
      formValue.logoUrl = res.data?.relativePath || '';
      message.success('封面上传成功');
    } else {
      message.error(res?.msg || '上传失败');
    }
  } catch (err) {
    console.error('工具封面上传失败:', err);
    message.error('上传失败');
  } finally {
    coverUploading.value = false;
    e.target.value = '';
  }
}

async function handleSubmit() {
  if (!formValue.toolName?.trim()) {
    message.error('请输入工具名称');
    return;
  }
  if (!formValue.logoUrl) {
    message.error('请上传工具封面');
    return;
  }
  if (formValue.accessType === 1 && !formValue.routePath?.trim()) {
    message.error('请输入站内工具前端路由');
    return;
  }
  if (formValue.accessType === 2 && !formValue.iframeUrl?.trim()) {
    message.error('请输入第三方 iframe 地址');
    return;
  }

  loading.value = true;
  try {
    const body = {
      toolName: formValue.toolName,
      description: formValue.description,
      logoUrl: formValue.logoUrl,
      accessType: formValue.accessType,
      routePath: formValue.accessType === 1 ? formValue.routePath : null,
      iframeUrl: formValue.accessType === 2 ? formValue.iframeUrl : null,
      githubUrl: formValue.githubUrl,
      price: formValue.price,
      originalPrice: formValue.originalPrice,
      pointCost: formValue.pointCost,
      status: formValue.status,
      remark: formValue.remark,
      resourceType: formValue.resourceType,
      level: formValue.level,
      tags: formValue.tags.map((tag) => {
        if (typeof tag === 'string' && isNaN(Number(tag))) return tag;
        const option = props.tagOptions.find((item) => item.value === tag || String(item.value) === String(tag));
        return option ? option.label : String(tag);
      }),
    };
    const res = await apiSaveTool(body);
    if (res?.code === 200) {
      message.success('工具创建成功');
      emit('success');
      emit('update:show', false);
    } else {
      message.error(res?.msg || '保存失败');
    }
  } catch (err) {
    console.error('新增工具失败:', err);
    message.error('网络异常');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: 18px;
}
.cover-upload {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cover-preview {
  position: relative;
  width: 176px;
  height: 99px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
}
.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.42);
  opacity: 0;
  transition: opacity 0.2s;
}
.cover-preview:hover .cover-mask {
  opacity: 1;
}
.cover-placeholder {
  width: 176px;
  height: 99px;
  border: 2px dashed #d8dde6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8a94a6;
  font-size: 13px;
  cursor: pointer;
  background: #fafbfc;
  transition: all 0.2s;
}
.cover-placeholder:hover,
.cover-placeholder.loading {
  border-color: #18a058;
  color: #18a058;
  background: #f0fdf4;
}
.upload-tip {
  color: #999;
  font-size: 12px;
}
@media (max-width: 780px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
