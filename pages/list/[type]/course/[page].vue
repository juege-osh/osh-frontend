<template>
  <div class="course-container">
    <n-breadcrumb class="breadcrumb-wrapper">
      <n-breadcrumb-item><nuxt-link to="/">首页</nuxt-link></n-breadcrumb-item>
      <n-breadcrumb-item>所有课程</n-breadcrumb-item>
    </n-breadcrumb>

    <div class="compact-filter">
      <n-space align="center" justify="space-between">
        <n-space>
          <n-select
            v-model:value="queryParams.tagIds"
            multiple
            filterable
            placeholder="按标签筛选 (可多选)"
            :options="tagOptions"
            style="width: 260px"
            @update:value="handleSearch"
          />

          <n-select
            v-model:value="queryParams.type"
            placeholder="课程类型"
            :options="typeOptions"
            style="width: 140px"
            clearable
            @update:value="handleSearch"
          />

          <n-input
            v-model:value="queryParams.keyword"
            placeholder="搜索课程..."
            style="width: 220px"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix
              ><n-icon><SearchOutline /></n-icon
            ></template>
          </n-input>
        </n-space>

        <n-button type="primary" @click="showCreateModal = true">
          <template #icon
            ><n-icon><Add /></n-icon
          ></template>
          新增课程
        </n-button>
      </n-space>
    </div>

    <n-grid :x-gap="16" :y-gap="16" :cols="5">
      <n-gi v-for="item in mockRows" :key="item.id">
        <div class="mini-course-card" @click="handleDetail(item.id)">
          <div class="mini-cover">
            <img :src="item.cover" />
            <div class="mini-type">{{ formatType(item.type) }}</div>
          </div>
          <div class="mini-info">
            <h4 class="mini-title">{{ item.title }}</h4>
            <div class="mini-stats">
              <span class="mini-price" v-if="item.price > 0"
                >¥{{ item.price }}</span
              >
              <span class="mini-price free" v-else>免费</span>
              <span class="mini-count">{{ item.buyCount }} 人学过</span>
            </div>
            <div class="mini-rating">
              <div
                class="rate-bar good"
                :style="{ flex: item.goodCount }"
              ></div>
              <div class="rate-bar mid" :style="{ flex: item.midCount }"></div>
              <div class="rate-bar bad" :style="{ flex: item.badCount }"></div>
            </div>
          </div>
        </div>
      </n-gi>
    </n-grid>

    <div class="pagination-wrapper">
      <n-pagination :page="1" :item-count="100" :page-size="10" />
    </div>
    <n-modal
      v-model:show="showCreateModal"
      preset="card"
      title="课程新增界面"
      style="width: 1000px"
      size="huge"
      :segmented="{ content: 'soft', footer: 'soft' }"
    >
      <n-form label-placement="left" label-width="100">
        <n-form-item label="课程标题">
          <n-input
            v-model:value="formValue.title"
            placeholder="请输入课程标题"
          />
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
            <n-text depth="3" style="margin-left: 10px"
              >(初始评分由系统自动统计，不可手动修改)</n-text
            >
          </n-space>
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
                <n-button
                  text
                  type="error"
                  @click="removeSection(cIndex, sIndex)"
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
                  <th>资料文件URL</th>
                  <th>文件大小</th>
                  <th>文件类型</th>
                  <th>下载次数</th>
                  <th>ACTIONS</th>
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
                        size="small"
                        style="margin-top: 10px"
                        @click="clearMaterials"
                        >一键删除资料</n-button
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
                <div style="font-size: 12px; margin-top: 8px">
                  拖拽压缩包文件(.zip, .rar)到此处上传<br />
                  (必须格式：上传，压缩包上传)
                </div>
                <n-button size="small" style="margin-top: 10px"
                  >一键删除资料</n-button
                >
              </n-upload-dragger>
            </n-upload>
          </div>
        </div>
      </n-form>
      <template #footer>
        <n-space>
          <n-button type="primary" @click="handlePublish">保存并发布</n-button>
          <n-button @click="showCreateModal = false">取消</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import {
  NGrid,
  NGi,
  NPagination,
  NBreadcrumb,
  NBreadcrumbItem,
  NInput,
  NSelect,
  NSpace,
  NButton,
  NIcon,
  NModal,
  NForm,
  NFormItem,
  NRadio,
  NRadioGroup,
  NInputNumber,
  NUpload,
  NUploadDragger,
  NTable,
  NText,
} from 'naive-ui';
import { Add, SearchOutline, CloudUploadOutline } from '@vicons/ionicons5';
const queryParams = reactive({
  keyword: '',
  tagIds: [],
  type: null,
});

// --- 新增课程弹窗控制 ---
const showCreateModal = ref(false);
// --- 找到 formValue 修改如下 ---
const formValue = reactive({
  title: '',
  desc: '',
  tagIds: [], // 新增：存放选中的标签ID
  service_period: 12,
  service_content: '源码+文档+技术支持',
  rating_type: 'good',
  // 评分初始全部写死为 0
  good_count: 0,
  mid_count: 0,
  bad_count: 0,
  // 新增：章节大纲数据结构
  chapters: [
    { title: '第一章：项目介绍', sections: [{ title: '1-1 课程导学' }] },
  ],
});

// 资料列表假数据
// 修改资料列表假数据，对齐 UI 字段
const materialList = ref([
  {
    name: 'core_code.zip',
    url: 'http://www....',
    size: '25.0 MB',
    type: 'zip/rar',
    download_count: 0,
  },
  {
    name: 'setup_guide.rar',
    url: 'http://www....',
    size: '16.8 MB',
    type: 'zip/rar',
    download_count: 1,
  },
]);

const addChapter = () => {
  formValue.chapters.push({ title: '', sections: [] });
};

const removeChapter = (index) => {
  formValue.chapters.splice(index, 1);
};

const addSection = (chapterIndex) => {
  formValue.chapters[chapterIndex].sections.push({ title: '' });
};

const removeSection = (chapterIndex, sectionIndex) => {
  formValue.chapters[chapterIndex].sections.splice(sectionIndex, 1);
};

const clearMaterials = () => {
  materialList.value = [];
};

const handlePublish = () => {
  // 这里以后接后端接口
  window.$message?.success('课程发布成功！');
  showCreateModal.value = false;
};

// 标签下拉框数据 - 后续通过接口 tags.map(v => ({label: v.name, value: v.id})) 填充
const tagOptions = [
  { label: 'Vue3', value: 1 },
  { label: 'Nuxt3', value: 2 },
  { label: 'Node.js', value: 3 },
  { label: 'Python', value: 4 },
  { label: 'AI实战', value: 5 },
  { label: '信息差', value: 6 },
];

const typeOptions = [
  { label: '视频课', value: 'media' },
  { label: '直播课', value: 'live' },
  { label: '图文课', value: 'text' },
];

// Mock 10条数据，体现紧凑感
const mockRows = ref(
  Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    title:
      i % 2 === 0
        ? '全栈开发实战：从零构建高性能助手'
        : '程序员副业指南：信息差变现之道',
    cover: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
    type: ['media', 'live', 'text'][i % 3],
    price: (i * 50).toFixed(2),
    buyCount: 100 + i * 150,
    goodCount: 90,
    midCount: 8,
    badCount: 2,
  }))
);

const handleSearch = () => console.log('Searching...', queryParams);
// 在课程列表页的 <script setup> 中
const handleDetail = (id) => {
  // 注意：这里路径改成了并列的 course_detail
  navigateTo(`/course_detail/${id}`);
};
const handleNewCourse = () => navigateTo('/course/create');

const formatType = (t) => {
  const map = { media: '视频', live: '直播', text: '图文' };
  return map[t] || '课程';
};
</script>

<style scoped>
.course-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
.breadcrumb-wrapper {
  margin-bottom: 20px;
}

.compact-filter {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-bottom: 24px;
}

/* 紧凑型卡片样式 */
.mini-course-card {
  background: #fff;
  border: 1px solid #efeff5;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}
.mini-course-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #18a058;
}

.mini-cover {
  position: relative;
  height: 110px; /* 缩小高度 */
  background: #f5f5f5;
}
.mini-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mini-type {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
}

.mini-info {
  padding: 10px;
}
.mini-title {
  font-size: 13px;
  font-weight: bold;
  margin: 0 0 8px 0;
  height: 36px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.mini-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.mini-price {
  color: #d03050;
  font-weight: bold;
  font-size: 14px;
}
.mini-price.free {
  color: #18a058;
}
.mini-count {
  font-size: 11px;
  color: #999;
}

/* 评价比例条 - 紧凑展示评价 */
.mini-rating {
  height: 3px;
  display: flex;
  border-radius: 2px;
  overflow: hidden;
  background: #eee;
}
.rate-bar.good {
  background: #18a058;
}
.rate-bar.mid {
  background: #f0a020;
}
.rate-bar.bad {
  background: #d03050;
}

.pagination-wrapper {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

/* =========================================
   新增课程弹窗组件专用样式 (对齐 UI 稿)
   ========================================= */

/* 弹窗整体内部间距 */
:deep(.n-modal.n-card) {
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1) !important;
}

/* 弹窗头部标题加粗 */
:deep(.n-card__header-title) {
  font-weight: bold;
  font-size: 18px;
  color: #165d69;
}

/* 弹窗底部底部留白 */
:deep(.n-card__footer) {
  padding-bottom: 24px !important;
}

/* 资料列表与上传布局 (Flex 左右分栏) */
.material-layout {
  display: flex;
  gap: 20px;
  margin-top: 24px;
  border-top: 1px solid #f0f0f0; /* 分割线 */
  padding-top: 20px;
}

/* 左侧：资料表格 */
.table-box {
  flex: 1;
}

/* 右侧：上传区宽度固定 */
.upload-box {
  width: 280px;
}

/* 子标题 (如：资料列表) */
.sub-title {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 14px;
  color: #333;
}

/* 评分设置区小单选框对齐 */
:deep(.n-radio__label) {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 让表单标签加粗，统一风格 */
:deep(.n-form-item-label) {
  font-weight: bold !important;
}
/* 额外补充一点点样式优化 */
:deep(.n-upload-dragger) {
  padding: 20px;
  border: 1px dashed #ddd;
}

.table-box :deep(th) {
  background-color: #f7f9fb !important;
  font-weight: bold;
}

/* 评价条的小圆角优化 */
.mini-rating {
  height: 4px;
  margin-top: 4px;
}
.rate-bar:first-child {
  border-top-left-radius: 2px;
  border-bottom-left-radius: 2px;
}
.rate-bar:last-child {
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}

/* 弹窗内的章节卡片 */
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
  padding-left: 20px; /* 缩进感 */
}
</style>
