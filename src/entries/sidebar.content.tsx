import ReactDOM from "react-dom/client"
import type { ContentScriptContext } from "wxt/utils/content-script-context"
import type { ShadowRootContentScriptUi } from "wxt/utils/content-script-ui/shadow-root"
import { SIDEBAR_SHADOW_TAG_NAME } from "@/constants"
import { onBackgroundMessage } from "../messaging/content"
import Sidebar from "./sidebar/Sidebar"

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

		if (isMounted) {
			remove()
		} else {
			ui.mount()
		}
	}
}

export default defineContentScript({
	matches: ["<all_urls>"],
	cssInjectionMode: "ui",
	runAt: "document_end",
	async main(ctx) {
		const toggle = createSidebar(ctx)
		onBackgroundMessage("toggleSidebar", toggle)
	},
})
