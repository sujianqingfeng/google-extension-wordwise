import type { IWordRespItem, UserResp } from "./api/types"

export type MaskClickEventDetail = {
	word: string
	rect: DOMRect
}

export type WrapperElementOptions = {
	word: string
	onClick: (e: MouseEvent) => void
}

export type BackgroundFunctions = {
	getAuthUser: (authUrl: string) => Promise<[false, any] | [true, UserResp]>
	getIsLogin: () => Promise<boolean>
	getUser: () => UserResp
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
	user: UserResp | null
	words: IWordRespItem[]
}

export interface QueryUI {
	mount: (options: {
		text?: string
		triggerRect?: DOMRect
	}) => void
	remove: () => void
	container: HTMLElement | undefined
}

export interface QueryContentContext {
	isPressedAlt: boolean
	isSelecting: boolean
	queryUI: QueryUI
	currentQueryTriggerEl: HTMLElement | null
}
