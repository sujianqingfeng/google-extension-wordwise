export type LoginReq = {
  token: string
  provider: string
}

export type LoginResp = {
  token: string
  name: string
  email: string
  avatar: string
}

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

// dictionary

export type IDictionaryQueryForm = {
  name: string
  value: string
}

export type IDictionaryQueryTranslate = {
  translate: string
  position: string
}

export type IDictionaryQueryResult = {
  word: string
  ukPhonetic?: string
  usPhonetic?: string
  ukSpeech?: string
  usSpeech?: string
  forms: IDictionaryQueryForm[]
  translates: IDictionaryQueryTranslate[]
}

export type IDictQueryResultResp = IDictionaryQueryResult & {}

// translation
export type TranslateParams = {
  text: string
}

export type TranslateResp = {
  result: string
}
