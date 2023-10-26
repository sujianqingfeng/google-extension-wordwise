export async function fetchJson(url: string, opt?: RequestInit) {
  const headers: [string, string][] | Record<string, string> | Headers = {
    ...opt?.headers
  }

  try {
    const res = await fetch(url, { ...opt, headers })
    if (!res.ok) {
      return [false, new Error('Failed to fetch data')]
    }
    const json = await res.json()
    const { data, code = 0 } = json
    if (code === 0) {
      return [true, data]
    } else {
      return [false, new Error('data maybe not correct')]
    }
  } catch (error) {
    return [false, error]
  }
}

export function fetchJsonByGet(
  url: string,
  data?: Record<string, string>,
  opt?: RequestInit
) {
  const newUrl = `${url}${new URLSearchParams(data).toString()}`
  return fetchJson(newUrl, opt)
}

export function fetchJsonByPost(
  url: string,
  data: Record<string, string>,
  opt?: RequestInit
) {
  return fetchJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(data),
    ...opt
  })
}
