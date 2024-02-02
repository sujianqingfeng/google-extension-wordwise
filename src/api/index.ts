import type { IWordRespItem, LoginReq, LoginResp } from './types'

export const fetchLoginApi = (body: LoginReq) => {
  return postWithTokenFetcher<LoginResp>({
    url: '/auth',
    body
  })
}

export const fetchAllWordsApi = (token: string) => {
  return withTokenFetcher<IWordRespItem[]>({
    url: `/word/all`,
    token
  })
}

// user
export const fetchUserInfoApi = (token: string) => {
  return withTokenFetcher<LoginResp>({
    url: '/user',
    token
  })
}
