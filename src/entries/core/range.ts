import type { MaskClickEventDetail, WrapperElementOptions } from "@/types"
import { debounce } from "@/utils"
import {
	CUSTOM_EVENT_TYPE,
	ENABLE_TAG_ELEMENTS,
	EXCLUDE_TAG_ELEMENTS,
	MASK_CLASS_NAME,
	QUERY_ROOT_ID,
	SIDE_ROOT_ID,
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
	const valid = words.filter((word) => word.trim())
	return new RegExp(
		valid.length ? valid.map(wordToPattern).join("|") : "(?!)",
		"gi",
	)
}

// compiling is memoized on the array reference; activeWords keeps one
// reference between rangeWords calls, so the regex is built once per change
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

export function maskWordsInElement(ele: Element, words: string[]) {
	if (words.length === 0) {
		return
	}

	// single walk: collect matching text nodes first, then wrap each one —
	// wrapping mutates the tree, so it must not interleave with the walk
	const matchingNodes: Text[] = []
	const treeWalker = document.createTreeWalker(
		ele,
		NodeFilter.SHOW_TEXT,
		(node) => {
			const parentElement = node.parentElement
			// exclude some elements and already masked word wise elements
			if (
				parentElement &&
				(isExcludeElement(parentElement.tagName) ||
					parentElement.dataset.wordWise)
			) {
				return NodeFilter.FILTER_REJECT
			}

			const text = node.textContent
			if (!text || !getWordsRegex(words).test(text)) {
				return NodeFilter.FILTER_REJECT
			}

			return NodeFilter.FILTER_ACCEPT
		},
	)
	while (treeWalker.nextNode()) {
		matchingNodes.push(treeWalker.currentNode as Text)
	}

	for (const node of matchingNodes) {
		wrapMatchesInTextNode(node, words)
	}
}

// replaces the text node once with [text, wrapper, text, ...] fragments,
// covering all of its matches — the old per-match recursion re-walked the
// whole subtree for every single word
function wrapMatchesInTextNode(node: Text, words: string[]) {
	const text = node.textContent ?? ""
	const matches = matchWordsIndices(text, words)
	if (matches.length === 0) {
		return
	}

	const fragment = document.createDocumentFragment()
	let cursor = 0
	for (const { word, start } of matches) {
		if (start > cursor) {
			fragment.appendChild(document.createTextNode(text.slice(cursor, start)))
		}
		const wrapper = createWrapperElement({ word })
		wrapper.appendChild(document.createTextNode(word))
		fragment.appendChild(wrapper)
		cursor = start + word.length
	}
	if (cursor < text.length) {
		fragment.appendChild(document.createTextNode(text.slice(cursor)))
	}

	node.replaceWith(fragment)
}

function createWrapperElement({ word }: WrapperElementOptions) {
	const strong = document.createElement("span")
	strong.className = MASK_CLASS_NAME
	strong.dataset.word = word
	strong.dataset.wordWise = "true"
	return strong
}

// ---------------------------------------------------------------------------
// mask click interception
//
// a click on a masked word must belong to wordwise alone, otherwise the same
// click reaches the page's own handlers (React root, jQuery, inline onclick)
// or an <a> default navigation and the content behind the panel changes. the
// capture-phase delegate runs before every bubble listener and preventDefault
// cancels default actions, so opening the query panel never mutates the page.
// cmd+click is the escape hatch: it passes through untouched for following the
// link or triggering the page's own behavior.
// ---------------------------------------------------------------------------

const MASK_SELECTOR = `.${MASK_CLASS_NAME}`

export function onMaskClickCapture(e: MouseEvent) {
	if (e.metaKey) {
		return
	}
	const target = e.target as Element | null
	const mask = target?.closest?.<HTMLElement>(MASK_SELECTOR)
	if (!mask) {
		return
	}

	e.preventDefault()
	e.stopPropagation()

	const word = mask.dataset.word
	if (!word) {
		return
	}
	document.dispatchEvent(
		new CustomEvent<MaskClickEventDetail>(CUSTOM_EVENT_TYPE.MASK_CLICK_EVENT, {
			detail: {
				word,
				rect: mask.getBoundingClientRect(),
			},
		}),
	)
}

let maskClickInterceptorInstalled = false

function ensureMaskClickInterceptor() {
	if (maskClickInterceptorInstalled) {
		return
	}
	maskClickInterceptorInstalled = true
	// one delegated listener instead of one per wrapper: pages can carry
	// thousands of masks
	document.addEventListener("click", onMaskClickCapture, true)
}

// ---------------------------------------------------------------------------
// incremental masking
//
// SPA pages swap views without reloading: frameworks destroy the text nodes we
// wrapped and insert fresh ones, so a one-shot pass at document_end loses its
// marks on every route/layout change. The observers below keep feeding new
// content into the same lazy masking pipeline (traverse -> IntersectionObserver
// -> maskWordsInElement).
// ---------------------------------------------------------------------------

// wordwise-injected elements must never become mask candidates, otherwise the
// observer would feed on its own wrappers and on the query/sidebar/typography UI
// ([data-word-wise] covers every .word-wise-mask wrapper)
const OWN_CONTENT_SELECTOR = [
	"[data-word-wise]",
	".word-wise-typography-hover",
	".word-wise-typography-range",
	".word-wise-typography-translation",
	".word-wise-typography-original",
	`#${QUERY_ROOT_ID}`,
	`#${SIDE_ROOT_ID}`,
].join(",")

const NODE_ELEMENT_NODE = 1
const NODE_TEXT_NODE = 3

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
				// no pre-filter here: maskWordsInElement's walker rejects
				// non-matching text nodes immediately anyway
				maskWordsInElement(target, activeWords)
			}
		},
		// any visibility is enough: a block taller than the viewport can never
		// reach a higher threshold, so those would never mask
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

// SPA swaps render in batches; coalescing also merges our own wrapper
// insertions with the framework's mutations into one pass. maxWait keeps
// churning pages (editors, tickers) from postponing the flush forever
const flushCandidates = debounce(
	() => {
		const candidates = pendingCandidates
		pendingCandidates = null
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
			// framework reusing a text node in place (nodeValue update)
			const parent = mutation.target.parentElement
			if (parent) {
				addCandidate(parent)
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

	ensureMaskClickInterceptor()
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
