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
        <n-upload
          :action="currentCourseId ? getCoverUploadUrl(currentCourseId) : ''"
          :disabled="!currentCourseId"
          list-type="image-card"
          :max="1"
          @finish="handleCoverFinish"
        >
          <div
            v-if="!currentCourseId"
            style="font-size: 12px; text-align: center; color: #999"
          >
            请先点击<br />下方保存
          </div>
          <template v-else> + 封面 </template>
        </n-upload>
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
                    <n-button text type="primary">下载</n-button>
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
          <n-upload
            multiple
            directory-dnd
            :action="
              currentCourseId ? getMaterialUploadUrl(currentCourseId) : ''
            "
            :disabled="!currentCourseId"
            :data="{ materialName: '课程附件' }"
            @finish="handleMaterialFinish"
          >
            <n-upload-dragger>
              <div v-if="!currentCourseId" style="padding: 20px">
                <n-text depth="3">⚠️ 请先保存基础信息再上传资料</n-text>
              </div>
              <template v-else>
                <n-icon size="32" :depth="3"><CloudUploadOutline /></n-icon>
                <div style="font-size: 12px; margin-top: 8px">
                  拖拽或点击上传
                </div>
              </template>
            </n-upload-dragger>
          </n-upload>
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
import { reactive, ref } from 'vue';
import { CloudUploadOutline } from '@vicons/ionicons5';
import {
  getCoverUploadUrl,
  getMaterialUploadUrl,
  useAddCourseApi,
} from '~/composables/Api/Course/course';
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NUpload,
  NSelect,
  NSpace,
  NText,
  NInputNumber,
  NButton,
  NTable,
  NIcon,
  NUploadDragger,
  useMessage,
} from 'naive-ui';
// 2. 初始化 message 实例

// 3. 定义 loading 状态
const loading = ref(false);

defineProps({
  show: Boolean,
  tagOptions: Array,
});

const emit = defineEmits(['update:show', 'success']);
const currentCourseId = ref(null);

const formValue = reactive({
  title: '',
  desc: '',
  tagIds: [],
  service_period: 12,
  service_content: '源码+文档+技术支持',
  // ✨ 增加以下字段
  price: 0, // 实际售价
  tPrice: 0, // 课程原价
  type: 'media', // 默认类型
  cover: '', // 封面地址
  good_count: 0,
  mid_count: 0,
  bad_count: 0,
  chapters: [
    { title: '第一章：项目介绍', sections: [{ title: '1-1 课程导学' }] },
  ],
});

const materialList = ref([
  {
    name: 'core_code.zip',
    url: 'http://...',
    size: '25.0 MB',
    type: 'zip',
    download_count: 0,
  },
]);

/**
 * 封面上传成功
 */
const handleCoverFinish = ({ event }) => {
  // ✨ 关键：挪到函数里！只有点击上传、后端返回后才执行
  const message = useMessage();

  const res = JSON.parse(event.target.response);
  if (res.code === 200) {
    formValue.cover = res.data.url;
    message.success('封面上传成功');
  }
};

/**
 * 资料上传成功回调
 */
/**
 * 资料上传成功
 */
const handleMaterialFinish = ({ file, event }) => {
  // ✨ 关键：挪到函数里！
  const message = useMessage();

  const res = JSON.parse(event.target.response);
  if (res.code === 200) {
    materialList.value.push({
      name: file.name,
      url: res.data,
      size: (file.file.size / 1024 / 1024).toFixed(2) + ' MB',
    });
    message.success(`${file.name} 上传成功`);
  }
};
// 2. 暂时不使用 loading 和 message，排除干扰
// 修改 handlePublish 内部的 submitData 构造逻辑
const handlePublish = async () => {
  const message = useMessage();
  if (!formValue.title) {
    message.error('请输入课程标题');
    return;
  }

  loading.value = true;
  try {
    const submitData = {
      title: formValue.title,
      intro: formValue.desc,
      serviceContent: formValue.service_content,
      price: formValue.price ?? 0,
      tPrice: formValue.tPrice ?? 0,
      type: formValue.type,
      // 初始创建时不带 cover，因为后端现在要单独上传
    };

    const { data, error } = await useAddCourseApi(submitData);

    if (!error.value && (data.value?.code === 200 || data.value?.data > 0)) {
      // ✨ 重点：拿到后端返回的 ID
      // 注意：根据你后端 R.ok() 的结构，ID 可能在 data.data 里
      currentCourseId.value = data.value.data || data.value;

      message.success('基础信息保存成功！现在可以上传封面和资料了');

      // 注意：这里先不要 emit('update:show', false)，让用户传完图再走
      emit('success'); // 刷新列表
    } else {
      message.error(data.value?.msg || '保存失败');
    }
  } catch (err) {
    message.error('网络异常');
  } finally {
    loading.value = false;
  }
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
.table-box {
  flex: 1;
}
.upload-box {
  width: 280px;
}
.sub-title {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}
</style>
