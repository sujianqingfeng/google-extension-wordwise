import ReactDOM from "react-dom/client"
import type { ContentScriptContext, ShadowRootContentScriptUi } from "#imports"
import { CUSTOM_EVENT_TYPE, QUERY_SHADOW_TAG_NAME } from "@/constants"
import { createBackgroundMessage, waitForUser } from "@/messaging/background"
import { onBackgroundMessage } from "@/messaging/content"
import type {
	MaskClickEventDetail,
	QueryContentContext,
	QueryUI,
} from "@/types"
import Query from "./query/Query"
import "~/assets/main.css"

function createWindowSelection(context: QueryContentContext) {
	const onSelectionChange = (callback: (e: MouseEvent) => void) => {
		document.addEventListener("selectstart", () => {
			context.isSelecting = true
		})

		document.addEventListener("mouseup", (e) => {
			if (context.isSelecting) {
				callback(e)
				context.isSelecting = false
			}
		})
	}

	return {
		onSelectionChange,
	}
}

// altKey is read straight off the event that ended the selection (mouseup) or
// triggered the check (keydown) — tracking it across keydown/keyup goes stale
// whenever the window loses focus mid-press and the keyup never arrives
const onSelectionChange = async (
	context: QueryContentContext,
	e: { altKey: boolean },
) => {
	if (!e.altKey) {
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
	// mask clicks and alt-selections can mount faster than
	// createShadowRootUi resolves; only the newest mount may win, an older
	// one landing late is torn down instead of leaking an orphan panel
	let mountSeq = 0

	const remove = () => {
		ui?.remove()
		ui = null
	}

	const mount = async (options: { text?: string; triggerRect?: DOMRect }) => {
		const seq = ++mountSeq
		remove()

		const next = await createShadowRootUi(ctx, {
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

		if (seq !== mountSeq) {
			next.remove()
			return
		}

		ui = next
		ui.mount()
	}

	return {
		mount,
		remove,
		get container() {
			return ui?.uiContainer
		},
	}
}

export default defineContentScript({
	matches: ["<all_urls>"],
	cssInjectionMode: "ui",
	runAt: "document_idle",
	async main(ctx) {
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

			const queryUI = createQueryUI(ctx)

			const context: QueryContentContext = {
				isSelecting: false,
				queryUI,
				currentQueryTriggerEl: null,
			}

			document.addEventListener(
				CUSTOM_EVENT_TYPE.MASK_CLICK_EVENT,
				(e: any) => {
					const { word, rect } = e.detail as MaskClickEventDetail
					queryUI.mount({ text: word, triggerRect: rect })
				},
			)

			// alt pressed while a selection already exists
			document.addEventListener("keydown", (e) => {
				if (e.altKey) {
					onSelectionChange(context, e)
				}
			})

			// alt+drag selection: the mouseup event carries altKey itself
			createWindowSelection(context).onSelectionChange(
				onSelectionChange.bind(null, context),
			)
		}

		// logging in on the sidebar must enable already-open pages without a
		// reload — the background broadcasts to every tab once auth succeeds
		onBackgroundMessage("userChanged", () => init())
		await init()
	},
})
