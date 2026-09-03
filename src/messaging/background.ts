import {
	createProxyService,
	type ProxyService,
	registerService,
} from "@webext-core/proxy-service"
import {
	fetchAddWordCollectedApi,
	fetchAiTranslateApi,
	fetchAllWordsApi,
	fetchAnalyzeGrammarApi,
	fetchDictionPronounceApi,
	fetchDictionQueryApi,
	fetchEdgeTTSApi,
	fetchExchangeTokenApi,
	fetchRemoveWordCollectedApi,
	fetchTranslateApi,
	fetchWordCollectedApi,
} from "@/api"
import type { BackgroundContext } from "@/types"
import { blobToBase64 } from "@/utils/blob"
import { tokenStorage, refreshTokenStorage } from "@/utils/storage"
import { sendContentMessage } from "@/messaging/content"

function getAuthUrl() {
	const manifest = chrome.runtime.getManifest()

	if (!manifest.oauth2) {
		throw new Error("oauth2 is not defined in manifest")
	}

	if (!manifest.oauth2.scopes) {
		throw new Error("scopes is not defined in oauth2")
	}

	const url = new URL("https://accounts.google.com/o/oauth2/auth")

	url.searchParams.set("client_id", manifest.oauth2.client_id)
	url.searchParams.set("response_type", "id_token")
	url.searchParams.set("access_type", "offline")
	url.searchParams.set(
		"redirect_uri",
		`https://${chrome.runtime.id}.chromiumapp.org`,
	)
	url.searchParams.set("scope", manifest.oauth2.scopes.join(" "))

	return url.href
}

function getIdTokenFromHash(url: string) {
	const redirectedUrl = new URL(url)
	let hash = redirectedUrl.hash
	if (hash.startsWith("#")) {
		hash = hash.slice(1)
	}
	const params = new URLSearchParams(hash)
	return params.get("id_token")
}

async function covertUrlToBase64(url: string) {
	const data = await fetch(url)
	if (!data.ok) {
		throw new Error("fail to fetch url")
	}
	const blob = await data.blob()
	const base64 = await blobToBase64(blob)
	return base64
}

async function fetchAudioBase64FromDictionUrl(word: string, type: string) {
	const { url } = await fetchDictionPronounceApi({ word, type })
	const base64 = await covertUrlToBase64(url)
	return base64
}

async function fetchAudioBase64FromEdgeTTS(text: string) {
	const { base64 } = await fetchEdgeTTSApi({
		text,
	})
	return base64
}

// getUser/getWords must not answer before the initial fetch finished, but a
// hung request (e.g. no token → refresh fails) should not stall callers forever.
const READY_TIMEOUT_MS = 5000

function waitContextReady(context: BackgroundContext) {
	const ready = context.ready ?? Promise.resolve()
	return Promise.race([
		ready,
		new Promise<void>((resolve) => setTimeout(resolve, READY_TIMEOUT_MS)),
	])
}

// some tabs have no content script (chrome://, the store) — those sends
// reject and are simply ignored. the message type is pinned at each call
// site via the callback, keeping sendContentMessage's typing intact
async function broadcastToAllTabs(send: (tabId: number) => Promise<unknown>) {
	const tabs = await browser.tabs.query({})
	await Promise.allSettled(
		tabs.map((tab) => (tab.id == null ? Promise.resolve() : send(tab.id))),
	)
}

// getUser returns null both when logged out and when the background's initial
// fetch is still hanging past the ready timeout — indistinguishable from the
// caller's side. A stored token rules out logged-out, so the null was a slow
// start: give the background one more chance before the page gives up.
const USER_RETRY_DELAY_MS = 3000

export async function waitForUser(client: BackgroundClient) {
	const user = await client.getUser()
	if (user) {
		return user
	}
	if (!(await tokenStorage.get())) {
		return null
	}
	await new Promise((resolve) => setTimeout(resolve, USER_RETRY_DELAY_MS))
	return client.getUser()
}

function _createBackgroundMessage(context: BackgroundContext) {
	const addWord = (word: string) => {
		context.words.push({
			word,
			id: "",
		})
	}

	const removeWord = (word: string) => {
		const index = context.words.findIndex((item) => item.word === word)
		if (index !== -1) {
			context.words.splice(index, 1)
		}
	}

	const fetchAddWordCollected = async (word: string) => {
		const data = await fetchAddWordCollectedApi(word)
		addWord(word)
		// keep the masks of already-open tabs in sync, not just this one
		await broadcastToAllTabs((tabId) =>
			sendContentMessage("rangeWords", [word], tabId),
		)
		return data
	}

	const fetchRemoveWordCollected = async (word: string) => {
		const data = await fetchRemoveWordCollectedApi(word)
		removeWord(word)
		await broadcastToAllTabs((tabId) =>
			sendContentMessage("unrangeWords", [word], tabId),
		)
		return data
	}

	const auth = async () => {
		const redirectedTo = await browser.identity.launchWebAuthFlow({
			url: getAuthUrl(),
			interactive: true,
		})
		if (!redirectedTo || chrome.runtime.lastError) {
			throw new Error("redirectedTo is null")
		}

		const idToken = getIdTokenFromHash(redirectedTo)
		if (!idToken) {
			throw new Error("idToken is null")
		}
		const { accessToken, refreshToken } = await fetchExchangeTokenApi({
			idToken,
		})

		tokenStorage.set(accessToken)
		refreshTokenStorage.set(refreshToken)
		context.user = await fetchUser()
		// the startup fetch ran logged-out and cached an empty word list;
		// re-populate it so range.content sees the real collection
		try {
			context.words = await fetchAllWordsApi()
		} catch {
			context.words = []
		}
		// content scripts of already-open pages checked login once at injection
		// and disabled themselves — let them retry without a reload
		await broadcastToAllTabs((tabId) =>
			sendContentMessage("userChanged", undefined, tabId),
		)
		return context.user
	}

	return {
		auth,
		async getUser() {
			await waitContextReady(context)
			return context.user
		},
		async getWords() {
			await waitContextReady(context)
			return context.words
		},
		fetchDictionQuery: fetchDictionQueryApi,
		fetchWordCollected: fetchWordCollectedApi,
		fetchTranslate: fetchTranslateApi,
		fetchAiTranslate: fetchAiTranslateApi,
		fetchAnalyzeGrammar: fetchAnalyzeGrammarApi,
		fetchAddWordCollected,
		fetchRemoveWordCollected,
		fetchAudioBase64FromDictionUrl,
		fetchAudioBase64FromEdgeTTS,
	}
}

export type BackgroundMessages = ReturnType<typeof _createBackgroundMessage>

export type BackgroundClient = ProxyService<BackgroundMessages>

export function registerBackgroundMessage(context: BackgroundContext) {
	return registerService("background", _createBackgroundMessage(context))
}

export function createBackgroundMessage(): BackgroundClient {
	return createProxyService<BackgroundMessages>("background")
}
