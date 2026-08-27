import { EXCLUDE_TAG_ELEMENTS } from "@/constants"
import { createBackgroundMessage } from "@/messaging/background"
import "./core/typography.css"
import { throttle } from "@/utils"

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

async function onTranslateTypography(target: HTMLElement) {
	const cloneTargetEl = target.cloneNode(true) as HTMLElement
	const hoverEls = cloneTargetEl.querySelectorAll(".word-wise-typography-hover")
	for (const el of hoverEls) {
		el.remove()
	}

	const text = cloneTargetEl.textContent?.trim()
	if (!text) {
		return
	}

	const parent = target.parentElement
	if (!parent) {
		return
	}

	const bgs = createBackgroundMessage()
	const result = await bgs.fetchTranslate({ text, provider: "deepL" })

	target.classList.add("word-wise-typography-original")
	cloneTargetEl.classList.add("word-wise-typography-translation")
	cloneTargetEl.textContent = result
	parent.insertBefore(cloneTargetEl, target.nextSibling)
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

	const isTranslated = target.querySelector(".word-wise-typography-translation")
	if (isTranslated) {
		return
	}

	if (
		target.classList.contains("word-wise-typography-translation") ||
		target.classList.contains("word-wise-typography-original")
	) {
		return
	}

	showTypographyTranslatorElement(target, { clientX, clientY })
}

function scrollToRemoveExtraElement() {
	endActiveHoverSession?.()
}

export default defineContentScript({
	matches: ["<all_urls>"],
	runAt: "document_end",
	cssInjectionMode: "manifest",
	main: async () => {
		const bgs = createBackgroundMessage()
		const user = await bgs.getUser()

		if (!user) {
			return
		}

		document.addEventListener("mousemove", debounce(onTypographyMove, 500))
		document.addEventListener(
			"scroll",
			throttle(scrollToRemoveExtraElement, 500),
		)
	},
})
