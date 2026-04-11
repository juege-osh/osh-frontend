// 视频获取的api

export const useCourses = () => {
  const courseList = ref([])

  const fetchCourses = async () => {
    const res = await fetch('/api/courses')
    const data = await res.json()
    courseList.value = data
  }

  return {
    courseList,
    fetchCourses
  }
}