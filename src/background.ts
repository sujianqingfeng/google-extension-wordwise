import { fetchLoginApi, fetchQueryWordApi } from './api'
import { BACKGROUND_MESSAGE_TYPE, CONTENT_MESSAGE_TYPE } from './constants'
import { tokenStorage, userStorage } from './utils/storage'

console.log('start')

console.log('----', chrome)

const getToken = () => {
  const callback = async (googleToken: string) => {
    const [isOk, data] = await fetchLoginApi({
      token: googleToken,
      provider: 'google'
    })
    if (!isOk) {
      console.log('🚀 ~ file: background.ts:16 ~ callback ~ isOk:', data)
      return
    }
    const { token, ...user } = data
    tokenStorage.setToken(token)
    userStorage.setUser(user)
  }

  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (token) {
      callback(token)
    }
  })
}

const queryWord = async (word: string) => {
  const res = await fetchQueryWordApi(word)
  console.log('🚀 ~ file: background.ts:32 ~ queryWord ~ res:', res)
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: CONTENT_MESSAGE_TYPE.SHOW_SIDEBAR })
  }
})

chrome.identity.onSignInChanged.addListener((_, signed) => {
  console.log(
    '🚀 ~ file: background.ts:13 ~ chrome.identity.onSignInChanged.addListener ~ signed:',
    signed
  )
})

chrome.runtime.onMessage.addListener((message) => {
  console.log('background message', message)

  switch (message.type) {
    case BACKGROUND_MESSAGE_TYPE.GET_TOKEN:
      getToken()
      break

    case BACKGROUND_MESSAGE_TYPE.QUERY_WORD:
      queryWord(message.payload.word)
      break
  }
})
