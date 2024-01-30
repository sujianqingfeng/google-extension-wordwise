import type { BackgroundContext } from '@/types'
import { defineProxyService } from '@webext-core/proxy-service'

function _createBackgroundMessage(context: BackgroundContext) {
  return {
    async getUser() {
      return context.user
    }
  }
}

export const [registerBackgroundMessage, createBackgroundMessage] =
  defineProxyService('background', _createBackgroundMessage)
