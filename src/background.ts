import { BACKGROUND_MESSAGE_TYPE, CONTENT_MESSAGE_TYPE } from './constants'

console.log('start')

console.log('----', chrome)

const getToken = () => {
  chrome.identity.getAuthToken({ interactive: true }, function (token) {
    console.log(token)
    if (!token) {
      return
    }
    const query = new URLSearchParams({
      access_token: token
    }).toString()
    fetch(`https://www.googleapis.com/oauth2/v3/userinfo?${query}`)
      .then((res) => res.json())
      .then(console.log)
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
