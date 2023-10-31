import {
  fetchJsonByDelete,
  fetchJsonByGet,
  fetchJsonByPost
} from '../utils/request'
import type {
  DictQueryResultDto,
  ICreateWordDto,
  LoginReq,
  LoginResp
} from './types'

export const fetchLoginApi = (data: LoginReq) => {
  return fetchJsonByPost<LoginResp>('/auth/token', data)
}

// dictionary
export const fetchQueryWordApi = (word: string) => {
  return fetchJsonByGet<DictQueryResultDto>(`/dictionary/query/${word}`)
}

// word
export const fetchCreateWordApi = (data: ICreateWordDto) => {
  return fetchJsonByPost('/word', data)
}

export const fetchDeleteWordApi = (data: ICreateWordDto) => {
  return fetchJsonByDelete('/word', data)
}
