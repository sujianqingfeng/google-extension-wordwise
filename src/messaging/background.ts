import {
	fetchAddWordCollectedApi,
	fetchAiTranslateApi,
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
import { refreshTokenStorage, tokenStorage } from "@/utils/storage"
import { defineProxyService } from "@webext-core/proxy-service"

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
		return data
	}

	const fetchRemoveWordCollected = async (word: string) => {
		const data = await fetchRemoveWordCollectedApi(word)
		removeWord(word)
		return data
	}

	const auth = async () => {
		const redirectedTo = await browser.identity.launchWebAuthFlow({
			url: getAuthUrl(),
			interactive: true,
		})
		if (chrome.runtime.lastError) {
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
		return context.user
	}

	return {
		auth,
		getUser() {
			return context.user
		},
		getWords() {
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

export const [registerBackgroundMessage, createBackgroundMessage] =
	defineProxyService("background", _createBackgroundMessage)
