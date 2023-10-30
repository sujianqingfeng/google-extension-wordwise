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

export type DictionaryResp = {
  word: string
  phonetic: string
  translation: string
}

export type ICreateWordDto = {
  word: string
}
