import type {
	CreateReadLaterParams,
	DictionaryQueryResp,
	ExchangeTokenParams,
	ExchangeTokenResp,
	IWordRespItem,
	LoginResp,
	QueryWordCollectedResp,
	TranslateParams,
	TranslateResp,
} from "./types"

//
export const fetchAllWordsApi = () => requestGet<IWordRespItem[]>("/word/all")
// user
export const fetchUserInfoApi = () => requestGet<LoginResp>("/user")
// translation
export const fetchTranslateApi = (body: TranslateParams) =>
	requestGet<TranslateResp>("/translator/translate", body)
//
export const fetchExchangeTokenApi = (params: ExchangeTokenParams) =>
	requestPost<ExchangeTokenResp>("/auth/google/id-token", params)

// read later
export const fetchReadLaterApi = (params: CreateReadLaterParams) =>
	requestPost("/read-later", params)

// dictionary
export const fetchDictionQueryApi = (word: string) =>
	requestGet<DictionaryQueryResp>("/dictionary/query", { word })

// collected

export const fetchWordCollectedApi = (word: string) =>
	requestGet<QueryWordCollectedResp>("/word/collected", { word })

export const fetchAddWordCollectedApi = (word: string) =>
	requestPut("/word/collect", { word })

export const fetchRemoveWordCollectedApi = (word: string) =>
	requestDelete("/word/collect", { word })
