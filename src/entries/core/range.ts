import type { MaskClickEventDetail } from "@/types"
import { debounce, throttle } from "@/utils"
import {
	CUSTOM_EVENT_TYPE,
	ENABLE_TAG_ELEMENTS,
	EXCLUDE_TAG_ELEMENTS,
	HIGHLIGHT_NAME,
	MASK_HOVER_ATTR,
	QUERY_SHADOW_TAG_NAME,
	SIDEBAR_SHADOW_TAG_NAME,
} from "../../constants"

// words are user input; regex metacharacters ("c++", "c#") must not break or
// distort the pattern
function wordToPattern(word: string) {
	const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
	// \b only works against word characters — "c++" has a non-word tail, a
	// blanket \b wrapper would make it unmatchable
	const prefix = /^\w/.test(word) ? "\\b" : ""
	const suffix = /\w$/.test(word) ? "\\b" : ""
	return `${prefix}${escaped}${suffix}`
}

function buildWordsRegex(words: string[]) {
	// longest first: alternation takes the first branch matching at a position,
	// so "running" must be tried before "run" or only "run" gets masked
	const valid = words
		.filter((word) => word.trim())
		.sort((a, b) => b.length - a.length)
	return new RegExp(
		valid.length ? valid.map(wordToPattern).join("|") : "(?!)",
		"gi",
	)
}

// compiling is memoized on the array reference; activeWords keeps one
// reference between calls, so the regex is built once per change
let cachedWordsRef: string[] | null = null
let cachedWordsRegex: RegExp | null = null
function getWordsRegex(words: string[]) {
	if (words !== cachedWordsRef || !cachedWordsRegex) {
		cachedWordsRef = words
		cachedWordsRegex = buildWordsRegex(words)
	}
	// the shared /g regex is stateful (lastIndex); every scan starts fresh
	cachedWordsRegex.lastIndex = 0
	return cachedWordsRegex
}

type MatchWord = {
	word: string
	start: number
}
export function matchWordsIndices(text: string, words: string[]) {
	const re = getWordsRegex(words)
	const indices: MatchWord[] = []

	let match: RegExpExecArray | null = re.exec(text)
	while (match !== null) {
		indices.push({
			word: match[0],
			start: match.index,
		})
		match = re.exec(text)
	}

	return indices
}

// caret positions land on the boundary nearest the click, so a click in the
// right half of a word's last glyph reports the offset *after* it — probing the
// preceding offset too keeps that click on the word the user aimed at
export function findWordAtOffset(
	text: string,
	offset: number,
	words: string[],
) {
	for (const probe of offset > 0 ? [offset, offset - 1] : [offset]) {
		const hit = matchWordsIndices(text, words).find(
			(match) =>
				probe >= match.start && probe < match.start + match.word.length,
		)
		if (hit) {
			return hit
		}
	}
	return null
}

function getEnableElement(elements: Element[], { tags }: { tags: string[] }) {
	return elements.filter((element) => {
		const tagName = element.tagName.toLowerCase()
		return tags.includes(tagName)
	})
}

type TraverseElementsOptions = {
	thresholdHeight: number
	traverse: (ele: Element) => void
}
function traverseElements(
	elements: Element[],
	options: TraverseElementsOptions,
) {
	const { thresholdHeight, traverse } = options

	for (const element of elements) {
		const exclude = isExcludeElement(element.tagName)
		if (exclude) {
			continue
		}
		const children = Array.from(element.children)
		const clientHeigh = element.clientHeight
		// childless blocks taller than the viewport must still be traversed —
		// recursing is impossible and skipping them would drop the whole block
		if (thresholdHeight >= clientHeigh || children.length === 0) {
			traverse(element)
		} else {
			traverseElements(children, options)
		}
	}
}

function isExcludeElement(tagName: string) {
	return EXCLUDE_TAG_ELEMENTS.includes(tagName.toLowerCase())
}

// ---------------------------------------------------------------------------
// highlighting
//
// marks are painted through the CSS Custom Highlight API instead of wrapping
// each word in a <span>. wrapping swapped out text nodes the page framework had
// created and kept a live reference to, so React's own text updates were
// written into detached nodes (silently invisible) and any re-render that
// rebuilt a container wiped every wrapper inside it. a highlight is a plain
// Range over the existing text node: the page's DOM is never touched, so
// nothing the framework does can be broken by a mark, and no mark can be
// destroyed by a re-render — the ranges are simply recomputed after one.
// ---------------------------------------------------------------------------

const NODE_ELEMENT_NODE = 1
const NODE_TEXT_NODE = 3

function isHighlightSupported() {
	return (
		typeof globalThis.CSS !== "undefined" &&
		typeof CSS.highlights !== "undefined" &&
		typeof globalThis.Highlight !== "undefined"
	)
}

let highlight: Highlight | null = null
// registered ranges per text node; a Map (not a WeakMap) because the stale
// entries have to be swept when a node leaves the document
const textRanges = new Map<Text, Range[]>()

function getHighlight() {
	if (!highlight) {
		highlight = new Highlight()
		CSS.highlights.set(HIGHLIGHT_NAME, highlight)
	}
	return highlight
}

function clearTextNode(node: Text) {
	const ranges = textRanges.get(node)
	if (!ranges) {
		return
	}
	const target = getHighlight()
	for (const range of ranges) {
		target.delete(range)
	}
	textRanges.delete(node)
}

// idempotent by construction: the node's ranges are dropped and rebuilt from
// its current text, so re-running it after any mutation is always safe and no
// "already processed" marker is needed
export function applyToTextNode(node: Text) {
	if (!isHighlightSupported()) {
		return
	}
	clearTextNode(node)

	const text = node.nodeValue
	if (!text || !activeWords.length) {
		return
	}

	const matches = matchWordsIndices(text, activeWords)
	if (matches.length === 0) {
		return
	}

	const target = getHighlight()
	const ranges: Range[] = []
	for (const { word, start } of matches) {
		const end = start + word.length
		// a stale scan must never set an out-of-range boundary (throws)
		if (end > text.length) {
			continue
		}
		const range = new Range()
		range.setStart(node, start)
		range.setEnd(node, end)
		target.add(range)
		ranges.push(range)
	}
	if (ranges.length > 0) {
		textRanges.set(node, ranges)
	}
}

// wordwise's own output must never become a mark candidate. the query panel and
// the sidebar render into a shadow root, which a TreeWalker cannot enter — but
// their host elements are in the light DOM and are what elementFromPoint
// retargets a click inside them to, so they are named here as well
const OWN_CONTENT_SELECTOR = [
	QUERY_SHADOW_TAG_NAME,
	SIDEBAR_SHADOW_TAG_NAME,
	".word-wise-typography-hover",
	".word-wise-typography-range",
	".word-wise-typography-translation",
].join(",")

export function isOwnNode(node: Node) {
	const element =
		node.nodeType === NODE_TEXT_NODE ? node.parentElement : (node as Element)
	return !element || element.closest(OWN_CONTENT_SELECTOR) !== null
}

export function collectCandidateElements(nodes: Node[]) {
	const candidates: Element[] = []
	for (const node of nodes) {
		if (node.nodeType === NODE_ELEMENT_NODE) {
			candidates.push(node as Element)
		} else if (node.nodeType === NODE_TEXT_NODE) {
			const parent = node.parentElement
			if (parent) {
				candidates.push(parent)
			}
		}
	}
	return candidates
}

export function applyHighlightInElement(ele: Element) {
	if (!isHighlightSupported()) {
		return
	}

	const treeWalker = document.createTreeWalker(ele, NodeFilter.SHOW_TEXT, {
		acceptNode(node) {
			const parentElement = node.parentElement
			if (
				!parentElement ||
				isExcludeElement(parentElement.tagName) ||
				parentElement.closest(OWN_CONTENT_SELECTOR)
			) {
				return NodeFilter.FILTER_REJECT
			}
			return NodeFilter.FILTER_ACCEPT
		},
	})

	// collect first: applyToTextNode only reads, but keeping the walk separate
	// from the work lets a single walk serve every match in the subtree
	const nodes: Text[] = []
	while (treeWalker.nextNode()) {
		nodes.push(treeWalker.currentNode as Text)
	}
	for (const node of nodes) {
		applyToTextNode(node)
	}
}

// ranges hold strong references to their text nodes; nodes dropped by the
// framework would keep their subtrees alive forever without this sweep
function pruneDetachedTextNodes() {
	for (const node of Array.from(textRanges.keys())) {
		if (!node.isConnected) {
			clearTextNode(node)
		}
	}
}

// ---------------------------------------------------------------------------
// hit testing
//
// without wrapper elements there is nothing for closest() to find, so a point
// is resolved through the caret position at that point and matched against the
// same word regex the highlights were built from
// ---------------------------------------------------------------------------

type CaretPosition = { node: Text; offset: number }

function caretAtPoint(x: number, y: number): CaretPosition | null {
	const doc = document as Document & {
		caretPositionFromPoint?: (
			x: number,
			y: number,
		) => { offsetNode: Node; offset: number } | null
		caretRangeFromPoint?: (x: number, y: number) => Range | null
	}

	if (typeof doc.caretPositionFromPoint === "function") {
		const position = doc.caretPositionFromPoint(x, y)
		if (!position || position.offsetNode.nodeType !== NODE_TEXT_NODE) {
			return null
		}
		return { node: position.offsetNode as Text, offset: position.offset }
	}

	const range = doc.caretRangeFromPoint?.(x, y)
	if (!range || range.startContainer.nodeType !== NODE_TEXT_NODE) {
		return null
	}
	return { node: range.startContainer as Text, offset: range.startOffset }
}

export function wordRangeAtPoint(
	x: number,
	y: number,
): { word: string; range: Range } | null {
	if (!isHighlightSupported() || !activeWords.length) {
		return null
	}

	// the topmost element is what a click would actually reach (elementFromPoint
	// retargets into a shadow root to its host, the same element the click event
	// would carry), so wordwise's own panel is dismissed before hit-testing —
	// otherwise a click on the panel would resolve against whatever page text
	// sits underneath it
	const topmost = document.elementFromPoint(x, y)
	if (!topmost || isOwnNode(topmost)) {
		return null
	}

	const caret = caretAtPoint(x, y)
	if (!caret || isOwnNode(caret.node)) {
		return null
	}
	// marks only ever cover light-DOM text, so a caret that resolved inside some
	// shadow tree cannot be over one
	if (caret.node.getRootNode() !== document) {
		return null
	}

	const text = caret.node.nodeValue ?? ""
	const match = findWordAtOffset(text, caret.offset, activeWords)
	if (!match) {
		return null
	}

	const range = new Range()
	range.setStart(caret.node, match.start)
	range.setEnd(caret.node, match.start + match.word.length)
	return { word: match.word, range }
}

// ---------------------------------------------------------------------------
// click and hover behaviour
//
// a click on a marked word must belong to wordwise alone, otherwise the same
// click reaches the page's own handlers (React root, jQuery, inline onclick)
// or an <a> default navigation and the content behind the panel changes. the
// capture-phase delegate runs before every bubble listener and preventDefault
// cancels default actions, so opening the query panel never mutates the page.
// cmd+click is the escape hatch: it passes through untouched for following the
// link or triggering the page's own behavior.
// ---------------------------------------------------------------------------

export function onMaskClickCapture(e: MouseEvent) {
	if (e.metaKey) {
		return
	}
	const hit = wordRangeAtPoint(e.clientX, e.clientY)
	if (!hit) {
		return
	}

	e.preventDefault()
	e.stopPropagation()

	document.dispatchEvent(
		new CustomEvent<MaskClickEventDetail>(CUSTOM_EVENT_TYPE.MASK_CLICK_EVENT, {
			detail: {
				word: hit.word,
				rect: hit.range.getBoundingClientRect(),
			},
		}),
	)
}

// a highlight pseudo-element cannot carry `cursor`, so the pointer is applied
// to the host element under the cursor instead. the attribute is also what the
// query panel's outside-click check keys off, and it stays a plain attribute:
// frameworks neither manage nor remove it.
let hoveredElement: HTMLElement | null = null

function setHoveredElement(element: HTMLElement | null) {
	if (hoveredElement === element) {
		return
	}
	hoveredElement?.removeAttribute(MASK_HOVER_ATTR)
	element?.setAttribute(MASK_HOVER_ATTR, "")
	hoveredElement = element
}

function onPointerMove(e: MouseEvent) {
	if (!activeWords.length) {
		return
	}
	const hit = wordRangeAtPoint(e.clientX, e.clientY)
	setHoveredElement(hit ? hit.range.startContainer.parentElement : null)
}

let pointerHandlersInstalled = false

function ensurePointerHandlers() {
	if (pointerHandlersInstalled) {
		return
	}
	pointerHandlersInstalled = true
	ensureMaskClickInterceptor()
	// matching a word per mousemove runs the alternation regex, so the cursor
	// update is rate-limited; the attribute only changes when the host element
	// changes anyway
	document.addEventListener("mousemove", throttle(onPointerMove, 60))
	// mouseleave does not bubble, so it has to sit on the element actually left
	document.documentElement.addEventListener("mouseleave", () =>
		setHoveredElement(null),
	)
}

// ---------------------------------------------------------------------------
// incremental scanning
//
// SPA pages swap views without reloading: frameworks destroy the text nodes
// behind the marks and insert fresh ones, so a one-shot pass at document_end
// loses its marks on every route/layout change. the observers below keep
// feeding new content into the same lazy pipeline (traverse ->
// IntersectionObserver -> applyHighlightInElement).
// ---------------------------------------------------------------------------

let activeWords: string[] = []
let initialized = false
let intersectionObserver: IntersectionObserver | null = null
let mutationObserver: MutationObserver | null = null
let lastUrl: string | null = null

function getIntersectionObserver() {
	if (intersectionObserver) {
		return intersectionObserver
	}
	intersectionObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) {
					continue
				}
				// one pass per target; content that re-renders later re-enters
				// through the mutation observer
				const target = entry.target
				intersectionObserver?.unobserve(target)
				applyHighlightInElement(target)
			}
		},
		// any visibility is enough: a block taller than the viewport can never
		// reach a higher threshold, so those would never be marked
		{ threshold: 0 },
	)
	return intersectionObserver
}

function hasAnyWord(ele: Element) {
	return getWordsRegex(activeWords).test(ele.textContent ?? "")
}

function observeElements(elements: Element[]) {
	if (!elements.length) {
		return
	}
	const observer = getIntersectionObserver()
	const viewPortHeight = document.documentElement.clientHeight
	traverseElements(elements, {
		thresholdHeight: viewPortHeight,
		traverse(ele) {
			observer.observe(ele)
		},
	})
}

// initial pass and post-route rescan; the word gate keeps it free on pages
// without target words
function scanBody() {
	const body = document.body
	if (!body || !hasAnyWord(body)) {
		return
	}
	const enableElements = getEnableElement(Array.from(body.children), {
		tags: ENABLE_TAG_ELEMENTS,
	})
	observeElements(enableElements)
}

let pendingCandidates: Set<Element> | null = null

// SPA swaps render in batches; coalescing keeps the rescan off the render path.
// maxWait keeps churning pages (editors, tickers) from postponing the flush
// forever
const flushCandidates = debounce(
	() => {
		const candidates = pendingCandidates
		pendingCandidates = null
		pruneDetachedTextNodes()
		if (!candidates || !activeWords.length) {
			return
		}
		const fresh = Array.from(candidates).filter(
			(ele) => ele.isConnected && !isOwnNode(ele) && hasAnyWord(ele),
		)
		observeElements(fresh)
	},
	300,
	{ maxWait: 800 },
)

function addCandidate(ele: Element) {
	pendingCandidates ??= new Set()
	pendingCandidates.add(ele)
	flushCandidates()
}

function onDomMutations(mutations: MutationRecord[]) {
	if (!activeWords.length) {
		return
	}
	for (const mutation of mutations) {
		if (mutation.type === "childList") {
			const candidates = collectCandidateElements(
				Array.from(mutation.addedNodes),
			)
			for (const ele of candidates) {
				addCandidate(ele)
			}
		} else if (mutation.type === "characterData") {
			// framework reusing a text node in place (nodeValue update): the
			// ranges built from the old value no longer describe the text
			const target = mutation.target
			if (target.nodeType === NODE_TEXT_NODE) {
				applyToTextNode(target as Text)
			}
		}
	}
}

function ensureMutationObserver() {
	if (mutationObserver || !document.body) {
		return
	}
	mutationObserver = new MutationObserver(onDomMutations)
	mutationObserver.observe(document.body, {
		subtree: true,
		childList: true,
		characterData: true,
	})
}

// history.pushState is not observable from the isolated content-script world;
// popstate/hashchange still catch back/forward, while the mutation observer
// covers whatever a route swap renders
const scheduleScanBody = debounce(scanBody, 500)

function onUrlMaybeChanged() {
	if (lastUrl === null) {
		lastUrl = location.href
		return
	}
	if (location.href === lastUrl) {
		return
	}
	lastUrl = location.href
	scheduleScanBody()
}

function ensureUrlHooks() {
	window.addEventListener("popstate", onUrlMaybeChanged)
	window.addEventListener("hashchange", onUrlMaybeChanged)
}

export function rangeWords(words: string[]) {
	if (words.length === 0) {
		return
	}
	// mid-session additions (query panel) must not drop already-active words
	activeWords = Array.from(new Set([...activeWords, ...words]))

	ensurePointerHandlers()
	ensureMutationObserver()
	ensureUrlHooks()
	if (initialized) {
		// later additions rescan coalesced and off the click path; the
		// mutation observer picks up their effect on page content anyway
		scheduleScanBody()
		return
	}
	initialized = true
	scanBody()
}

let maskClickInterceptorInstalled = false

function ensureMaskClickInterceptor() {
	if (maskClickInterceptorInstalled) {
		return
	}
	maskClickInterceptorInstalled = true
	// one delegated listener instead of one per word: pages can carry
	// thousands of marks
	document.addEventListener("click", onMaskClickCapture, true)
}

// inverse of rangeWords: drops words from the active set and rebuilds the
// ranges of every text node already carrying marks, so masking stays reversible
// instead of only ever accumulating
export function unrangeWords(words: string[]) {
	if (words.length === 0) {
		return
	}
	const removed = new Set(words.map((word) => word.toLowerCase()))
	activeWords = activeWords.filter((word) => !removed.has(word.toLowerCase()))

	// only the nodes already marked need recomputing — a node that had no range
	// still has none, because the word set only ever shrinks here
	for (const node of Array.from(textRanges.keys())) {
		applyToTextNode(node)
	}
}
