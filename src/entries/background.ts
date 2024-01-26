import { registerBackgroundMessage } from '../messaging/background'
import { sendContentMessage } from '../messaging/content'
import { BackgroundContext } from '@/types'

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id })

  const context: BackgroundContext = {
    user: null
  }

  registerBackgroundMessage(context)

  browser.action.onClicked.addListener((tab) => {
    if (tab.id) {
      sendContentMessage('toggleSidebar', undefined, tab.id)
    }
  })
})
