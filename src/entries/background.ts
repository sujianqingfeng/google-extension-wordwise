import { storage } from 'wxt/storage'
import { registerBackgroundMessage } from '../messaging/background'
import { sendContentMessage } from '../messaging/content'
import { fetchAllWordsApi, fetchUserInfoApi } from '@/api'
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

async function fetchAllWords(token: string) {
  try {
    const words = await fetchAllWordsApi(token)
    return words
  } catch (e) {
    console.log('🚀 ~ fetchAllWords ~ e:', e)
  }
}


async function init(context: BackgroundContext){
  const token = await storage.getItem<string>(TOKEN)

  if (token) {
    const user = await fetchUser(token)
    context.user = user

    const words = await fetchAllWords(token)
    context.words = words || []
  }
}

export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id })

  const context: BackgroundContext = {
    user: null,
    words: []
  }

  registerBackgroundMessage(context)

  init(context)

  browser.action.onClicked.addListener((tab) => {
    if (tab.id) {
      sendContentMessage('toggleSidebar', undefined, tab.id)
    }
  })

})
