import { registerBackgroundMessage } from "../messaging/background"
import { fetchAllWordsApi, fetchAnalyzeGrammarSSEApi } from "@/api"
import { onContentMessage, sendContentMessage } from "@/messaging/content"
import type { BackgroundContext } from "@/types"

async function fetchAllWords() {
	const { error, data } = await createSafePromise(fetchAllWordsApi)()
	if (error) {
		return []
	}
	return data || []
}

async function analyzeGrammar(text: string, tabId: number | undefined) {
	const response = await fetchAnalyzeGrammarSSEApi({
		provider: "deepSeek",
		text,
	})

	const sendAnalyzeGrammarResult = (done: boolean, result: string) => {
		sendContentMessage(
			"analyzeGrammarResult",
			{
				result,
				done,
			},
			tabId,
		)
	}

	readResponseSSELine(
		response,
		sendAnalyzeGrammarResult.bind(null, false),
		sendAnalyzeGrammarResult.bind(null, true),
	)
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
	})
})
