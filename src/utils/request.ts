export const BASE_URL = import.meta.env.VITE_BASE_API_URL

export function createWithTokenFetcher(method: string) {
  return async <T = Record<string, any>, R = any>(
    key: {
      url: string
      token?: string
      body?: Record<string, any>
    },
    options: { arg?: R } = {}
  ) => {
    const { token, url, body } = key
    const { arg } = options

    const headers: HeadersInit = {}

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const mergeUrl = `${BASE_URL}${url}`
    const response = await fetch(mergeUrl, {
      headers,
      method,
      body: arg
        ? new URLSearchParams(arg)
        : body
        ? new URLSearchParams(body)
        : undefined
    })

    if (!response.ok) {
      throw new Error('Failed to fetch data')
    }

    const { code, data, msg } = await response.json()

    if (code !== 0) {
      throw new Error(msg)
    }

    return data as T
  }
}

export const withTokenFetcher = createWithTokenFetcher('GET')
export const postWithTokenFetcher = createWithTokenFetcher('POST')
export const deleteWithTokenFetcher = createWithTokenFetcher('DELETE')
