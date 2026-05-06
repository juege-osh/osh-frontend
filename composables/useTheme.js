// 全局主题状态，跨组件共享
const THEMES = ['default', 'space']
const currentTheme = ref('default')

export function useTheme() {
  // 初始化时从 localStorage 读取
  const initTheme = () => {
    if (process.client) {
      const saved = localStorage.getItem('osh-theme')
      if (saved && THEMES.includes(saved)) {
        currentTheme.value = saved
        document.documentElement.setAttribute('data-theme', saved)
      }
    }
  }

  const setTheme = (theme) => {
    currentTheme.value = theme
    if (process.client) {
      localStorage.setItem('osh-theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
  }

  const toggleTheme = () => {
    const idx = THEMES.indexOf(currentTheme.value)
    const next = THEMES[(idx + 1) % THEMES.length]
    setTheme(next)
  }

  return { currentTheme, initTheme, setTheme, toggleTheme, THEMES }
}
