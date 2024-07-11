import { objectToQueryString } from "."

export const BASE_URL = import.meta.env.VITE_BASE_API_URL

type Method = "get" | "post" | "put" | "delete"

function createRequest({
	method,
	baseUrl = "",
}: {
	method: Method
	baseUrl?: string
}) {
	return async <R = any, T = Record<string, any>>(
		url: string,
		data?: T,
		opt?: RequestInit,
	): Promise<R> => {
		url = `${baseUrl}${url}`

		if (method === "get" && data && Object.keys(data).length) {
			url = `${url}?${objectToQueryString(data)}`
		}

		const headers: Record<string, any> = {
			...opt?.headers,
		}

		const token = await getToken()
		if (token) {
			headers.authorization = `Bearer ${token}`
		}

		const body =
			method === "get" || !data ? undefined : new URLSearchParams(data)

		const options = {
			...opt,
			method,
			headers,
			body,
		}

		const res = await fetch(url, options)

		console.log("🚀 ~ res:", res)
		if (res.status === 200) {
			const json = await res.json()
			return json.data
		}

		throw new Error(res.statusText)
	}
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
