export type IAuthProvidersRespItem = {
	authUrl: string
	provider: string
}

export type LoginReq = {
	code: string
	provider: string
	redirectUrl: string
}

export type LoginResp = {
	token: string
	name: string
	email: string
	avatar: string
}

export type IUser = Omit<LoginResp, "token">

export type ICreateWordDto = {
	word: string
}

// word
export type IQueryWordParams = {
	word: string
}

export type IQueryWordCollectedParams = {
	word: string
}

export type IWordRespItem = {
	id: string
	word: string
}

// translation
export type TranslateParams = {
	text: string
}

export type TranslateResp = {
	result: string
}

// ai
export type IAnalysisGrammarResp = {
	result: string
}

// token
export type ExchangeTokenParams = {
	idToken: string
}

export type ExchangeTokenResp = {
	accessToken: string
	refreshToken: string
}

// read later
export type CreateReadLaterParams = {
	source: string
	title: string
	desc: string
	author: string
	publishedTime: string
	content: string
}

export type DictionaryQueryForm = {
	name: string
	value: string
}

export type DictionaryQueryTranslate = {
	translation: string
	partName: string
}

export type DictionaryQueryResp = {
	word: string
	ukPhonetic?: string
	usPhonetic?: string
	ukSpeech?: string
	usSpeech?: string
	forms: DictionaryQueryForm[]
	translations: DictionaryQueryTranslate[]
	examTypes: string[]
}

// word

export type QueryWordCollectedResp = {
	collected: boolean
}
