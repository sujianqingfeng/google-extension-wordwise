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
	return async <R = any>(
		url: string,
		data?: Record<string, any>,
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
		console.log("🚀 ~ token:", token)
		if (token) {
			headers.authorization = `Bearer ${token}`
		}

		const body =
			method === "get" || !data ? undefined : new URLSearchParams(data)

		const res = await fetch(url, {
			...opt,
			method,
			headers,
			body,
		})

		console.log("🚀 ~ res:", res)
		if (res.status === 200) {
			const json = await res.json()
			return json.data
		}

		throw new Error("Request failed")
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
