import { fetchExchangeTokenApi } from "@/api"
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

function _createBackgroundMessage(context: BackgroundContext) {
	return {
		async auth() {
			const redirectedTo = await browser.identity.launchWebAuthFlow({
				url: getAuthUrl(),
				interactive: true,
			})

			if (chrome.runtime.lastError) {
				throw new Error("redirectedTo is null")
			}

			const redirectedUrl = new URL(redirectedTo)
			const params = new URLSearchParams(redirectedUrl.hash)
			const idToken = params.get("id_token")

			if (!idToken) {
				throw new Error("idToken is null")
			}

			const { token, refreshToken } = await fetchExchangeTokenApi({ idToken })
			setToken(token)
			setRefreshToken(refreshToken)
		},
		async getUser() {
			return context.user
		},
		addWord(word: string) {
			context.words.push({
				word,
				id: "",
			})
		},
		removeWord(word: string) {
			const index = context.words.findIndex((item) => item.word === word)
			if (index !== -1) {
				context.words.splice(index, 1)
			}
		},
		getWords() {
			return context.words
		},
	}
}

export const [registerBackgroundMessage, createBackgroundMessage] =
	defineProxyService("background", _createBackgroundMessage)
