// composables/Api/Course/course.js
// 1. 获取基础地址
const baseURL = fetchConfig.baseURL; // 已经是 http://localhost:8081/pc
const APP_ID = 'bd9d01ecc75dbbaaefce';
/**
 * 封装上传组件专用的 Headers
 */
// composables/Api/Course/course.js

/**
 * ✨ 精准对齐 useGetFetchOptions 的 Token 获取逻辑
 */
export const getAuthHeaders = () => {
  let tokenValue = '';
  if (process.client) {
    // 按照你 fetchConfig 的逻辑取值
    tokenValue = localStorage.getItem('token') || localStorage.getItem('Token');
    if (!tokenValue) {
      tokenValue = useCookie('token').value;
    }
  }

  return {
    // 1. 若依后端最标准、最常用的 Key
    Authorization: 'Bearer ' + tokenValue,

    // 2. 备用 Key（有些魔改版会读这个）
    token: tokenValue,

    // 3. 你的 appid
    appid: 'bd9d01ecc75dbbaaefce',
  };
};

// 封面上传配置
export const getCoverUploadConfig = () => ({
  action: `${baseURL}/course/cover/upload`,
  // headers: getAuthHeaders(),
});

// 资料上传配置
export const getMaterialUploadConfig = () => ({
  action: `${baseURL}/course/material/upload`,
  // headers: getAuthHeaders(),
});
// 1. 课程搜索/列表 (对应后端: POST /pc/course/search)

// ✅ 修改为 POST 请求
export function useCourseSearchApi(body) {
  return useHttpPost('CourseSearch', '/course/search', {
    body, // 这里改用 body，对应后端的 @RequestBody
    lazy: true,
  });
}

// 修改 Course.js
// 【修改点】：增加 headers 穿透，并做 SSR 安全处理
// course.js
export function useCourseTagsApi(keyword = '') {
  return useHttpGet('CourseTags', '/pc/course/tags', {
    // ✅ 这里直接加上前缀
    query: { keyword },
    headers: {
      token: process.client ? localStorage.getItem('Token') : '',
      appid: 'bd9d01ecc75dbbaaefce',
    },
  });
}

// 2. 课程详情 (改用那个不冲突的路径)
// api/course.js
export function useCourseDetailApi(id) {
  // 这里的 useHttpGet 内部必须调用了上面那个 useGetFetchOptions
  return useHttpGet('CourseDetail', `/course/detail/${id}`, {
    lazy: true,
  });
}

// 2. 获取章节大纲 (独立接口)
// 对应后端: GET /pc/course/section/outline/{courseId}
// export function useCourseOutlineApi(courseId) {
//   return useHttpGet('CourseOutline', `/course/section/outline/${courseId}`, {
//     lazy: true,
//     // 如果需要强制客户端请求可以加 server: false
//   });
// }

// ✨ 新增：统一导出上传地址
// 注意：如果你的上传接口不带 /pc 前缀，可以用 replace 删掉它
export const UPLOAD_ACTION_URL = fetchConfig.baseURL + '/upload';

// 2. 精品推荐 (使用 search 接口带参数模拟)
export function useHotCourseListApi() {
  return useHttpGet('HotCourseList', '/course/search', {
    query: { isHot: 1, pageSize: 4 },
  });
}

export async function fetchCourseTags(keyword = '') {
  const { data, execute } = useHttpGet('CourseTags', '/course/tags', {
    query: { keyword },
    headers: {
      token: process.client ? localStorage.getItem('Token') : '',
      appid: 'bd9d01ecc75dbbaaefce',
    },
  });

  await execute();
  return data.value;
}
// 4. 获取章节大纲 (对应后端: /pc/course/section/outline/{courseId})
export function useCourseOutlineApi(courseId) {
  return useHttpGet('CourseOutline', `/course/section/outline/${courseId}`, {
    lazy: true,
  });
}

// 5. 获取具体小节内容
export function useSectionContentApi(courseId, sectionId) {
  return useHttpGet(
    'SectionContent',
    `/pc/course/section/content/${courseId}/${sectionId}`
  );
}

// 6. 免费学习/领取课程
export function useLearnApi(body) {
  return useHttpPost('learn', '/order/learn', {
    body,
  });
}

// 7. 提交课程问题
export function useSubmitQuestionApi(body) {
  return useHttpPost('SubmitQuestion', '/course/section/submit', {
    body,
  });
}

export function useAddCourseApi(body) {
  return useHttpPost('AddCourse', '/course/save', {
    body,
    headers: {
      token: localStorage.getItem('Token'), // 手动写死小写 key
      appid: 'bd9d01ecc75dbbaaefce',
    },
  });
}

// 收藏课程接口 POST /pc/course/collection/add
export async function apiCollectCourse(courseId) {
  return $fetch('/course/collection/add', {
    method: 'POST',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    body: { courseId },
  });
}

// 取消收藏课程接口 POST /pc/course/collection/remove
export async function apiRemoveCollect(courseId) {
  return $fetch('/course/collection/remove', {
    method: 'POST',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    body: { courseId },
  });
}

// ==================== 课程编辑相关 API ====================

/** 获取课程大纲（含章节+小节） GET /pc/course/{courseId}/sections */
export function useCourseOutlineSectionsApi(courseId) {
  return useHttpGet('CourseOutlineSections', `/course/${courseId}/sections`, {
    lazy: true,
  });
}

/** 新增章节 POST /pc/course/{courseId}/section */
export async function apiAddSection(courseId, body) {
  return $fetch(`/course/${courseId}/section`, {
    method: 'POST',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    body,
  });
}

/** 新增一级章节 POST /pc/course/section/chapter/save */
export async function apiAddChapter(body) {
  return $fetch('/course/section/chapter/save', {
    method: 'POST',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    body,
  });
}

/** 新增视频小节 POST /pc/course/section/video/save */
export async function apiAddVideoSection(body) {
  return $fetch('/course/section/video/save', {
    method: 'POST',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    body,
  });
}

/** 新增文本小节 POST /pc/course/section/textContent/save */
export async function apiAddTextSection(body) {
  return $fetch('/course/section/textContent/save', {
    method: 'POST',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    body,
  });
}

/** 修改课程基本信息 POST /pc/course/update */
export async function apiUpdateCourse(body) {
  return $fetch('/course/update', {
    method: 'POST',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    body,
  });
}

/** 删除课程 DELETE /pc/course/{courseId} */
export async function apiDeleteCourse(courseId) {
  return $fetch(`/course/${courseId}`, {
    method: 'DELETE',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
  });
}

/** 删除课程资料 DELETE /pc/course/material/{materialId} */
export async function apiDeleteMaterial(materialId) {
  return $fetch(`/course/material/${materialId}`, {
    method: 'DELETE',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
  });
}

/** 获取课程资料列表 GET /pc/course/{courseId}/materials */
export function useCourseMaterialsApi(courseId) {
  return useHttpGet('CourseMaterials', `/course/${courseId}/materials`, {
    lazy: true,
  });
}

/** 上传封面（直接 $fetch，返回 url 字符串） */
export async function apiUploadCover(file) {
  const form = new FormData();
  form.append('file', file);
  return $fetch('/course/cover/upload', {
    method: 'POST',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    body: form,
  });
}

/** 上传资料 */
export async function apiUploadMaterial(file, materialName) {
  const form = new FormData();
  form.append('file', file);
  if (materialName) form.append('materialName', materialName);
  return $fetch('/course/material/upload', {
    method: 'POST',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    body: form,
  });
}

/** 上传视频 POST /pc/course/video/upload，返回视频信息 Map */
export async function apiUploadVideo(file, videoName) {
  const form = new FormData();
  form.append('file', file);
  if (videoName) form.append('videoName', videoName);
  return $fetch('/course/video/upload', {
    method: 'POST',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    body: form,
  });
}

/** 上传章节视频 POST /pc/course/section/video/upload */
export async function apiUploadSectionVideo(file, courseId, sectionId) {
  const form = new FormData();
  form.append('file', file);
  form.append('courseId', courseId);
  form.append('sectionId', sectionId);
  return $fetch('/course/section/video/upload', {
    method: 'POST',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    body: form,
  });
}

/** 获取章节视频信息 GET /pc/course/section/{sectionId}/video */
export async function apiGetSectionVideo(sectionId) {
  return $fetch(`/course/section/${sectionId}/video`, {
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
  });
}

/** 获取课程封面临时URL GET /pc/course/covers?courseIds=1,2,3&minute=30 */
export async function apiGetCoverUrls(courseIds, minute = 30) {
  return $fetch('/course/covers', {
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    params: { courseIds: courseIds.join(','), minute },
  });
}

/** 获取章节视频临时URL GET /pc/course/section/video-urls?sectionIds=4&minute=60 */
export async function apiGetVideoUrls(sectionIds, minute = 60) {
  return $fetch('/course/section/video-urls', {
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    params: { sectionIds: Array.isArray(sectionIds) ? sectionIds.join(',') : sectionIds, minute },
  });
}

/** 获取课程资料下载临时URL GET /pc/course/material-url?materialId=1&minute=120 */
export async function apiGetMaterialUrl(materialId, minute = 120) {
  return $fetch('/course/material-url', {
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
    params: { materialId, minute },
  });
}

export async function apiDeleteSection(id) {
  return $fetch(`/course/section/${id}`, {
    method: 'DELETE',
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
  });
}
export async function apiGetCourseDetail(courseId) {
  return $fetch(`/course/detail/${courseId}`, {
    baseURL: fetchConfig.baseURL,
    headers: getAuthHeaders(),
  });
}
