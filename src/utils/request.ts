import { objectToQueryString } from "."

export const BASE_URL = import.meta.env.VITE_BASE_API_URL

type Method = "get" | "post" | "put" | "delete"
type RefreshCallback = (accessToken: string) => void

let isRefreshing = false
let refreshSubscribers: RefreshCallback[] = []

async function refreshToken(url: string) {
	const rT = await getRefreshToken()
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			refreshToken: rT,
		}),
	})

	if (!response.ok) {
		throw new Error("Token refresh failed")
	}
	const {
		data: { accessToken, refreshToken },
	} = await response.json()

	setToken(accessToken)
	setRefreshToken(refreshToken)

	return accessToken
}

function subscribeTokenRefresh(callback: RefreshCallback) {
	refreshSubscribers.push(callback)
}

function onAccessTokenFetched(newAccessToken: string) {
	for (const callback of refreshSubscribers) {
		callback(newAccessToken)
	}
	refreshSubscribers = []
}

function createRequest({
	method,
	baseUrl = "",
}: {
	method: Method
	baseUrl?: string
}) {
	const makeFetch = async <R = any, T = Record<string, any>>(
		url: string,
		data?: T,
		opt?: RequestInit,
	): Promise<R> => {
		let finalUrl = `${baseUrl}${url}`

		if (method === "get" && data && Object.keys(data).length) {
			finalUrl = `${finalUrl}?${objectToQueryString(data)}`
		}

		const headers: Record<string, any> = {
			...opt?.headers,
		}

		if (!headers.authorization) {
			const token = await getToken()
			if (token) {
				headers.authorization = `Bearer ${token}`
			}
		}

		const body =
			method === "get" || !data ? undefined : new URLSearchParams(data)

		const options = {
			...opt,
			method,
			headers,
			body,
		}

		const res = await fetch(finalUrl, options)

		if (res.status === 401) {
			if (!isRefreshing) {
				isRefreshing = true

				refreshToken(`${BASE_URL}/api/auth/refresh`)
					.then((newAccessToken) => {
						isRefreshing = false
						onAccessTokenFetched(newAccessToken)
					})
					.catch((error) => {
						isRefreshing = false
						throw error
					})
			}

			return new Promise((resolve) => {
				subscribeTokenRefresh((newAccessToken) => {
					const options = {
						headers: {
							authorization: `Bearer ${newAccessToken}`,
						},
					}
					resolve(makeFetch(url, data, options))
				})
			})
		}

		if (res.ok) {
			const json = await res.json()
			return json.data
		}

		throw new Error(res.statusText)
	}

	return makeFetch
}

const BASE_URL_API_PREFIX = "/api"
const createCommonRequestOptions = (method: Method) => {
	return {
		method,
		baseUrl: `${BASE_URL}${BASE_URL_API_PREFIX}`,
	}
}

export const requestGet = createRequest(createCommonRequestOptions("get"))
export const requestPost = createRequest(createCommonRequestOptions("post"))
export const requestPut = createRequest(createCommonRequestOptions("put"))
export const requestDelete = createRequest(createCommonRequestOptions("delete"))
