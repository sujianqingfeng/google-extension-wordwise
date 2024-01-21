import { tokenStorage } from './storage'

export const BASE_URL = import.meta.env.VITE_BASE_API_URL

export async function fetchJson<T>(
  url: string,
  opt?: RequestInit
): Promise<[false, any] | [true, T]> {
  const headers: [string, string][] | Record<string, string> | Headers = {
    ...opt?.headers
  }

  try {
    const token = await tokenStorage.getToken()
    if (token) {
      const h = headers as Record<string, string>
      h.authorization = `Bearer ${token}`
    }

    const res = await fetch(`${BASE_URL}${url}`, { ...opt, headers })
    if (!res.ok) {
      return [false, new Error('Failed to fetch data')]
    }

    const json = await res.json()
    const { data, code = 0 } = json

    if (code === 0) {
      return [true, data] as [true, T]
    } else {
      return [false, new Error('data maybe not correct')]
    }
  } catch (error) {
    return [false, error]
  }
}

function createFetchByMethod(method: string) {
  return <T = Record<string, any>>(
    url: string,
    data: Record<string, any>,
    opt?: RequestInit
  ) => {
    return fetchJson<T>(url, {
      method,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(data),
      ...opt
    })
  }
}

export function fetchJsonByGet<T = Record<string, any>>(
  url: string,
  data?: Record<string, any>,
  opt?: RequestInit
) {
  let query = new URLSearchParams(data).toString()
  query = query ? `?${query}` : ''
  const newUrl = `${url}${query}`
  return fetchJson<T>(newUrl, opt)
}

export const fetchJsonByPost = createFetchByMethod('POST')
export const fetchJsonByDelete = createFetchByMethod('DELETE')
export const fetchJsonByPut = createFetchByMethod('PUT')
