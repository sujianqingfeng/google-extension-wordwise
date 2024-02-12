export type IAuthProvidersRespItem = {
  authUrl: string
  provider: string
}

export type LoginReq = {
  code: string
  provider: string
  redirectUrl: string
}

export type LoginResp = {
  token: string
  name: string
  email: string
  avatar: string
}

export type IUser = Omit<LoginResp, 'token'>

export type ICreateWordDto = {
  word: string
}

// word
export type IQueryWordParams = {
  word: string
}

export type IQueryWordCollectedParams = {
  word: string
}

export type IQueryWordCollectedResp = {
  isCollected: boolean
}

export type IWordRespItem = {
  id: string
  word: string
}

// dictionary
export type IDictionaryQueryForm = {
  name: string
  value: string
}

export type IDictionaryQueryTranslate = {
  translation: string
  partName: string
}

export type IDictionaryQueryResult = {
  word: string
  ukPhonetic?: string
  usPhonetic?: string
  ukSpeech?: string
  usSpeech?: string
  forms: IDictionaryQueryForm[]
  translations: IDictionaryQueryTranslate[]
}

export type IDictQueryResultResp = IDictionaryQueryResult

// translation
export type TranslateParams = {
  text: string
}

export type TranslateResp = {
  result: string
}

export type ICreateReadLater = {
  source: string
  title: string
  desc: string
  author: string
  publishedTime: number 
  content: string
}
