import { EXCLUDE_TAG_ELEMENTS } from "@/constants"
import { createBackgroundMessage, waitForUser } from "@/messaging/background"
import { onBackgroundMessage } from "@/messaging/content"
import "./core/typography.css"
import { debounce, throttle } from "@/utils"

function isInlineElement(el: Element) {
	// computed display catches styled spans / custom elements a tag list would miss
	return window.getComputedStyle(el).display.startsWith("inline")
}

// elementFromPoint returns the deepest element — often an inline span/a/code
// wrapping only part of a paragraph. Climb to the closest block ancestor so the
// whole paragraph is targeted.
function getParagraphTarget(el: HTMLElement): HTMLElement | null {
	let current: HTMLElement | null = el
	while (current && current !== document.body) {
		if (EXCLUDE_TAG_ELEMENTS.includes(current.tagName.toLowerCase())) {
			return null
		}
		if (!isInlineElement(current)) {
			// a block containing other blocks is a section, not a paragraph
			const hasBlockChild = Array.from(current.children).some(
				(child) => !isInlineElement(child),
			)
			return hasBlockChild ? null : current
		}
		current = current.parentElement
	}
	return null
}

function removeElement(container: HTMLElement, el: HTMLElement | null) {
	if (el && container.contains(el)) {
		container.removeChild(el)
	}
}

// double-clicks on the "W" bubble must not stack two translation paragraphs —
// a target with a request in flight is guarded until that request settles
const pendingTargets = new WeakSet<HTMLElement>()

// ---------------------------------------------------------------------------
// paragraph translation
//
// the translation used to be a clone inserted as a *sibling* of the paragraph.
// that put a node into the page framework's child list, which the framework
// neither knows about nor cleans up — a re-render left the stale translation
// behind — and it tagged a framework-owned element with a class the framework
// overwrote on its next render. it now renders into an element wordwise owns,
// positioned under the paragraph, so the page's tree is never touched.
// only one translation is kept: it is a reading aid for the paragraph under the
// pointer, not something to accumulate down the page.
// ---------------------------------------------------------------------------

let translationEl: HTMLDivElement | null = null
let translationTarget: HTMLElement | null = null

function ensureTranslationElement() {
	if (!translationEl) {
		translationEl = document.createElement("div")
		translationEl.className = "word-wise-typography-translation"
	}
	return translationEl
}

// the card has to be opaque or the text underneath shows through, and asking
// the page for its own background stops it turning into a white slab on a dark
// site; ancestors are walked because paragraphs are usually transparent
function getEffectiveBackgroundColor(element: HTMLElement) {
	let current: HTMLElement | null = element
	while (current) {
		const color = window.getComputedStyle(current).backgroundColor
		if (color && color !== "transparent" && color !== "rgba(0, 0, 0, 0)") {
			return color
		}
		current = current.parentElement
	}
	return "Canvas"
}

// absolute inside <body> rather than fixed: the translation then scrolls with
// the paragraph the way the in-flow clone did, with no scroll listener.
// coordinates are relative to body's own box because an absolutely positioned
// child is offset by body's margin
function positionTypographyTranslation(target: HTMLElement) {
	const el = ensureTranslationElement()
	if (!document.body) {
		return
	}
	const rect = target.getBoundingClientRect()
	const bodyRect = document.body.getBoundingClientRect()
	const style = window.getComputedStyle(target)

	el.style.top = `${rect.bottom - bodyRect.top + 2}px`
	el.style.left = `${rect.left - bodyRect.left}px`
	el.style.width = `${rect.width}px`
	el.style.backgroundColor = getEffectiveBackgroundColor(target)
	// fades the text without fading the background behind it, which opacity on
	// the card itself would do
	el.style.color = `color-mix(in srgb, ${style.color} 65%, transparent)`
}

function renderTypographyTranslation(target: HTMLElement, text: string) {
	const el = ensureTranslationElement()
	if (!document.body) {
		return
	}

	// textContent, not innerHTML: this is machine output
	el.textContent = text
	positionTypographyTranslation(target)
	translationTarget = target

	if (!el.isConnected) {
		document.body.appendChild(el)
	}
}

// the paragraph can be swapped out by the page at any time; the translation
// would otherwise sit under a rectangle that no longer holds text
function dropStaleTypographyTranslation() {
	if (translationEl?.isConnected && !translationTarget?.isConnected) {
		translationEl.remove()
		translationTarget = null
	}
}

// the card cannot reflow the page, so it necessarily covers whatever follows
// the paragraph (a tweet's action bar, say). it is therefore disposable: any
// click and any scroll puts it away, which bounds how long it can sit over
// something the user might want. it accepts no pointer events, so the click
// that dismisses it still reaches the page
function dropTypographyTranslation() {
	if (translationEl?.isConnected) {
		translationEl.remove()
		translationTarget = null
	}
}

async function onTranslateTypography(target: HTMLElement) {
	if (pendingTargets.has(target)) {
		return
	}
	pendingTargets.add(target)

	try {
		// no clone any more: the hover bubble and range box live on <body>, so
		// the paragraph's own text is already clean
		const text = target.textContent?.trim()
		if (!text) {
			return
		}

		const bgs = createBackgroundMessage()
		const result = await bgs.fetchTranslate({ text, provider: "deepL" })

		// the paragraph can be re-rendered or removed while the request is in
		// flight; rendering under a dead rectangle would be worse than nothing
		if (!target.isConnected) {
			return
		}

		renderTypographyTranslation(target, result)
	} catch (error) {
		// nothing was rendered, the original paragraph stays readable
		console.error("wordwise: paragraph translation failed", error)
	} finally {
		pendingTargets.delete(target)
	}
}

let globalTranslatorElement: HTMLDivElement | null = null
function createTypographyTranslatorElement({
	left,
	top,
}: {
	top: number
	left: number
}) {
	let el = globalTranslatorElement
	if (!el) {
		el = globalTranslatorElement = document.createElement("div")
		el.className = "word-wise-typography-hover"
		el.appendChild(document.createTextNode("W"))
	}

	el.style.top = `${top}px`
	el.style.left = `${left}px`
	return el
}

let globalTranslatorRangeElement: HTMLDivElement | null = null
function createTypographyTranslatorRangeElement(target: HTMLElement) {
	let el = globalTranslatorRangeElement
	if (!el) {
		el = globalTranslatorRangeElement = document.createElement("div")
		el.className = "word-wise-typography-range"
	}

	const { top, left, width, height } = target.getBoundingClientRect()
	el.style.top = `${top}px`
	el.style.left = `${left}px`
	el.style.width = `${width}px`
	el.style.height = `${height}px`
	return el
}

// Only one hover session is alive at a time. Teardown removes elements,
// cancels timers and unbinds the mouseout listener atomically, so rapid moves
// can't stack stale listeners/timers on old targets (and no leaked references).
let endActiveHoverSession: (() => void) | null = null

function showTypographyTranslatorElement(
	target: HTMLElement,
	{ clientX, clientY }: { clientX: number; clientY: number },
) {
	endActiveHoverSession?.()

	const typographyTranslatorEl = createTypographyTranslatorElement({
		top: clientY + 10,
		left: clientX + 10,
	})
	const typographyTranslatorRangeEl =
		createTypographyTranslatorRangeElement(target)

	document.body.appendChild(typographyTranslatorEl)
	document.body.appendChild(typographyTranslatorRangeEl)

	typographyTranslatorEl.onclick = () => {
		onTranslateTypography(target)
	}

	let ended = false
	const hide = debounce(() => {
		ended = true
		removeElement(document.body, typographyTranslatorEl)
		removeElement(document.body, typographyTranslatorRangeEl)
		target.removeEventListener("mouseout", onMouseOut)
		endActiveHoverSession = null
	}, 500)

	const onMouseOut = () => hide()
	target.addEventListener("mouseout", onMouseOut)

	const autoHideTimer = setTimeout(hide, 3000)

	endActiveHoverSession = () => {
		if (ended) {
			return
		}
		clearTimeout(autoHideTimer)
		hide.cancel()
		ended = true
		removeElement(document.body, typographyTranslatorEl)
		removeElement(document.body, typographyTranslatorRangeEl)
		target.removeEventListener("mouseout", onMouseOut)
	}
}

function onTypographyMove(e: MouseEvent) {
	const { clientX, clientY } = e
	const currentEl = document.elementFromPoint(clientX, clientY)
	if (!currentEl) {
		return
	}

	const target = getParagraphTarget(currentEl as HTMLElement)
	if (!target) {
		return
	}

	const text = target.textContent?.trim()
	if (!text) {
		return
	}

	if (!/\s/.test(text)) {
		return
	}

	// no "already translated" guard is needed any more: the translation is not
	// inserted into the paragraph, so nothing about it can be mistaken for page
	// content, and asking for it again simply refreshes it
	showTypographyTranslatorElement(target, { clientX, clientY })
}

function scrollToRemoveExtraElement() {
	endActiveHoverSession?.()
	dropStaleTypographyTranslation()
}

export default defineContentScript({
	matches: ["<all_urls>"],
	runAt: "document_end",
	cssInjectionMode: "manifest",
	main: async () => {
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

			// maxWait keeps continuous mouse movement from postponing the hover
			// indicator forever
			document.addEventListener(
				"mousemove",
				debounce(onTypographyMove, 500, { maxWait: 1000 }),
			)
			// capture, because scroll does not bubble: without it a scroll inside
			// a nested scroller (a timeline column, a modal) leaves both the hover
			// indicators and the translation card stranded over stale content
			document.addEventListener(
				"scroll",
				throttle(scrollToRemoveExtraElement, 500),
				true,
			)
			document.addEventListener("mousedown", dropTypographyTranslation, true)
		}

		// logging in on the sidebar enables this page without a reload
		onBackgroundMessage("userChanged", () => init())
		await init()
	},
})
