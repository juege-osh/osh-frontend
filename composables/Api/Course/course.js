// composables/Api/Course/course.js
// 1. 获取基础地址
const baseURL = fetchConfig.baseURL; // 已经是 http://localhost:8081/pc

// 2. 导出获取封面上传地址的函数
export const getCoverUploadUrl = (courseId) =>
  `${baseURL}/course/cover/upload/${courseId}`;

// 3. 导出获取资料上传地址的函数
export const getMaterialUploadUrl = (courseId) =>
  `${baseURL}/course/material/upload/${courseId}`;
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

// 收藏课程接口
// 收藏课程接口
export function useCollectCourseApi(courseId) {
  return useHttpPost('CollectCourse', '/collection/add', {
    body: { courseId },
    headers: {
      token: localStorage.getItem('Token'), // 手动写死小写 key
      appid: 'bd9d01ecc75dbbaaefce', // 🔥 必加
    },
  });
}

// 取消收藏课程接口
export function useRemoveCollectApi(courseId) {
  const token = useCookie('token');
  return useHttpPost('RemoveCollect', '/collection/remove', {
    body: {
      courseId: courseId,
    },
    headers: {
      Authorization: `Bearer ${token.value}`,
    },
  });
}
