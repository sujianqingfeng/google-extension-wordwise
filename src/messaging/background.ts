import type { BackgroundContext } from '@/types'
import { defineProxyService } from '@webext-core/proxy-service'
import { storage } from 'wxt/storage'
import { fetchLoginApi } from '@/api'
import { TOKEN } from '@/constants'

function _createBackgroundMessage(context: BackgroundContext) {
  return {
    async getUser() {
      return context.user
    },
    async auth(authUrl: string) {
      const redirectUrl: string | undefined = browser.identity.getRedirectURL()

      authUrl = authUrl.replace(
        /redirect_uri=.+?&/,
        `redirect_uri=${redirectUrl}&`
      )

      const callbackUrl = await browser.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true
      })

      if (!callbackUrl) {
        throw new Error('callbackUrl is null')
      }

      const callbackUrlParams = new URL(callbackUrl)
      const code = callbackUrlParams.searchParams.get('code')
      if (!code) {
        throw new Error('code is null')
      }

      const data = await fetchLoginApi({
        code,
        provider: 'google',
        redirectUrl
      })

      const { token } = data
      storage.setItem(TOKEN, token)
      return data
    }
  }
}

export const [registerBackgroundMessage, createBackgroundMessage] =
  defineProxyService('background', _createBackgroundMessage)
