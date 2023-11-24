import type { IWordRespItem, LoginResp } from './api/types'
import { fetchAllWordsApi, fetchLoginApi, fetchUserInfoApi } from './api'
import { BACKGROUND_MESSAGE_TYPE, CONTENT_MESSAGE_TYPE } from './constants'
import { tokenStorage, userStorage } from './utils/storage'

type SetResponse = (response: any) => void

let isLogin = false
let isInit = false
let user: LoginResp
let words: IWordRespItem[] = []

async function init(setResponse?: SetResponse) {
  await getUserInfo()
  isInit = true
  setResponse && setResponse(isLogin)
}

async function getUserInfo() {
  const [isOk, networkUser] = await fetchUserInfoApi()
  if (isOk) {
    user = networkUser
    isLogin = true
    fetchAllWords()
  }
}

async function fetchAllWords() {
  const [isOk, allWords] = await fetchAllWordsApi()
  if (!isOk) {
    return
  }
  words = allWords
}

function getToken(setResponse?: SetResponse) {
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
    setResponse && setResponse(user)
  }

  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (token) {
      callback(token)
    }
  })
}

function operateWord({ isAdd, word }: { isAdd: boolean; word: string }) {
  if (isAdd) {
    words.push({
      word,
      id: ''
    })
  } else {
    words = words.filter((item) => item.word !== word)
  }
}

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: CONTENT_MESSAGE_TYPE.SHOW_SIDEBAR })
  }
})

chrome.runtime.onMessage.addListener((message, _, setResponse) => {
  console.log('background message', message)

  switch (message.type) {
    case BACKGROUND_MESSAGE_TYPE.GET_TOKEN:
      getToken(setResponse)
      return true

    case BACKGROUND_MESSAGE_TYPE.GET_IS_LOGIN:
      if (isInit) {
        setResponse(isLogin)
      } else {
        init(setResponse)
      }
      return true

    case BACKGROUND_MESSAGE_TYPE.GET_USER:
      setResponse(user)
      return true

    case BACKGROUND_MESSAGE_TYPE.GET_WORDS:
      setResponse(words)
      return true

    case BACKGROUND_MESSAGE_TYPE.OPERATE_WORD:
      operateWord(message.payload)
      break
  }
})

console.log('start')
init()
