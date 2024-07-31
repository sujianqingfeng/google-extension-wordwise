import type {
	ContentScriptContext,
	ShadowRootContentScriptUi,
} from "wxt/client"
import ReactDOM from "react-dom/client"
import Sidebar from "./sidebar/Sidebar"
import { onMessage } from "../messaging/content"
import { SIDEBAR_SHADOW_TAG_NAME } from "@/constants"

import "~/assets/main.css"

function createSidebar(ctx: ContentScriptContext) {
	let isMounted = false
	let ui: ShadowRootContentScriptUi<ReactDOM.Root> | null = null

	return async function toggle() {
		if (!ui) {
			ui = await createShadowRootUi(ctx, {
				name: SIDEBAR_SHADOW_TAG_NAME,
				position: "inline",
				anchor: "body",
				onMount: (container) => {
					const innerContainer = document.createElement("div")
					container.appendChild(innerContainer)
					const root = ReactDOM.createRoot(innerContainer)
					root.render(<Sidebar removeSidebar={remove} />)
					isMounted = true
					return root
				},
				onRemove: (root) => {
					root?.unmount()
					isMounted = false
				},
			})
		}

		const remove = () => {
			ui?.remove()
		}

		isMounted ? remove() : ui.mount()
	}
}

export default defineContentScript({
	matches: ["<all_urls>"],
	// matches: ['https://wxt.dev'],
	cssInjectionMode: "ui",
	runAt: "document_idle",
	async main(ctx) {
		const toggle = createSidebar(ctx)
		onMessage("toggleSidebar", toggle)
	},
})
