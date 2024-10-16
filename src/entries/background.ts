import { registerBackgroundMessage } from "../messaging/background"
import {
	fetchAllWordsApi,
	fetchAnalyzeGrammarSSEApi,
	fetchAnalyzeWordApi,
} from "@/api"
import {
	onContentMessage,
	type SendContentMessage,
	sendContentMessage,
} from "@/messaging/content"
import type { BackgroundContext } from "@/types"

function createSyncSSEMessage(
	type: keyof SendContentMessage,
	tabId: number | undefined,
) {
	const sync = (done: boolean, result: string) => {
		sendContentMessage(
			type,
			{
				result,
				done,
			},
			tabId,
		)
	}

	return (response: Response) => {
		readResponseSSELine(response, sync.bind(null, false), sync.bind(null, true))
	}
}

async function fetchAllWords() {
	const { error, data } = await createSafePromise(fetchAllWordsApi)()
	if (error) {
		return []
	}
	return data || []
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

	onContentMessage("analyzeGrammar", async ({ data, sender }) => {
		const tabId = sender.tab?.id

		const response = await fetchAnalyzeGrammarSSEApi({
			provider: "deepSeek",
			text: data,
		})

		createSyncSSEMessage("analyzeGrammarResult", tabId)(response)
	})

	onContentMessage("analyzeWord", async ({ data, sender }) => {
		const tabId = sender.tab?.id

		const response = await fetchAnalyzeWordApi({
			provider: "deepSeek",
			word: data,
		})

		createSyncSSEMessage("analyzeWordResult", tabId)(response)
	})
})
