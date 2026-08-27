import { objectToQueryString } from "."
import { refreshTokenStorage, tokenStorage } from "./storage"

const BASE_API_URL = import.meta.env.VITE_BASE_API_URL

type Method = "get" | "post" | "put" | "delete"
type PendingRetry = {
	retry: (accessToken: string) => void
	fail: (error: unknown) => void
}

let isRefreshing = false
// Requests that hit a 401 while a refresh is in flight wait here and are
// retried (or rejected) together once the refresh settles.
let pendingRetries: PendingRetry[] = []

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

function flushPendingRetries(newAccessToken: string) {
	const subscribers = pendingRetries
	pendingRetries = []
	for (const { retry } of subscribers) {
		retry(newAccessToken)
	}
}

function rejectPendingRetries(error: unknown) {
	const subscribers = pendingRetries
	pendingRetries = []
	for (const { fail } of subscribers) {
		fail(error)
	}
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
		isRetry = false,
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
			// the retried request 401'd too — the token is genuinely bad, stop
			// instead of looping refresh → retry
			if (isRetry) {
				throw new Error("Unauthorized after token refresh")
			}

			if (!isRefreshing) {
				isRefreshing = true

				refreshToken(REFRESH_TOKEN_URL)
					.then((newAccessToken) => {
						isRefreshing = false
						flushPendingRetries(newAccessToken)
					})
					.catch((error) => {
						isRefreshing = false
						// reject everyone waiting on the refresh so nothing hangs forever
						rejectPendingRetries(error)
					})
			}

			return new Promise<R>((resolve, reject) => {
				pendingRetries.push({
					retry: (newAccessToken) => {
						resolve(
							makeFetch(
								url,
								data,
								{
									headers: {
										authorization: `Bearer ${newAccessToken}`,
									},
								},
								true,
							),
						)
					},
					fail: reject,
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

		// empty lines matter downstream: in SSE they separate events, and
		// readResponseSSELine turns them into paragraph breaks — don't filter here
		for (const line of lines) {
			onChunk(line)
		}
	}
}

async function readResponseSSELine(
	response: Response,
	onChunk: (buff: string) => void,
	onDone: (buff: string) => void,
) {
	let buff = ""

	await readResponseStream(
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
	BASE_URL,
	readResponseSSELine,
	requestDelete,
	requestGet,
	requestPost,
	requestPut,
}
