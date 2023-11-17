import type {
  DictQueryResultDto,
  ICreateWordDto,
  LoginReq,
  LoginResp,
  TranslateParams,
  TranslateResp
} from './types'
import {
  fetchJsonByDelete,
  fetchJsonByGet,
  fetchJsonByPost
} from '../utils/request'

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

export const fetchAllWordsApi = () => {
  return fetchJsonByGet(`/word`)
}

// translation
export const fetchTranslateApi = (data: TranslateParams) => {
  return fetchJsonByPost<TranslateResp>('/translator/translate', data)
}

// user
export const fetchUserInfoApi = () => {
  return fetchJsonByGet<LoginResp>(`/user`)
}
