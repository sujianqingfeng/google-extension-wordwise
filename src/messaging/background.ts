import type { BackgroundContext } from '@/types'
import { defineProxyService } from '@webext-core/proxy-service'
import { withTokenFetcher } from '@/utils/request'

function _createBackgroundMessage(context: BackgroundContext) {
  return {
    async getUser() {
      if (!context.user) {
        const user = await withTokenFetcher('/user', '')
        console.log('🚀 ~ getUser ~ user:', user)
        context.user = user
      }
      return context.user
    }
  }
}

export const [registerBackgroundMessage, createBackgroundMessage] =
  defineProxyService('background', _createBackgroundMessage)
