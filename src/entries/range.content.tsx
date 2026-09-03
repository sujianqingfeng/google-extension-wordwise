import { CUSTOM_EVENT_TYPE } from "@/constants"
import { createBackgroundMessage, waitForUser } from "@/messaging/background"
import { onBackgroundMessage } from "@/messaging/content"
import { rangeWords, unrangeWords } from "./core/range"
import "./core/range.css"

function applyWordsEvent(event: Event, apply: (words: string[]) => void) {
	const words = (event as CustomEvent<string[]>).detail
	if (Array.isArray(words) && words.length > 0) {
		apply(words)
	}
}

export default defineContentScript({
	matches: ["<all_urls>"],
	runAt: "document_end",
	cssInjectionMode: "manifest",
	async main() {
		const bgs = createBackgroundMessage()

		let initialized = false
		const init = async () => {
			if (initialized) {
				return
			}
			const user = await waitForUser(bgs)
			if (!user) {
				return
			}
			initialized = true

			// a word collected via the query panel mid-session gets masked too
			document.addEventListener(CUSTOM_EVENT_TYPE.RANGE_WORDS, (event) => {
				applyWordsEvent(event, rangeWords)
			})
			// un-collecting must unwrap its masks — masking stays reversible
			document.addEventListener(
				CUSTOM_EVENT_TYPE.RANGE_WORDS_REMOVE,
				(event) => {
					applyWordsEvent(event, unrangeWords)
				},
			)

			// collection changes from any tab are broadcast by the background,
			// so already-open tabs pick up new words without a reload
			onBackgroundMessage("rangeWords", ({ data }) => {
				if (data.length > 0) {
					rangeWords(data)
				}
			})
			onBackgroundMessage("unrangeWords", ({ data }) => {
				if (data.length > 0) {
					unrangeWords(data)
				}
			})

			const words = await bgs.getWords()
			const pureWords = words.map((word) => word.word)
			rangeWords(pureWords)
		}

		// logging in on the sidebar enables this page without a reload
		onBackgroundMessage("userChanged", () => init())
		await init()
	},
})
