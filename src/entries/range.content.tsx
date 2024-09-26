import { rangeWords } from "./core/range"
import { createBackgroundMessage } from "@/messaging/background"
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

		const words = await bgs.getWords()
		const pureWords = words.map((word) => word.word)
		rangeWords(pureWords)
	},
})
