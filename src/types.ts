import type { IUser, IWordRespItem, LoginResp } from './api/types'

export type MaskClickEventDetail = {
  word: string
  rect: DOMRect
}

export type WrapperElementOptions = {
  word: string
  onClick: (e: MouseEvent) => void
}

export type BackgroundFunctions = {
  getAuthUser: (authUrl: string) => Promise<[false, any] | [true, IUser]>
  getIsLogin: () => Promise<boolean>
  getUser: () => IUser
  getWords: () => IWordRespItem[]
  addWord: (word: string) => void
  removeWord: (word: string) => void
}

export type ContentFunctions = {}

export type Context = {
  isSelecting: boolean
  isPressedAlt: boolean
}

export interface BackgroundContext {
  user: LoginResp | null
}

export interface QueryContentContext {
  isSelecting: boolean
}
