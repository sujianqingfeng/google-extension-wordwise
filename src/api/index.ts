import type {
	AnalyzeGrammarParams,
	AnalyzeWordParams,
	CreateReadLaterParams,
	DictionaryPronounceResp,
	DictionaryQueryResp,
	ExchangeTokenParams,
	ExchangeTokenResp,
	IWordRespItem,
	QueryWordCollectedResp,
	TranslateParams,
	UserResp,
} from "./types"

//
export const fetchAllWordsApi = () => requestGet<IWordRespItem[]>("/word/all")
// user
export const fetchUserInfoApi = () => requestGet<UserResp>("/user")

//
export const fetchExchangeTokenApi = (params: ExchangeTokenParams) =>
	requestPost<ExchangeTokenResp>("/auth/google/id-token", params)

// read later
export const fetchReadLaterApi = (params: CreateReadLaterParams) =>
	requestPost("/read-later", params)

// dictionary
export const fetchDictionQueryApi = (word: string) =>
	requestGet<DictionaryQueryResp>("/dictionary/query", { word })

export const fetchDictionPronounceApi = (params: {
	word: string
	type: string
}) => requestGet<DictionaryPronounceResp>("/dictionary/pronounce", params)

// collected
export const fetchWordCollectedApi = (word: string) =>
	requestGet<QueryWordCollectedResp>("/word/collected", { word })

export const fetchAddWordCollectedApi = (word: string) =>
	requestPut("/word/collect", { word })

export const fetchRemoveWordCollectedApi = (word: string) =>
	requestDelete("/word/collect", { word })

// translate
export const fetchTranslateApi = (params: TranslateParams) =>
	requestPost<string>(`/translator/${params.provider}/translate`, params)

export const fetchAiTranslateApi = (params: AnalyzeGrammarParams) =>
	requestPost<string>(`/ai/${params.provider}/translate`, params)

// analyze
export const fetchAnalyzeGrammarApi = (params: AnalyzeGrammarParams) =>
	requestPost<string>(`/ai/${params.provider}/analyze-grammar`, params)

// analyze
export const fetchAnalyzeGrammarSSEApi = (params: AnalyzeGrammarParams) =>
	requestPost<Response>(`/ai/${params.provider}/analyze-grammar-sse`, params)

// analyze word
export const fetchAnalyzeWordApi = (params: AnalyzeWordParams) =>
	requestPost<Response>(`/ai/${params.provider}/analyze-word`, params)
