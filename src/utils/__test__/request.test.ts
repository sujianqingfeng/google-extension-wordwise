import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

type FetchCall = {
	url: string
	init?: RequestInit
}

function jsonResponse(status: number, payload: unknown, statusText = "") {
	return {
		ok: status >= 200 && status < 300,
		status,
		statusText,
		headers: {
			get: (name: string) =>
				name.toLowerCase() === "content-type" ? "application/json" : null,
		},
		json: async () => payload,
	}
}

// request.ts keeps refresh state at module scope — a fresh module per test
async function loadModule() {
	vi.resetModules()
	return await import("../request")
}

beforeEach(() => {
	vi.unstubAllGlobals()
})

afterEach(() => {
	vi.unstubAllGlobals()
})

describe("token refresh on 401", () => {
	test("concurrent 401s share one refresh, both retried with the new token", async () => {
		const calls: FetchCall[] = []
		let authHeader: string | undefined

		const stub = vi.fn(async (_url: string, init?: RequestInit) => {
			calls.push({ url: _url, init })

			if (_url.includes("/auth/refresh")) {
				authHeader = undefined
				const body = JSON.parse(String(init?.body))
				expect(body.refreshToken).toBe("old-refresh")
				return jsonResponse(200, {
					data: { accessToken: "new-access", refreshToken: "new-refresh" },
				})
			}

			authHeader = init?.headers?.authorization as string | undefined
			return authHeader === "Bearer new-access"
				? jsonResponse(200, { data: "done" })
				: jsonResponse(401, null)
		})
		vi.stubGlobal("fetch", stub)

		vi.doMock("../storage", () => ({
			tokenStorage: {
				get: vi.fn(async () => (authHeader ? "" : "stale")),
				set: vi.fn(),
			},
			refreshTokenStorage: {
				get: vi.fn(async () => "old-refresh"),
				set: vi.fn(),
			},
		}))

		const { requestPost } = await loadModule()

		const [a, b] = await Promise.all([
			requestPost<string>("/ai/openai/translate", {}),
			requestPost<string>("/ai/openai/translate", {}),
		])

		expect(a).toBe("done")
		expect(b).toBe("done")

		const apiCalls = calls.filter((call) => !call.url.includes("/auth/refresh"))
		const refreshCalls = calls.filter((call) =>
			call.url.includes("/auth/refresh"),
		)
		expect(refreshCalls).toHaveLength(1)
		// both requests were retried, not dropped
		expect(apiCalls).toHaveLength(4)
		for (const call of apiCalls.slice(2)) {
			expect(call.init?.headers?.authorization).toBe("Bearer new-access")
		}
	})

	test("failed refresh rejects every queued request instead of hanging them", async () => {
		const calls: FetchCall[] = []
		const stub = vi.fn(async (url: string, init?: RequestInit) => {
			calls.push({ url, init })
			if (url.includes("/auth/refresh")) {
				return jsonResponse(500, null, "refresh rejected")
			}
			return jsonResponse(401, null)
		})
		vi.stubGlobal("fetch", stub)

		vi.doMock("../storage", () => ({
			tokenStorage: { get: vi.fn(async () => ""), set: vi.fn() },
			refreshTokenStorage: { get: vi.fn(async () => "dead"), set: vi.fn() },
		}))

		const { requestGet } = await loadModule()

		const first = requestGet("/user")
		const second = requestGet("/word/all")

		await expect(first).rejects.toThrow()
		await expect(second).rejects.toThrow()

		// initial calls + exactly one refresh attempt, no retry storm
		expect(
			calls.filter((call) => call.url.includes("/auth/refresh")),
		).toHaveLength(1)
		expect(calls).toHaveLength(3)
	})

	test("a retried request hitting 401 again stops instead of looping refresh", async () => {
		const stub = vi.fn(async (url: string) =>
			url.includes("/auth/refresh")
				? jsonResponse(200, {
						data: { accessToken: "fresh", refreshToken: "r" },
					})
				: jsonResponse(401, null),
		)
		vi.stubGlobal("fetch", stub)

		vi.doMock("../storage", () => ({
			tokenStorage: { get: vi.fn(async () => ""), set: vi.fn() },
			refreshTokenStorage: { get: vi.fn(async () => "r"), set: vi.fn() },
		}))

		const { requestGet } = await loadModule()

		await expect(requestGet("/word/all")).rejects.toThrow(
			"Unauthorized after token refresh",
		)

		expect(
			stub.mock.calls.filter(([url]) => String(url).includes("/auth/refresh")),
		).toHaveLength(1)
	})
})

describe("readResponseSSELine", () => {
	function sseResponse(frames: Uint8Array[], failOnRead = -1) {
		let index = 0
		const body = {
			getReader: () => ({
				read: async () => {
					if (index === failOnRead) {
						throw new Error("stream broken")
					}
					if (index >= frames.length) {
						return { done: true, value: undefined }
					}
					return { done: false, value: frames[index++] }
				},
			}),
		}
		return { body } as unknown as Response
	}

	test("strips data: prefixes and joins chunks across reads", async () => {
		const encoder = new TextEncoder()
		const response = sseResponse([
			encoder.encode("data: 一\n\n"),
			encoder.encode("data: 二\n"),
		])

		const snapshots: string[] = []
		await loadModule().then(({ readResponseSSELine }) =>
			readResponseSSELine(
				response,
				(buff) => snapshots.push(buff),
				(finalBuff) => snapshots.push(`done:${finalBuff}`),
			),
		)

		expect(snapshots.at(-2)).toBe("一\n二")
		expect(snapshots.at(-1)).toBe("done:一\n二")
	})

	test("mid-stream errors propagate so callers can send their own failure message", async () => {
		const response = sseResponse([], 0)

		await expect(
			loadModule().then(({ readResponseSSELine }) =>
				readResponseSSELine(
					response,
					() => {},
					() => {},
				),
			),
		).rejects.toThrow("stream broken")
	})
})
