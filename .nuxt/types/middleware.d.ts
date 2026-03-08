import type { NavigationGuard } from 'vue-router'
export type MiddlewareKey = "auth" | "createorder" | "list" | "only-visitor" | "search"
declare module "/Users/rengang/chuangye/osh-frontend/node_modules/nuxt/dist/pages/runtime/composables" {
  interface PageMeta {
    middleware?: MiddlewareKey | NavigationGuard | Array<MiddlewareKey | NavigationGuard>
  }
}