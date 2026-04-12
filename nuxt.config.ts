import { defineNuxtConfig } from 'nuxt/config';
export default defineNuxtConfig({
  // 1. 必须在最外层，别放进 app 块里！
  compatibilityDate: '2024-04-03',
  modules: ['@bg-dev/nuxt-naiveui'],

  css: ['@/assets/main.css'],

  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://unpkg.com/windicss@3.5.6/dist/windi.css',
        },
      ],
      script: [{ src: 'https://unpkg.com/windicss@3.5.6/dist/windi.umd.js' }],
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
