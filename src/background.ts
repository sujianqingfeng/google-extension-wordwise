import { BACKGROUND_MESSAGE_TYPE, CONTENT_MESSAGE_TYPE } from './constants'
import { fetchJsonByPost } from './utils/request'

console.log('start')

console.log('----', chrome)

const getToken = () => {
  const callback = async (token: string) => {
    const res = await fetchJsonByPost('http://localhost:3456/auth/token', {
      token,
      provider: 'google'
    })
    console.log('🚀 ~ file: background.ts:15 ~ res:', res)
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

chrome.identity.onSignInChanged.addListener((_, signed) => {
  console.log(
    '🚀 ~ file: background.ts:13 ~ chrome.identity.onSignInChanged.addListener ~ signed:',
    signed
  )
})

chrome.runtime.onMessage.addListener((message) => {
  console.log(
    '🚀 ~ file: background.ts:19 ~ chrome.runtime.onMessage.addListener ~ message:',
    message
  )

  switch (message.type) {
    case BACKGROUND_MESSAGE_TYPE.GET_TOKEN:
      getToken()
      break
  }
})
