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
import type { IWordRespItem, UserResp } from "@/api/types"
import { registerBackgroundMessage } from "../messaging/background"

const ANALYZE_FAILED_MESSAGE = "分析失败，请稍后重试。"

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

	return async (response: Response) => {
		try {
			await readResponseSSELine(
				response,
				sync.bind(null, false),
				sync.bind(null, true),
			)
		} catch (error) {
			console.error("wordwise: SSE stream failed", error)
			sync(true, ANALYZE_FAILED_MESSAGE)
		}
	}
}

async function fetchAllWords() {
	const { error, data } = await createSafePromise(fetchAllWordsApi)()
	if (error) {
		return []
	}
	return data || []
}

// builds made with WORDWISE_DEV_MOCK set fall back to a mock account when
// there is no real login, so content scripts and the e2e suite run without
// auth; the constant is statically false otherwise and production builds
// eliminate the branch entirely
const DEV_MOCK_USER: UserResp = {
	token: "dev-mock",
	name: "dev-tester",
	email: "dev@localhost",
	avatar: "",
}
const DEV_MOCK_WORDS: IWordRespItem[] = [
	"panda",
	"river",
	"mountain",
	"ancient",
	"discover",
].map((word, index) => ({ id: `mock-${index}`, word }))

async function fetchContext(context: BackgroundContext) {
	context.user = await fetchUser()
	context.words = await fetchAllWords()
	if (__WORDWISE_DEV_MOCK__ && !context.user) {
		context.user = DEV_MOCK_USER
		context.words = DEV_MOCK_WORDS
	}
}

export default defineBackground(() => {
	const context: BackgroundContext = {
		user: null,
		words: [],
	}

	registerBackgroundMessage(context)

	// Content scripts waking this service worker read context.user/words via
	// getUser/getWords — keep the loading promise around so those calls can
	// wait for it instead of racing with a half-initialized context.
	context.ready = fetchContext(context)

	browser.action.onClicked.addListener((tab) => {
		if (tab.id && !tab.url?.includes("//extensions/")) {
			sendContentMessage("toggleSidebar", undefined, tab.id)
		}
	})

	onContentMessage("analyzeGrammar", async ({ data, sender }) => {
		const tabId = sender.tab?.id

		try {
			const response = await fetchAnalyzeGrammarSSEApi({
				provider: "deepSeek",
				text: data,
			})

			await createSyncSSEMessage("analyzeGrammarResult", tabId)(response)
		} catch (error) {
			console.error("wordwise: analyzeGrammar failed", error)
			sendContentMessage(
				"analyzeGrammarResult",
				{ result: ANALYZE_FAILED_MESSAGE, done: true },
				tabId,
			)
		}
	})

	onContentMessage("analyzeWord", async ({ data, sender }) => {
		const tabId = sender.tab?.id

		try {
			const response = await fetchAnalyzeWordApi({
				provider: "deepSeek",
				word: data,
			})

			await createSyncSSEMessage("analyzeWordResult", tabId)(response)
		} catch (error) {
			console.error("wordwise: analyzeWord failed", error)
			sendContentMessage(
				"analyzeWordResult",
				{ result: ANALYZE_FAILED_MESSAGE, done: true },
				tabId,
			)
		}
	})
})
