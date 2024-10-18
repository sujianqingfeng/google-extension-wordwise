import { objectToQueryString } from "."
import { refreshTokenStorage, tokenStorage } from "./storage"

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL

type Method = "get" | "post" | "put" | "delete"
type RefreshCallback = (accessToken: string) => void

let isRefreshing = false
let refreshSubscribers: RefreshCallback[] = []

async function refreshToken(url: string) {
	const rT = await refreshTokenStorage.get()
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

	tokenStorage.set(accessToken)
	refreshTokenStorage.set(refreshToken)

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
			const token = await tokenStorage.get()
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

				refreshToken(REFRESH_TOKEN_URL)
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
			const contentType = res.headers.get("content-type")
			if (contentType?.includes("application/json")) {
				const json = await res.json()
				return json.data
			}

			return res as unknown as R
		}

		throw new Error(res.statusText)
	}

	return makeFetch
}

async function readResponseStream(
	response: Response,
	onChunk: (chunk: string) => void,
	onDone: () => void,
) {
	const reader = response.body?.getReader()
	if (!reader) {
		onDone()
		return
	}

	const decoder = new TextDecoder()
	let buffer = ""

	while (true) {
		const { done, value } = await reader.read()
		if (done) {
			if (buffer) {
				onChunk(buffer)
			}
			onDone()
			return
		}

		buffer += decoder.decode(value, { stream: true })

		const lines = buffer.split("\n")
		buffer = lines.pop() || ""

		for (const line of lines) {
			if (line.trim() !== "") {
				onChunk(line)
			}
		}
	}
}

function readResponseSSELine(
	response: Response,
	onChunk: (buff: string) => void,
	onDone: (buff: string) => void,
) {
	let buff = ""

	readResponseStream(
		response,
		(line) => {
			line = line.replace("data: ", "")
			if (line === "") {
				buff += "\n"
			} else {
				buff += line
			}
			onChunk(buff)
		},
		() => {
			onDone(buff)
		},
	)
}

const BASE_URL_API_PREFIX = "/api"
const BASE_URL = `${BASE_API_URL}${BASE_URL_API_PREFIX}`
const REFRESH_TOKEN_URL = `${BASE_URL}/auth/refresh`
const createCommonRequestOptions = (method: Method) => {
	return {
		method,
		baseUrl: BASE_URL,
	}
}

const requestGet = createRequest(createCommonRequestOptions("get"))
const requestPost = createRequest(createCommonRequestOptions("post"))
const requestPut = createRequest(createCommonRequestOptions("put"))
const requestDelete = createRequest(createCommonRequestOptions("delete"))

export {
	requestGet,
	requestPost,
	requestPut,
	requestDelete,
	readResponseSSELine,
	BASE_URL,
}
