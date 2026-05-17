import { createDiscreteApi } from 'naive-ui'
import { canTakeExam } from '~/composables/useAuth'

/**
 * Client-side gate: only VIP and above (member level >= 2) may open the exam page.
 * SSR is skipped so first paint still relies on backend /pc/testpaper/read if needed.
 */
export default defineNuxtRouteMiddleware(() => {
  if (!process.client) return
  if (canTakeExam()) return

  const { message } = createDiscreteApi(['message'])
  message.warning('需要 VIP 及以上等级才能参加考试')
  return navigateTo('/paper/1')
})
