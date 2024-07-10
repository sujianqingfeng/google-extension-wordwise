import type {
	ExchangeTokenParams,
	ExchangeTokenResp,
	IWordRespItem,
	LoginResp,
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
