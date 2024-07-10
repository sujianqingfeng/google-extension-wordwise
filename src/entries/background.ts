import { registerBackgroundMessage } from "../messaging/background"
import { sendContentMessage } from "../messaging/content"
import { fetchAllWordsApi } from "@/api"
import type { BackgroundContext } from "@/types"

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
		if (tab.id) {
			sendContentMessage("toggleSidebar", undefined, tab.id)
		}
	})
})
