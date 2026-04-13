import { defineNuxtConfig } from 'nuxt/config';
export default defineNuxtConfig({
  ssr: false,
    css:[
        "@/assets/main.css"
    ], 
  app: {
    head: {
      link: [
        // 替换成完整的 Windicss CDN 包（包含所有工具类）
        // { rel: 'stylesheet', href: 'https://unpkg.com/windicss@3.5.6/dist/windi.css' },
        // 新增：引入 Windicss 运行时，支持动态类名
        // { rel: 'script', src: 'https://unpkg.com/windicss@3.5.6/dist/windi.umd.js' }
      ]
    },
  },

  // 2. 这里的配置是关键！改成 imports，并且开启深度扫描
  imports: {
    dirs: [
      'composables',
      'composables/**', // 这行最重要！加了它，你躲在 Api/Course 里的 js 才能被找到
    ],
  },
});
