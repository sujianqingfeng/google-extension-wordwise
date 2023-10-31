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

export type DictQueryResultDto = {
  id: string
  word: string
  sw: string
  phonetic: string
  definition: string
  translation: string
  pos: string
  collins: number
  oxford: number
  tag: string
  bnc: number
  frq: number
  exchange: string
  detail: string
  audio: string
  isCollected: boolean
}
