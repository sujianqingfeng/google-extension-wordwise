import { storage } from 'wxt/storage'
import { registerBackgroundMessage } from '../messaging/background'
import { sendContentMessage } from '../messaging/content'
import { fetchUserInfoApi } from '@/api'
import { TOKEN } from '@/constants'
import { BackgroundContext } from '@/types'

async function fetchUser(token: string) {
  try {
    const user = await fetchUserInfoApi(token)
    return user
  } catch (e) {
    console.log('🚀 ~ fetchUser ~ e:', e)
  }
  return null
}

export default defineBackground(async () => {
  console.log('Hello background!', { id: browser.runtime.id })

  const context: BackgroundContext = {
    user: null,
    words: []
  }

  registerBackgroundMessage(context)

  const token = await storage.getItem<string>(TOKEN)

  if (token) {
    const user = await fetchUser(token)
    context.user = user
  }

  browser.action.onClicked.addListener((tab) => {
    if (tab.id) {
      sendContentMessage('toggleSidebar', undefined, tab.id)
    }
  })
})
