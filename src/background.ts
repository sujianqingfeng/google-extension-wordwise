import type { IWordRespItem, LoginResp, IUser } from './api/types'
import { createBirpc } from 'birpc'
import { fetchAllWordsApi, fetchLoginApi, fetchUserInfoApi } from './api'
import { CONTENT_MESSAGE_TYPE } from './constants'
import { BackgroundFunctions, ContentFunctions } from './types'
import { tokenStorage, userStorage } from './utils/storage'

let isLogin = false
let isInit = false
let user: LoginResp
let words: IWordRespItem[] = []

async function init() {
  await getUserInfo()
  isInit = true
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

async function getAuthUser(
  authUrl: string
): Promise<[false, any] | [true, IUser]> {
  const redirectUrl: string | undefined = chrome.identity.getRedirectURL()

  authUrl = authUrl.replace(/redirect_uri=.+?&/, `redirect_uri=${redirectUrl}&`)

  const callbackUrl = await chrome.identity.launchWebAuthFlow({
    url: authUrl,
    interactive: true
  })

  if (!callbackUrl) {
    return [false, 'callbackUrl is null']
  }

  const callbackUrlParams = new URL(callbackUrl)
  const code = callbackUrlParams.searchParams.get('code')
  if (!code) {
    return [false, 'code is null']
  }

  const [isOk, data] = await fetchLoginApi({
    code,
    provider: 'google',
    redirectUrl
  })

  if (!isOk) {
    return [false, data]
  }

  const { token, ...rest } = data
  tokenStorage.setToken(token)
  userStorage.setUser(rest)
  isLogin = true
  return [true, rest]
}

async function getIsLogin() {
  if (isInit) {
    return isLogin
  } else {
    await init()
    return isLogin
  }
}

const backgroundFunctions: BackgroundFunctions = {
  getAuthUser,
  getIsLogin,
  getUser: () => user,
  getWords: () => words,
  addWord: (word) => {
    words.push({
      word,
      id: ''
    })
  },
  removeWord: (word) => {
    words = words.filter((item) => item.word !== word)
  }
}

createBirpc<ContentFunctions, BackgroundFunctions>(backgroundFunctions, {
  post: (data, tab) => {
    if (!tab || !tab.id) {
      // throw new Error('tab id is null')
      return
    }
    chrome.tabs.sendMessage(tab.id, data)
  },
  on: (data) => {
    chrome.runtime.onMessage.addListener((msg, sender) => {
      data(msg, sender.tab)
    })
  }
})

// icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: CONTENT_MESSAGE_TYPE.SHOW_SIDEBAR })
  }
})

console.log('start')
init()
