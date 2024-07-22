import { createBackgroundMessage } from "@/messaging/background"
import "./core/typography.css"

const TEXT_TAGS = [
	"p",
	"div",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"main",
	"article",
	"section",
	"figure",
	"li",
]

function removeElement(container: HTMLElement, el: HTMLElement) {
	if (container.contains(el)) {
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

function showTypographyTranslatorElement(
	target: HTMLElement,
	{ clientX, clientY }: { clientX: number; clientY: number },
) {
	const typographyTranslatorEl = createTypographyTranslatorElement({
		top: clientY + 10,
		left: clientX + 10,
	})
	const typographyTranslatorRangeEl =
		createTypographyTranslatorRangeElement(target)

	document.body.appendChild(typographyTranslatorEl)
	document.body.appendChild(typographyTranslatorRangeEl)

	const onTranslateTypographyClick = onTranslateTypography.bind(null, target)
	typographyTranslatorEl.addEventListener("click", onTranslateTypographyClick)

	const mouseOut = () => {
		typographyTranslatorEl.removeEventListener(
			"click",
			onTranslateTypographyClick,
		)
		removeElement(document.body, typographyTranslatorEl)
		removeElement(document.body, typographyTranslatorRangeEl)
		target.removeEventListener("mouseout", debounceMouseOut)
		target.removeEventListener("mouseover", debounceMouseOut.cancel)
	}

	const debounceMouseOut = debounce(mouseOut, 500)
	setTimeout(debounceMouseOut, 3000)
}

function onTypographyMove(e: MouseEvent) {
	const { clientX, clientY } = e
	const currentEl = document.elementFromPoint(clientX, clientY)
	if (!currentEl) {
		return
	}

	if (!TEXT_TAGS.includes(currentEl.tagName.toLowerCase())) {
		return
	}

	const hasExistTypographyChild = Array.from(currentEl.children).some((item) =>
		TEXT_TAGS.includes(item.tagName.toLowerCase()),
	)

	if (hasExistTypographyChild) {
		return
	}

	const text = currentEl.textContent?.trim()
	if (!text) {
		return
	}

	if (!/\s/.test(text)) {
		return
	}

	const target = currentEl as HTMLElement
	if (target.dataset.wordWise) {
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

export default defineContentScript({
	matches: ["<all_urls>"],
	runAt: "document_idle",
	cssInjectionMode: "manifest",
	main: async () => {
		const bgs = createBackgroundMessage()
		const user = await bgs.getUser()

		if (!user) {
			return
		}

		document.addEventListener("mousemove", debounce(onTypographyMove, 500))
		document.addEventListener("scroll", () => {
			globalTranslatorElement?.remove()
			globalTranslatorRangeElement?.remove()
		})
	},
})
