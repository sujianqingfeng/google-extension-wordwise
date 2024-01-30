import { registerBackgroundMessage } from '../messaging/background'
import { sendContentMessage } from '../messaging/content'
import { BackgroundContext } from '@/types'

async function fetchUser(context: BackgroundContext) {
  try {
    const user = await withTokenFetcher('/user', '')
    context.user = user
  } catch (e) {
    console.log('🚀 ~ fetchUser ~ e:', e)
  }
}

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id })

  const context: BackgroundContext = {
    user: null
  }

  registerBackgroundMessage(context)
  fetchUser(context)

  browser.action.onClicked.addListener((tab) => {
    if (tab.id) {
      sendContentMessage('toggleSidebar', undefined, tab.id)
    }
  })
})
