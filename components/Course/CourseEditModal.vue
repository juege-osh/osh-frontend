<template>
  <n-modal
    :show="show"
    preset="card"
    title="课程新增界面"
    style="width: 1000px"
    size="huge"
    :segmented="{ content: 'soft', footer: 'soft' }"
    @update:show="$emit('update:show', $event)"
  >
    <n-form label-placement="left" label-width="100">
      <n-form-item label="课程标题">
        <n-input v-model:value="formValue.title" placeholder="请输入课程标题" />
      </n-form-item>

      <n-form-item label="课程封面">
        <div class="cover-upload">
          <div v-if="formValue.cover" class="cover-preview" @click="triggerCover">
            <img :src="formValue.cover" class="cover-img" />
            <div class="cover-mask">点击更换</div>
          </div>
          <div v-else class="cover-placeholder" @click="triggerCover" :class="{ loading: coverUploading }">
            {{ coverUploading ? '上传中...' : '+ 点击上传封面' }}
          </div>
          <input ref="coverInputRef" type="file" accept="image/*" style="display:none" @change="handleCoverChange" />
          <span style="font-size:12px;color:#bbb;margin-left:10px">建议 16:9，JPG/PNG，≤5MB</span>
        </div>
      </n-form-item>

      <n-form-item label="课程介绍">
        <n-input
          v-model:value="formValue.desc"
          type="textarea"
          placeholder="请输入课程介绍"
          :autosize="{ minRows: 2 }"
        />
      </n-form-item>

      <n-form-item label="服务周期 (月)">
        <n-input
          v-model:value="formValue.service_period"
          placeholder="服务周期 (月)"
        />
      </n-form-item>

      <n-form-item label="具体包含服务">
        <n-input
          v-model:value="formValue.service_content"
          placeholder="具体包含服务"
        />
      </n-form-item>

      <n-form-item label="课程标签">
        <n-select
          v-model:value="formValue.tagIds"
          multiple
          filterable
          placeholder="请选择课程标签"
          :options="tagOptions"
        />
      </n-form-item>

      <n-form-item label="课程价格">
        <n-space>
          <n-input-number
            v-model:value="formValue.price"
            :min="0"
            placeholder="实际售价"
          >
            <template #prefix>￥</template>
          </n-input-number>
          <n-text depth="3">原价：</n-text>
          <n-input-number
            v-model:value="formValue.tPrice"
            :min="0"
            placeholder="划线价"
          >
            <template #prefix>￥</template>
          </n-input-number>
        </n-space>
      </n-form-item>

      <div class="material-layout">
        <div class="table-box">
          <n-table size="small" :single-line="false">
            <thead>
              <tr>
                <th>资料名称</th>
                <th>URL</th>
                <th>大小</th>
                <th>类型</th>
                <th>下载</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(f, i) in materialList" :key="i">
                <td>{{ f.name }}</td>
                <td>
                  <n-text depth="3">{{ f.url }}</n-text>
                </td>
                <td>{{ f.size }}</td>
                <td>{{ f.type }}</td>
                <td>{{ f.download_count }}</td>
                <td>
                  <n-space>
                    <n-button text type="primary" @click="handleDownload(f)">下载</n-button>
                    <n-button
                      text
                      type="error"
                      @click="materialList.splice(i, 1)"
                      >删除</n-button
                    >
                  </n-space>
                </td>
              </tr>
            </tbody>
          </n-table>
        </div>
        <div class="upload-box">
          <div class="mat-upload-btn" @click="triggerMat" :class="{ loading: matUploading }">
            {{ matUploading ? '上传中...' : '⬆ 上传资料' }}
          </div>
          <input ref="matInputRef" type="file" style="display:none" @change="handleMatChange" />
        </div>
      </div>
    </n-form>

    <template #footer>
      <n-space>
        <n-button type="primary" @click="handlePublish">保存并发布</n-button>
        <n-button @click="$emit('update:show', false)">取消</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { createDiscreteApi } from 'naive-ui';
import {
  apiUploadCover,
  apiUploadMaterial,
  apiGetMaterialUrl,
  useAddCourseApi,
  getAuthHeaders,
} from '~/composables/Api/Course/course';
import {
  NModal, NForm, NFormItem, NInput, NSelect, NSpace,
  NText, NInputNumber, NButton, NTable,
} from 'naive-ui';

const props = defineProps({ show: Boolean, tagOptions: Array });
const emit = defineEmits(['update:show', 'success']);

const { message } = createDiscreteApi(['message']);
const loading = ref(false);
const coverUploading = ref(false);
const matUploading = ref(false);
const coverInputRef = ref(null);
const matInputRef = ref(null);

const formValue = reactive({
  title: '',
  desc: '',
  tagIds: [],
  cover: '',
  service_period: 12,
  service_content: '源码+文档+技术支持',
  price: 0,
  tPrice: 0,
  type: 'media',
});

const materialList = ref([]);

/** 触发封面选择 */
const triggerCover = () => coverInputRef.value?.click();

/** 封面上传 */
const handleCoverChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { message.warning('封面不能超过 5MB'); return; }
  coverUploading.value = true;
  try {
    const res = await apiUploadCover(file);
    if (res?.code === 200) {
      formValue.cover = res.data?.relativePath || res.data; // 存 relativePath
      message.success('封面上传成功');
    } else {
      message.error(res?.msg || '上传失败');
    }
  } catch { message.error('上传失败'); }
  finally { coverUploading.value = false; e.target.value = ''; }
};

/** 触发资料选择 */
const triggerMat = () => matInputRef.value?.click();

/** 资料上传 */
const handleMatChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  matUploading.value = true;
  try {
    const res = await apiUploadMaterial(file, file.name);
    if (res?.code === 200) {
      materialList.value.push({
        id: res.data?.materialId,
        name: res.data?.materialName || file.name,
        url: res.data?.fileUrl,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: res.data?.fileType || file.name.split('.').pop(),
      });
      message.success('资料上传成功');
    } else {
      message.error(res?.msg || '上传失败');
    }
  } catch { message.error('上传失败'); }
  finally { matUploading.value = false; e.target.value = ''; }
};

/** 下载资料（获取临时URL） */
const handleDownload = async (mat) => {
  if (!mat.id) { window.open(mat.url, '_blank'); return; }
  try {
    const res = await apiGetMaterialUrl(mat.id, 120);
    window.open(res?.code === 200 ? res.data : mat.url, '_blank');
  } catch { window.open(mat.url, '_blank'); }
};

/** 保存并发布 */
const handlePublish = async () => {
  if (!formValue.title) { message.error('请输入课程标题'); return; }
  loading.value = true;
  try {
    const submitData = {
      title: formValue.title,
      desc: formValue.desc,
      intro: formValue.desc,
      cover: String(formValue.cover || ''),
      tagIds: formValue.tagIds,
      service_period: formValue.service_period,
      service_content: formValue.service_content,
      price: formValue.price,
      tPrice: formValue.tPrice,
      type: formValue.type,
      materials: materialList.value.map((m) => ({
        materialName: m.name,
        fileUrl: m.url,
        fileType: m.type,
      })),
    };
    // useAddCourseApi 内部 transform 后 data.value 是后端 data 字段（课程ID）
    // 所以直接判断 data.value 有值即为成功
    const { data, error } = await useAddCourseApi(submitData);
    if (!error.value && data.value) {
      message.success('课程创建成功！');
      emit('success');
      emit('update:show', false);
    } else {
      message.error('保存失败');
    }
  } catch { message.error('网络异常'); }
  finally { loading.value = false; }
};
</script>

<style scoped>
/* 这里拷贝你原来的弹窗相关样式，确保 UI 不变 */
.material-layout {
  display: flex;
  gap: 20px;
  margin-top: 24px;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}
.table-box { flex: 1; }
.upload-box { width: 200px; }
.sub-title { font-weight: bold; margin-bottom: 10px; font-size: 14px; color: #333; }

.cover-upload { display: flex; align-items: center; gap: 0; }
.cover-preview {
  position: relative; width: 160px; height: 90px; border-radius: 4px;
  overflow: hidden; cursor: pointer;
}
.cover-img { width: 100%; height: 100%; object-fit: cover; }
.cover-mask {
  position: absolute; inset: 0; background: rgba(0,0,0,0.4); color: #fff;
  display: flex; justify-content: center; align-items: center; font-size: 13px;
  opacity: 0; transition: opacity 0.2s;
}
.cover-preview:hover .cover-mask { opacity: 1; }
.cover-placeholder {
  width: 160px; height: 90px; border: 2px dashed #ddd; border-radius: 4px;
  display: flex; justify-content: center; align-items: center;
  font-size: 13px; color: #999; cursor: pointer; transition: all 0.2s;
}
.cover-placeholder:hover, .cover-placeholder.loading { border-color: #18a058; color: #18a058; }

.mat-upload-btn {
  border: 2px dashed #ddd; border-radius: 6px; padding: 20px;
  text-align: center; cursor: pointer; font-size: 13px; color: #666;
  transition: all 0.2s;
}
.mat-upload-btn:hover, .mat-upload-btn.loading { border-color: #18a058; color: #18a058; }
</style>
