import {
	fetchAddWordCollectedApi,
	fetchDictionQueryApi,
	fetchExchangeTokenApi,
	fetchRemoveWordCollectedApi,
	fetchWordCollectedApi,
} from "@/api"
import type { BackgroundContext } from "@/types"
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
		setToken(accessToken)
		setRefreshToken(refreshToken)

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
		fetchAddWordCollected,
		fetchRemoveWordCollected,
	}
}

export const [registerBackgroundMessage, createBackgroundMessage] =
	defineProxyService("background", _createBackgroundMessage)
