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
        <n-upload action="/api/upload" list-type="image-card" :max="1">
          + 课程封面
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

      <n-form-item label="初始评分">
        <n-space align="center">
          <n-text depth="3">好评：</n-text>
          <n-input-number
            v-model:value="formValue.good_count"
            disabled
            size="small"
            style="width: 80px"
          />
          <n-text depth="3" style="margin-left: 10px">中评：</n-text>
          <n-input-number
            v-model:value="formValue.mid_count"
            disabled
            size="small"
            style="width: 80px"
          />
          <n-text depth="3" style="margin-left: 10px">差评：</n-text>
          <n-input-number
            v-model:value="formValue.bad_count"
            disabled
            size="small"
            style="width: 80px"
          />
          <n-text depth="3" style="margin-left: 10px">(系统自动统计)</n-text>
        </n-space>
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

      <n-form-item label="课程类型">
        <n-select
          v-model:value="formValue.type"
          :options="[
            { label: '图文专栏', value: 'column' },
            { label: '视频课程', value: 'media' },
          ]"
        />
      </n-form-item>

      <div class="outline-container">
        <div
          class="sub-title"
          style="display: flex; justify-content: space-between"
        >
          课程大纲
          <n-button size="small" type="primary" secondary @click="addChapter"
            >添加新章节</n-button
          >
        </div>

        <div
          v-for="(chapter, cIndex) in formValue.chapters"
          :key="cIndex"
          class="chapter-card"
        >
          <div class="chapter-head">
            <n-input
              v-model:value="chapter.title"
              placeholder="输入章节标题..."
              style="flex: 1"
            />
            <n-button text type="error" @click="removeChapter(cIndex)"
              >删除章节</n-button
            >
          </div>

          <div class="section-container">
            <div
              v-for="(section, sIndex) in chapter.sections"
              :key="sIndex"
              class="section-row"
            >
              <n-input
                v-model:value="section.title"
                size="small"
                placeholder="输入小节标题..."
              />
              <n-button text type="error" @click="removeSection(cIndex, sIndex)"
                >删除</n-button
              >
            </div>
            <n-button
              dashed
              block
              size="small"
              style="margin-top: 8px"
              @click="addSection(cIndex)"
            >
              + 添加小节
            </n-button>
          </div>
        </div>
      </div>

      <div class="material-layout">
        <div class="table-box">
          <div class="sub-title">资料列表</div>
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
          <n-upload multiple directory-dnd action="/api/upload">
            <n-upload-dragger>
              <n-icon size="32" :depth="3"><CloudUploadOutline /></n-icon>
              <div style="font-size: 12px; margin-top: 8px">拖拽压缩包上传</div>
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
import { useAddCourseApi } from '~/composables/Api/Course/course';
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

const addChapter = () => formValue.chapters.push({ title: '', sections: [] });
const removeChapter = (i) => formValue.chapters.splice(i, 1);
const addSection = (i) => formValue.chapters[i].sections.push({ title: '' });
const removeSection = (ci, si) => formValue.chapters[ci].sections.splice(si, 1);
// 2. 暂时不使用 loading 和 message，排除干扰
// 修改 handlePublish 内部的 submitData 构造逻辑
const handlePublish = async () => {
  // 1. 获取消息实例（Naive UI 必须）
  const message = useMessage();

  // 2. 基础校验
  if (!formValue.title) {
    message.error('请输入课程标题');
    return;
  }

  loading.value = true;
  try {
    // 3. 构造提交数据
    const submitData = {
      title: formValue.title,
      cover: formValue.cover || 'https://via.placeholder.com/150',
      intro: formValue.desc, // 👈 确认后端是 intro 还是 desc
      serviceContent: formValue.service_content,
      price: formValue.price ?? 0,
      tPrice: formValue.tPrice ?? 0,
      type: formValue.type,
      freeType: 0,
      afterServiceDays: 0,
      remark: '',
      examId: null,
    };

    console.log('🚀 准备发送:', submitData);

    // 4. 调用 API
    const { data, error } = await useAddCourseApi(submitData);

    // 5. 成功后的三部曲
    if (!error.value && (data.value?.code === 200 || data.value > 0)) {
      message.success('保存成功');

      // 第一步：关窗（必做）
      emit('update:show', false);

      // 第二步：刷列表（必做）
      emit('success');

      // 第三步：清数据（防止下次点开还是旧内容）
      // Object.assign(formValue, initialFormValue);
    } else {
      message.error(data.value?.msg || '保存失败');
    }
  } catch (err) {
    console.error('保存报错了:', err);
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
.chapter-card {
  border: 1px solid #eeeeee;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  background-color: #fafafa;
}
.chapter-head {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
}
.section-row {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  padding-left: 20px;
}
</style>
