export default defineNuxtConfig({
    css:[
        "@/assets/main.css"
    ], 
  app: {
    head: {
      link: [
        // 替换成完整的 Windicss CDN 包（包含所有工具类）
        { rel: 'stylesheet', href: 'https://unpkg.com/windicss@3.5.6/dist/windi.css' },
        // 新增：引入 Windicss 运行时，支持动态类名
        { rel: 'script', src: 'https://unpkg.com/windicss@3.5.6/dist/windi.umd.js' }
      ]
    },
    compatibilityDate: '2024-04-03'
  },
  autoImports:{
        dirs:["apis"]
    }
})
