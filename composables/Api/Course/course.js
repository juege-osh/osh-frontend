// composables/Api/Course/course.js
import { useGetFetchOptions } from '~/composables/useHttp'; // 确保路径正确
// 1. 课程搜索/列表 (对应后端: POST /pc/course/search)
// ✅ 修改为 POST 请求
export function useCourseSearchApi(body) {
  return useHttpPost('CourseSearch', '/course/search', {
    body, // 这里改用 body，对应后端的 @RequestBody
    lazy: true,
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

// 2. 精品推荐 (使用 search 接口带参数模拟)
export function useHotCourseListApi() {
  return useHttpGet('HotCourseList', '/course/search', {
    query: { isHot: 1, pageSize: 4 },
  });
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
