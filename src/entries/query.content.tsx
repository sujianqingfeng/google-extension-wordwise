import type {
	MaskClickEventDetail,
	QueryContentContext,
	QueryUI,
} from "@/types"
import type { ContentScriptContext, ShadowRootContentScriptUi } from "#imports"
import ReactDOM from "react-dom/client"
import Query from "./query/Query"
import { CUSTOM_EVENT_TYPE, QUERY_SHADOW_TAG_NAME } from "@/constants"
import { createBackgroundMessage } from "@/messaging/background"
import "~/assets/main.css"

function createWindowSelection(context: QueryContentContext) {
	const onSelectionChange = (callback: () => void) => {
		document.addEventListener("selectstart", () => {
			context.isSelecting = true
		})

		document.addEventListener("mouseup", () => {
			if (context.isSelecting) {
				callback()
				context.isSelecting = false
			}
		})
	}

	return {
		onSelectionChange,
	}
}

const onSelectionChange = async (context: QueryContentContext) => {
	if (!context.isPressedAlt) {
		return
	}

	const selection = window.getSelection()
	if (!selection) {
		return
	}

	const selectionText = selection.toString().trim()
	if (!selectionText) {
		return
	}

	if (!isEnglishText(selectionText)) {
		return
	}

	const range = selection.getRangeAt(0)

	// no operation when the selection is in the query panel
	const parentElement = range.commonAncestorContainer.parentElement

	if (context.queryUI.container?.contains(parentElement)) {
		return
	}
	context.currentQueryTriggerEl = parentElement

	const rect = range.getBoundingClientRect()

	context.queryUI.mount({
		text: selectionText,
		triggerRect: rect,
	})
}

function createQueryUI(ctx: ContentScriptContext): QueryUI {
	let ui: ShadowRootContentScriptUi<ReactDOM.Root> | null = null

	const mount = async (options: {
		text?: string
		triggerRect?: DOMRect
	}) => {
		if (ui) {
			remove()
		}

		ui = await createShadowRootUi(ctx, {
			name: QUERY_SHADOW_TAG_NAME,
			position: "inline",
			anchor: "body",
			onMount: (container) => {
				const innerContainer = document.createElement("div")
				container.appendChild(innerContainer)
				const root = ReactDOM.createRoot(innerContainer)
				root.render(<Query removeQueryPanel={remove} {...options} />)
				return root
			},
			onRemove: (root) => {
				root?.unmount()
			},
		})

		ui.mount()
	}

	const remove = () => {
		ui?.remove()
	}

	return {
		mount,
		remove,
		get container() {
			return ui?.uiContainer
		},
	}
}

function createKeyType(
	context: QueryContentContext,
	keydown: (e: KeyboardEvent) => void,
) {
	document.addEventListener("keydown", (e) => {
		context.isPressedAlt = e.altKey
		keydown(e)
	})

	document.addEventListener("keyup", (e) => {
		context.isPressedAlt = e.altKey
	})
}

export default defineContentScript({
	matches: ["<all_urls>"],
	cssInjectionMode: "ui",
	runAt: "document_idle",
	async main(ctx) {
		// Wait for DOM to be ready
		// if (document.readyState === "loading") { // No longer strictly necessary with document_idle, but harmless to keep
		// 	await new Promise((resolve) =>
		// 		document.addEventListener("DOMContentLoaded", resolve, { once: true }),
		// 	)
		// } // You might decide to remove this block later if runAt: "document_idle" proves reliable.

		console.log("wordwise: DOM is ready")

		const bgs = createBackgroundMessage()

		const user = await bgs.getUser()
		if (!user) {
			console.log("wise: User not found, exiting content script")
			return
		}

		const queryUI = createQueryUI(ctx)

		const context: QueryContentContext = {
			isPressedAlt: false,
			isSelecting: false,
			queryUI,
			currentQueryTriggerEl: null,
		}

		document.addEventListener(CUSTOM_EVENT_TYPE.MASK_CLICK_EVENT, (e: any) => {
			const { word, rect } = e.detail as MaskClickEventDetail
			queryUI.mount({ text: word, triggerRect: rect })
		})

		createKeyType(context, (e) => {
			if (e.altKey) {
				onSelectionChange(context)
			}
		})

		createWindowSelection(context).onSelectionChange(
			onSelectionChange.bind(null, context),
		)
	},
})
