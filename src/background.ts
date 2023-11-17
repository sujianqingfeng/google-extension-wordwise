import { fetchLoginApi, fetchUserInfoApi } from './api'
import { BACKGROUND_MESSAGE_TYPE, CONTENT_MESSAGE_TYPE } from './constants'
import { tokenStorage, userStorage } from './utils/storage'

const isLogin = false
let isInit = false

async function init() {
  await getUserInfo()
  isInit = true
}

async function getUserInfo() {
  const user = await fetchUserInfoApi()
  console.log('🚀 ~ file: background.ts:14 ~ getUserInfo ~ user:', user)
}

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

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: CONTENT_MESSAGE_TYPE.SHOW_SIDEBAR })
  }
})

chrome.runtime.onMessage.addListener((message) => {
  console.log('background message', message)

  switch (message.type) {
    case BACKGROUND_MESSAGE_TYPE.GET_TOKEN:
      getToken()
      break
  }
})

init()
