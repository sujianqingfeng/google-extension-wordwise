import type {
  ICreateWordDto,
  IDictQueryResultResp,
  IQueryWordCollectedParams,
  IQueryWordCollectedResp,
  IQueryWordParams,
  IWordRespItem,
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
export const fetchQueryWordApi = (params: IQueryWordParams) => {
  return fetchJsonByGet<IDictQueryResultResp>(`/dictionary/query`, params)
}

// word
export const fetchCreateWordApi = (data: ICreateWordDto) => {
  return fetchJsonByPost('/word', data)
}

export const fetchDeleteWordApi = (data: ICreateWordDto) => {
  return fetchJsonByDelete('/word', data)
}

export const fetchAllWordsApi = () => {
  return fetchJsonByGet<IWordRespItem[]>(`/word/all`)
}

export const fetchWordIsCollectedApi = (params: IQueryWordCollectedParams) => {
  return fetchJsonByGet<IQueryWordCollectedResp>(`/word/isCollected`, params)
}

// translation
export const fetchTranslateApi = (data: TranslateParams) => {
  return fetchJsonByPost<TranslateResp>('/translator/translate', data)
}

// user
export const fetchUserInfoApi = () => {
  return fetchJsonByGet<LoginResp>(`/user`)
}
