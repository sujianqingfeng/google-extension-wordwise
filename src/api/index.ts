import { fetchJsonByGet, fetchJsonByPost } from '../utils/request'
import type { LoginReq, LoginResp } from './types'

export const fetchLoginApi = (data: LoginReq) => {
  return fetchJsonByPost<LoginResp>('/auth/token', data)
}

// dictionary
export const fetchQueryWordApi = (word: string) => {
  return fetchJsonByGet(`/dictionary/query/${word}`)
}
