// 课程管理 - 本地状态管理（可替换为真实API）

const STORAGE_KEY = 'osh_courses'

// 默认示例数据
const defaultCourses = [
  {
    id: 1,
    title: 'Vue3 全栈开发实战',
    cover: 'https://picsum.photos/seed/vue3/400/225',
    category: '前端开发',
    level: '中级',
    price: 199,
    status: 'published',
    description: '从零开始学习 Vue3 + Nuxt3 + TypeScript，打造现代化全栈应用。课程涵盖组合式 API、状态管理、服务端渲染等核心知识点。',
    teacher: '张老师',
    duration: '32小时',
    studentCount: 1280,
    createdAt: '2026-01-10 09:00:00',
    updatedAt: '2026-03-15 14:30:00',
    chapters: [
      {
        id: 1,
        title: '第一章：Vue3 基础入门',
        sort: 1,
        lessons: [
          {
            id: 1,
            title: '1.1 Vue3 简介与环境搭建',
            duration: '25:30',
            isFree: true,
            sort: 1,
            videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
            videoType: 'mp4',
            content: '<h2>Vue3 简介</h2><p>Vue3 是 Vue.js 的最新主要版本，带来了全新的组合式 API、更好的 TypeScript 支持和显著的性能提升。</p><h3>主要特性</h3><ul><li>组合式 API（Composition API）</li><li>更好的 TypeScript 支持</li><li>Teleport 组件</li><li>Fragments 支持</li></ul>',
          },
          {
            id: 2,
            title: '1.2 模板语法与响应式基础',
            duration: '32:15',
            isFree: false,
            sort: 2,
            videoUrl: '',
            videoType: 'mp4',
            content: '<h2>模板语法</h2><p>Vue 使用基于 HTML 的模板语法，允许你声明式地将已渲染的 DOM 绑定到底层组件实例的数据。</p>',
          },
        ],
      },
      {
        id: 2,
        title: '第二章：组合式 API 深入',
        sort: 2,
        lessons: [
          {
            id: 3,
            title: '2.1 setup() 函数详解',
            duration: '28:45',
            isFree: false,
            sort: 1,
            videoUrl: '',
            videoType: 'mp4',
            content: '<h2>setup() 函数</h2><p>setup() 是组合式 API 的入口点，在组件实例创建之前执行。</p>',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Spring Boot 微服务架构',
    cover: 'https://picsum.photos/seed/spring/400/225',
    category: '后端开发',
    level: '高级',
    price: 299,
    status: 'published',
    description: '深入学习 Spring Boot 微服务架构设计，包含服务注册发现、负载均衡、熔断降级、分布式事务等核心技术。',
    teacher: '李老师',
    duration: '48小时',
    studentCount: 856,
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-03-20 16:00:00',
    chapters: [
      {
        id: 3,
        title: '第一章：微服务概述',
        sort: 1,
        lessons: [
          {
            id: 4,
            title: '1.1 微服务架构介绍',
            duration: '20:00',
            isFree: true,
            sort: 1,
            videoUrl: '',
            videoType: 'mp4',
            content: '<h2>微服务架构</h2><p>微服务是一种将应用程序构建为一组小型服务的架构风格，每个服务运行在自己的进程中。</p>',
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Python 数据分析与机器学习',
    cover: 'https://picsum.photos/seed/python/400/225',
    category: '人工智能',
    level: '初级',
    price: 0,
    status: 'draft',
    description: '使用 Python 进行数据分析和机器学习，涵盖 NumPy、Pandas、Matplotlib、Scikit-learn 等主流库的使用。',
    teacher: '王老师',
    duration: '40小时',
    studentCount: 0,
    createdAt: '2026-03-01 09:00:00',
    updatedAt: '2026-03-01 09:00:00',
    chapters: [],
  },
]

// 读取本地存储
function loadCourses() {
  if (process.server) return JSON.parse(JSON.stringify(defaultCourses))
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(defaultCourses))
  } catch {
    return JSON.parse(JSON.stringify(defaultCourses))
  }
}

// 保存到本地存储
function saveCourses(courses) {
  if (process.server) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
}

// 全局状态
export const useCourseManage = () => useState('courseManage', () => loadCourses())

// 生成ID
function genId(list) {
  if (!list || list.length === 0) return 1
  return Math.max(...list.map(s => s.id)) + 1
}

// 格式化时间
function nowStr() {
  return new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
}

// ===== 课程 CRUD =====

export function useAddCourse(form) {
  const courses = useCourseManage()
  const allIds = courses.value.map(c => c.id)
  const newCourse = {
    ...form,
    id: allIds.length > 0 ? Math.max(...allIds) + 1 : 1,
    studentCount: 0,
    chapters: [],
    createdAt: nowStr(),
    updatedAt: nowStr(),
  }
  courses.value = [newCourse, ...courses.value]
  saveCourses(courses.value)
  return newCourse
}

export function useUpdateCourse(id, form) {
  const courses = useCourseManage()
  courses.value = courses.value.map(c =>
    c.id === id ? { ...c, ...form, updatedAt: nowStr() } : c
  )
  saveCourses(courses.value)
}

export function useDeleteCourse(id) {
  const courses = useCourseManage()
  courses.value = courses.value.filter(c => c.id !== id)
  saveCourses(courses.value)
}

export function useGetCourse(id) {
  const courses = useCourseManage()
  return courses.value.find(c => c.id === id) || null
}

// ===== 章节 CRUD =====

export function useAddChapter(courseId, form) {
  const courses = useCourseManage()
  courses.value = courses.value.map(c => {
    if (c.id !== courseId) return c
    const allIds = c.chapters.map(ch => ch.id)
    const newChapter = {
      ...form,
      id: allIds.length > 0 ? Math.max(...allIds) + 1 : 1,
      sort: c.chapters.length + 1,
      lessons: [],
    }
    return { ...c, chapters: [...c.chapters, newChapter], updatedAt: nowStr() }
  })
  saveCourses(courses.value)
}

export function useUpdateChapter(courseId, chapterId, form) {
  const courses = useCourseManage()
  courses.value = courses.value.map(c => {
    if (c.id !== courseId) return c
    return {
      ...c,
      chapters: c.chapters.map(ch =>
        ch.id === chapterId ? { ...ch, ...form } : ch
      ),
      updatedAt: nowStr(),
    }
  })
  saveCourses(courses.value)
}

export function useDeleteChapter(courseId, chapterId) {
  const courses = useCourseManage()
  courses.value = courses.value.map(c => {
    if (c.id !== courseId) return c
    return {
      ...c,
      chapters: c.chapters.filter(ch => ch.id !== chapterId),
      updatedAt: nowStr(),
    }
  })
  saveCourses(courses.value)
}

// ===== 小节 CRUD =====

export function useAddLesson(courseId, chapterId, form) {
  const courses = useCourseManage()
  courses.value = courses.value.map(c => {
    if (c.id !== courseId) return c
    return {
      ...c,
      chapters: c.chapters.map(ch => {
        if (ch.id !== chapterId) return ch
        const allIds = ch.lessons.map(l => l.id)
        // collect all lesson ids across all chapters for uniqueness
        const allLessonIds = c.chapters.flatMap(x => x.lessons.map(l => l.id))
        const newLesson = {
          ...form,
          id: allLessonIds.length > 0 ? Math.max(...allLessonIds) + 1 : 1,
          sort: ch.lessons.length + 1,
        }
        return { ...ch, lessons: [...ch.lessons, newLesson] }
      }),
      updatedAt: nowStr(),
    }
  })
  saveCourses(courses.value)
}

export function useUpdateLesson(courseId, chapterId, lessonId, form) {
  const courses = useCourseManage()
  courses.value = courses.value.map(c => {
    if (c.id !== courseId) return c
    return {
      ...c,
      chapters: c.chapters.map(ch => {
        if (ch.id !== chapterId) return ch
        return {
          ...ch,
          lessons: ch.lessons.map(l =>
            l.id === lessonId ? { ...l, ...form } : l
          ),
        }
      }),
      updatedAt: nowStr(),
    }
  })
  saveCourses(courses.value)
}

export function useDeleteLesson(courseId, chapterId, lessonId) {
  const courses = useCourseManage()
  courses.value = courses.value.map(c => {
    if (c.id !== courseId) return c
    return {
      ...c,
      chapters: c.chapters.map(ch => {
        if (ch.id !== chapterId) return ch
        return {
          ...ch,
          lessons: ch.lessons.filter(l => l.id !== lessonId),
        }
      }),
      updatedAt: nowStr(),
    }
  })
  saveCourses(courses.value)
}

// 根据lessonId找到课程和章节信息
export function useFindLesson(lessonId) {
  const courses = useCourseManage()
  for (const course of courses.value) {
    for (const chapter of course.chapters) {
      const lesson = chapter.lessons.find(l => l.id === lessonId)
      if (lesson) {
        return { course, chapter, lesson }
      }
    }
  }
  return null
}
