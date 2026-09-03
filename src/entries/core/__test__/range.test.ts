import { afterEach, describe, expect, test, vi } from "vitest"
import { CUSTOM_EVENT_TYPE } from "@/constants"
import {
	collectCandidateElements,
	isOwnNode,
	matchWordsIndices,
	onMaskClickCapture,
	unrangeWords,
} from "../range"

function fakeElement(options: { own?: boolean } = {}) {
	return {
		closest: (selector: string) => (options.own ? selector : null),
		nodeType: 1,
	}
}

describe("range", () => {
	test("", () => {
		const text = "hello word, hello world, word hello"
		const words = ["hello", "word"]
		const indices = matchWordsIndices(text, words)
		expect(indices).toMatchInlineSnapshot(`
      [
        {
          "start": 0,
          "word": "hello",
        },
        {
          "start": 6,
          "word": "word",
        },
        {
          "start": 12,
          "word": "hello",
        },
        {
          "start": 25,
          "word": "word",
        },
        {
          "start": 30,
          "word": "hello",
        },
      ]
    `)
	})
})

describe("matchWordsIndices", () => {
	test("finds all matches case-insensitively", () => {
		expect(matchWordsIndices("Hello WORLD", ["hello", "world"])).toEqual([
			{ word: "Hello", start: 0 },
			{ word: "WORLD", start: 6 },
		])
	})

	test("repeated scans with the same word list reset regex state", () => {
		const words = ["hello"]
		expect(matchWordsIndices("say hello once", words)).toEqual([
			{ word: "hello", start: 4 },
		])
		// a shared /g regex would carry lastIndex over and miss this match
		expect(matchWordsIndices("hello again", words)).toEqual([
			{ word: "hello", start: 0 },
		])
	})

	test("regex metacharacters in words match literally", () => {
		expect(matchWordsIndices("learn c++ not c# today", ["c++", "c#"])).toEqual([
			{ word: "c++", start: 6 },
			{ word: "c#", start: 14 },
		])
	})

	test("empty word lists match nothing", () => {
		expect(matchWordsIndices("anything at all", [])).toEqual([])
	})

	test("a prefix word must not cut a longer word short", () => {
		// "c" ends in a word char but "c++" continues with a non-word char, so
		// the shorter branch's \b succeeds and swallows the match first —
		// branches must be ordered longest-first
		expect(matchWordsIndices("write c++ today", ["c", "c++"])).toEqual([
			{ word: "c++", start: 6 },
		])
	})

	test("a longer word wins even when listed after its prefix", () => {
		expect(matchWordsIndices("running fast", ["run", "running"])).toEqual([
			{ word: "running", start: 0 },
		])
	})
})

describe("collectCandidateElements", () => {
	test("element nodes become candidates directly", () => {
		const element = fakeElement()
		const candidates = collectCandidateElements([element as unknown as Node])
		expect(candidates).toHaveLength(1)
		expect(candidates[0]).toBe(element)
	})

	test("text nodes resolve to their parent element", () => {
		const parent = fakeElement()
		const textNode = {
			nodeType: 3,
			parentElement: parent,
		} as unknown as Node
		const candidates = collectCandidateElements([textNode])
		expect(candidates).toHaveLength(1)
		expect(candidates[0]).toBe(parent)
	})

	test("text nodes without a parent are skipped", () => {
		const textNode = { nodeType: 3, parentElement: null } as unknown as Node
		expect(collectCandidateElements([textNode])).toHaveLength(0)
	})

	test("other node types (comment, etc.) are skipped", () => {
		const comment = { nodeType: 8 } as unknown as Node
		expect(collectCandidateElements([comment])).toHaveLength(0)
	})
})

describe("isOwnNode", () => {
	test("elements inside wordwise content are own nodes", () => {
		const ownWrapper = fakeElement({ own: true })
		expect(isOwnNode(ownWrapper as unknown as Node)).toBe(true)
	})

	test("page elements are not own nodes", () => {
		const pageElement = fakeElement()
		expect(isOwnNode(pageElement as unknown as Node)).toBe(false)
	})

	test("text nodes inherit ownership from their parent", () => {
		const ownParent = fakeElement({ own: true })
		const textInOwn = {
			nodeType: 3,
			parentElement: ownParent,
		} as unknown as Node
		expect(isOwnNode(textInOwn)).toBe(true)

		const pageParent = fakeElement()
		const textInPage = {
			nodeType: 3,
			parentElement: pageParent,
		} as unknown as Node
		expect(isOwnNode(textInPage)).toBe(false)
	})

	test("detached text nodes are treated as own nodes", () => {
		const textNode = { nodeType: 3, parentElement: null } as unknown as Node
		expect(isOwnNode(textNode)).toBe(true)
	})
})

describe("onMaskClickCapture", () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	function makeMask(word = "hello") {
		const mask = {
			dataset: { word },
			getBoundingClientRect: () => ({ top: 10, left: 20 }),
			closest: (selector: string) =>
				selector === ".word-wise-mask" ? mask : null,
		}
		return mask
	}

	function makeEvent(overrides: { metaKey?: boolean; target?: unknown } = {}) {
		return {
			metaKey: false,
			preventDefault: vi.fn(),
			stopPropagation: vi.fn(),
			target: makeMask(),
			...overrides,
		} as unknown as MouseEvent
	}

	function stubDocument() {
		const dispatch = vi.fn()
		vi.stubGlobal("document", { dispatchEvent: dispatch })
		return dispatch
	}

	test("intercepts: swallows the click and dispatches the query event", () => {
		const dispatch = stubDocument()

		const e = makeEvent()
		onMaskClickCapture(e)

		// both are required: stopPropagation starves page bubble handlers,
		// preventDefault cancels <a> navigation
		expect(e.preventDefault).toHaveBeenCalled()
		expect(e.stopPropagation).toHaveBeenCalled()
		expect(dispatch).toHaveBeenCalledTimes(1)
		const event = dispatch.mock.calls[0][0]
		expect(event.type).toBe(CUSTOM_EVENT_TYPE.MASK_CLICK_EVENT)
		expect(event.detail.word).toBe("hello")
	})

	test("cmd+click passes through untouched so the page keeps its click", () => {
		const dispatch = stubDocument()

		const e = makeEvent({ metaKey: true })
		onMaskClickCapture(e)

		expect(e.preventDefault).not.toHaveBeenCalled()
		expect(e.stopPropagation).not.toHaveBeenCalled()
		expect(dispatch).not.toHaveBeenCalled()
	})

	test("clicks outside masks are ignored", () => {
		const dispatch = stubDocument()

		const e = makeEvent({ target: { closest: () => null } })
		onMaskClickCapture(e)

		expect(e.preventDefault).not.toHaveBeenCalled()
		expect(e.stopPropagation).not.toHaveBeenCalled()
		expect(dispatch).not.toHaveBeenCalled()
	})

	test("a mask without a word is swallowed but dispatches nothing", () => {
		const dispatch = stubDocument()

		const e = makeEvent({ target: makeMask("") })
		onMaskClickCapture(e)

		expect(e.preventDefault).toHaveBeenCalled()
		expect(dispatch).not.toHaveBeenCalled()
	})
})

describe("unrangeWords", () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	function makeMask(word: string) {
		const parent = { normalize: vi.fn() }
		const mask = {
			dataset: { word },
			textContent: word,
			parentNode: parent,
			replaceWith: vi.fn(),
		}
		return { mask, parent }
	}

	function stubMasks(...masks: ReturnType<typeof makeMask>[]) {
		vi.stubGlobal("document", {
			createTextNode: (text: string) => ({ textContent: text }),
			querySelectorAll: vi.fn(() => masks.map(({ mask }) => mask)),
		})
	}

	test("unwraps matching masks case-insensitively and normalizes only their parents", () => {
		const kept = makeMask("hello")
		const removed = makeMask("World")
		stubMasks(kept, removed)

		unrangeWords(["world"])

		// the wrapper is replaced by a plain text node, and the parent's split
		// text fragments are merged so future scans see whole words again
		expect(removed.mask.replaceWith).toHaveBeenCalledTimes(1)
		expect(removed.parent.normalize).toHaveBeenCalledTimes(1)
		expect(kept.mask.replaceWith).not.toHaveBeenCalled()
		expect(kept.parent.normalize).not.toHaveBeenCalled()
	})

	test("masks of other words are left untouched", () => {
		const other = makeMask("river")
		stubMasks(other)

		unrangeWords(["mountain"])

		expect(other.mask.replaceWith).not.toHaveBeenCalled()
		expect(other.parent.normalize).not.toHaveBeenCalled()
	})

	test("empty word list is a no-op", () => {
		const mask = makeMask("hello")
		stubMasks(mask)

		unrangeWords([])

		expect(mask.mask.replaceWith).not.toHaveBeenCalled()
	})
})
