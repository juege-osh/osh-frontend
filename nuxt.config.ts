import { defineNuxtConfig } from 'nuxt/config';
export default defineNuxtConfig({
  telemetry: false,
  ssr: false,
    css:[
        "@/assets/main.css"
    ], 
  app: {
    head: {
      link: [],
      script: [],
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
