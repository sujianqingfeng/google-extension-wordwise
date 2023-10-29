import { fetchJsonByGet, fetchJsonByPost } from '../utils/request'
import type { DictionaryResp, LoginReq, LoginResp } from './types'

export const fetchLoginApi = (data: LoginReq) => {
  return fetchJsonByPost<LoginResp>('/auth/token', data)
}

// dictionary
export const fetchQueryWordApi = (word: string) => {
  return fetchJsonByGet<DictionaryResp>(`/dictionary/query/${word}`)
}
