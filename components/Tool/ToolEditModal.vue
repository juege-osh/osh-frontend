<template>
  <n-modal
    :show="show"
    preset="card"
    :title="modalTitle"
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
          <div class="cover-main">
            <div v-if="previewUrl" class="cover-preview" @click="showPreview = true">
              <img :src="previewUrl" class="cover-img" />
              <div class="cover-mask">点击预览</div>
            </div>
            <div v-else class="cover-placeholder" :class="{ loading: coverUploading }" @click="triggerCover">
              {{ coverUploading ? '上传中...' : '暂无封面' }}
            </div>
            <n-progress
              v-if="coverUploading || uploadProgress > 0"
              type="line"
              :percentage="uploadProgress"
              :show-indicator="true"
              processing
            />
          </div>
          <div class="cover-actions">
            <n-button
              type="primary"
              secondary
              :loading="coverUploading"
              :disabled="coverUploading"
              @click="triggerCover"
            >
              {{ previewUrl ? '修改封面' : '上传封面' }}
            </n-button>
            <span class="upload-tip">建议 16:9，JPG/PNG，≤5MB</span>
          </div>
          <input ref="coverInputRef" type="file" accept="image/*" style="display:none" @change="handleCoverChange" />
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

      <n-form-item label="售卖套餐">
        <div class="package-editor">
          <div
            v-for="(item, index) in formValue.packages"
            :key="item.localKey"
            class="package-row"
          >
            <n-input v-model:value="item.packageName" placeholder="套餐名称" />
            <n-input-number v-model:value="item.useCount" :min="1" placeholder="次数" />
            <n-input-number v-model:value="item.price" :min="0" placeholder="现金">
              <template #prefix>￥</template>
            </n-input-number>
            <n-input-number v-model:value="item.pointCost" :min="0" placeholder="积分" />
            <n-select v-model:value="item.payType" :options="payTypeOptions" />
            <n-input-number v-model:value="item.sortOrder" placeholder="排序" />
            <n-button tertiary type="error" @click="removePackage(index)">删除</n-button>
          </div>
          <n-button secondary type="primary" @click="addPackage">+ 添加套餐</n-button>
        </div>
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space>
        <n-button type="primary" :loading="loading" :disabled="loading" @click="handleSubmit">{{ submitText }}</n-button>
        <n-button @click="$emit('update:show', false)">取消</n-button>
      </n-space>
    </template>
  </n-modal>

  <n-modal v-model:show="showPreview" preset="card" title="封面预览" style="width: 760px">
    <img v-if="previewUrl" :src="previewUrl" class="preview-large-img" />
  </n-modal>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue';
import { createDiscreteApi } from 'naive-ui';
import {
  NModal, NForm, NFormItem, NInput, NSelect, NSpace,
  NInputNumber, NButton, NProgress,
} from 'naive-ui';
import { apiSaveTool, apiUpdateTool, apiUploadToolCover } from '~/composables/Api/Tool/tool';

const props = defineProps({
  show: Boolean,
  tagOptions: { type: Array, default: () => [] },
  editData: { type: Object, default: null },
});
const emit = defineEmits(['update:show', 'success']);

const { message } = createDiscreteApi(['message']);
const loading = ref(false);
const coverUploading = ref(false);
const uploadProgress = ref(0);
const coverInputRef = ref(null);
const showPreview = ref(false);

const formValue = reactive({
  id: null,
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
  packages: [],
});

const isEdit = computed(() => !!props.editData?.id);
const modalTitle = computed(() => isEdit.value ? '修改工具' : '新增工具');
const submitText = computed(() => isEdit.value ? '保存修改' : '保存并发布');
const previewUrl = computed(() => formValue.logoPreview || formValue.logoUrl);

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

const payTypeOptions = [
  { label: '现金', value: 1 },
  { label: '积分', value: 2 },
  { label: '现金+积分', value: 3 },
];

watch(() => props.show, (value) => {
  if (value) resetForm();
});

watch(() => props.editData, () => {
  if (props.show) resetForm();
});

function resetForm() {
  const source = props.editData || {};
  uploadProgress.value = 0;
  showPreview.value = false;
  formValue.id = source.id || null;
  formValue.toolName = source.toolName || '';
  formValue.description = source.description || '';
  formValue.logoUrl = source.logoUrl || '';
  formValue.logoPreview = '';
  formValue.accessType = Number(source.accessType || source.access_type || 1);
  formValue.routePath = source.routePath || source.route_path || '';
  formValue.iframeUrl = source.iframeUrl || source.iframe_url || '';
  formValue.githubUrl = source.githubUrl || source.github_url || '';
  formValue.price = Number(source.price || 0);
  formValue.originalPrice = Number(source.originalPrice || source.original_price || 0);
  formValue.pointCost = Number(source.pointCost || source.point_cost || 0);
  formValue.status = source.status ?? 1;
  formValue.remark = source.remark || '';
  formValue.resourceType = source.resourceType || source.resource_type || 'FREE';
  formValue.level = Number(source.level || 1);
  formValue.tags = Array.isArray(source.tags) ? [...source.tags] : [];
  formValue.packages = normalizePackages(source.packages);
}

const triggerCover = () => coverInputRef.value?.click();

function createEmptyPackage() {
  return {
    localKey: `${Date.now()}-${Math.random()}`,
    id: null,
    packageName: '',
    useCount: 10,
    price: 0,
    pointCost: 0,
    payType: 1,
    status: 1,
    sortOrder: 0,
  };
}

function normalizePackages(packages) {
  if (!Array.isArray(packages)) {
    return [];
  }
  return packages.map((item) => ({
    localKey: `${item.id || 'new'}-${Date.now()}-${Math.random()}`,
    id: item.id || null,
    packageName: item.packageName || item.package_name || '',
    useCount: Number(item.useCount || item.use_count || 1),
    price: Number(item.price || 0),
    pointCost: Number(item.pointCost || item.point_cost || 0),
    payType: Number(item.payType || item.pay_type || 1),
    status: item.status ?? 1,
    sortOrder: Number(item.sortOrder || item.sort_order || 0),
  }));
}

function addPackage() {
  formValue.packages.push(createEmptyPackage());
}

function removePackage(index) {
  formValue.packages.splice(index, 1);
}

async function handleCoverChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    message.warning('封面不能超过 5MB');
    e.target.value = '';
    return;
  }
  coverUploading.value = true;
  uploadProgress.value = 0;
  try {
    const res = await apiUploadToolCover(file, (percent) => {
      uploadProgress.value = percent;
    });
    if (res?.code === 200) {
      formValue.logoPreview = res.data?.url || '';
      formValue.logoUrl = res.data?.relativePath || '';
      uploadProgress.value = 100;
      message.success('封面上传成功');
    } else {
      message.error(res?.msg || '上传失败');
    }
  } catch (err) {
    console.error('工具封面上传失败:', err);
    message.error('上传失败');
  } finally {
    coverUploading.value = false;
    setTimeout(() => {
      if (!coverUploading.value) uploadProgress.value = 0;
    }, 800);
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
  for (const item of formValue.packages) {
    if (!item.packageName?.trim()) {
      message.error('请输入套餐名称');
      return;
    }
    if (!item.useCount || item.useCount <= 0) {
      message.error('套餐次数必须大于0');
      return;
    }
  }

  loading.value = true;
  try {
    const body = {
      id: formValue.id,
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
      packages: formValue.packages.map((item) => ({
        id: item.id,
        packageName: item.packageName,
        useCount: item.useCount,
        price: item.price || 0,
        pointCost: item.pointCost || 0,
        payType: item.payType || 1,
        status: item.status ?? 1,
        sortOrder: item.sortOrder || 0,
      })),
      tags: formValue.tags.map((tag) => {
        if (typeof tag === 'string' && isNaN(Number(tag))) return tag;
        const option = props.tagOptions.find((item) => item.value === tag || String(item.value) === String(tag));
        return option ? option.label : String(tag);
      }),
    };
    const res = isEdit.value ? await apiUpdateTool(body) : await apiSaveTool(body);
    if (res?.code === 200) {
      message.success(isEdit.value ? '工具修改成功' : '工具创建成功');
      emit('success');
      emit('update:show', false);
    } else {
      message.error(res?.msg || '保存失败');
    }
  } catch (err) {
    console.error(isEdit.value ? '修改工具失败:' : '新增工具失败:', err);
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
  align-items: flex-start;
  gap: 14px;
}
.cover-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 176px;
}
.cover-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
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
  line-height: 1.5;
}
.preview-large-img {
  display: block;
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 6px;
  background: #f3f4f6;
}
.package-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.package-row {
  display: grid;
  grid-template-columns: minmax(140px, 1.4fr) minmax(90px, 0.8fr) minmax(110px, 0.9fr) minmax(100px, 0.8fr) minmax(120px, 1fr) minmax(90px, 0.8fr) auto;
  gap: 8px;
  align-items: center;
}
@media (max-width: 780px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .cover-upload {
    flex-direction: column;
  }
  .package-row {
    grid-template-columns: 1fr;
  }
}
</style>
