import { registerBackgroundMessage } from "../messaging/background"
import { fetchAllWordsApi } from "@/api"
import { onContentMessage, sendContentMessage } from "@/messaging/content"
import type { BackgroundContext } from "@/types"
import { BASE_URL } from "@/utils/request"

async function fetchAllWords() {
	const { error, data } = await createSafePromise(fetchAllWordsApi)()
	if (error) {
		return []
	}
	return data || []
}

let temp = ""
async function analyzeGrammar(text: string, tabId: number | undefined) {
	const token = await getToken()

	if (!token) {
		return
	}

	const res = await fetch(`${BASE_URL}/ai/deepSeek/analyze-grammar-sse`, {
		method: "POST",
		body: new URLSearchParams({ text }),
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Bearer ${token}`,
		},
	})

	if (!res.ok) {
		return
	}

	if (res.body === null) {
		return
	}

	const reader = res.body.getReader()
	const decoder = new TextDecoder()

	async function readStream() {
		const { done, value } = await reader.read()
		if (done) {
			sendContentMessage(
				"analyzeGrammarResult",
				{
					result: temp,
					done: true,
				},
				tabId,
			)
			temp = ""
			return
		}

		const text = decoder.decode(value, { stream: true })
		if (text.startsWith("data:")) {
			const data = text.slice(6).replace(/\n/g, "")
			if (data === "") {
				temp += "\n"
			} else {
				temp += data
			}
			sendContentMessage(
				"analyzeGrammarResult",
				{
					result: temp,
					done: false,
				},
				tabId,
			)
		}
		await readStream()
	}
	temp = ""
	readStream()
}

async function fetchContext(context: BackgroundContext) {
	context.user = await fetchUser()
	context.words = await fetchAllWords()
}

export default defineBackground(() => {
	const context: BackgroundContext = {
		user: null,
		words: [],
	}

	registerBackgroundMessage(context)

	fetchContext(context)

	browser.action.onClicked.addListener((tab) => {
		if (tab.id && !tab.url?.includes("//extensions/")) {
			sendContentMessage("toggleSidebar", undefined, tab.id)
		}
	})

	onContentMessage("analyzeGrammar", ({ data, sender }) => {
		const tabId = sender.tab?.id
		analyzeGrammar(data, tabId)

		sendContentMessage("analyzeGrammarResult", "test")
	})
})
