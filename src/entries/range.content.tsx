import { CUSTOM_EVENT_TYPE } from "@/constants"
import { createBackgroundMessage } from "@/messaging/background"
import { rangeWords } from "./core/range"
import "./core/range.css"

export default defineContentScript({
	matches: ["<all_urls>"],
	runAt: "document_end",
	cssInjectionMode: "manifest",
	async main() {
		const bgs = createBackgroundMessage()
		const user = await bgs.getUser()

		if (!user) {
			return
		}

		// a word collected via the query panel mid-session gets masked too
		document.addEventListener(CUSTOM_EVENT_TYPE.RANGE_WORDS, (event) => {
			const words = (event as CustomEvent<string[]>).detail
			if (Array.isArray(words) && words.length > 0) {
				rangeWords(words)
			}
		})

		const words = await bgs.getWords()
		const pureWords = words.map((word) => word.word)
		rangeWords(pureWords)
	},
})
