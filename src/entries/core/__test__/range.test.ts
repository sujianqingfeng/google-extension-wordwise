import { describe, expect, test } from "vitest"
import {
	collectCandidateElements,
	findWordAtOffset,
	isOwnNode,
	matchWordsIndices,
} from "../range"

// marking is painted through the CSS Custom Highlight API and the click path is
// resolved by caret hit-testing — both need a real layout engine, so they are
// covered by the browser suite (e2e/run.mjs). everything below is the pure
// logic those paths are built on.

function fakeElement(options: { own?: boolean } = {}) {
	return {
		closest: (selector: string) => (options.own ? selector : null),
		nodeType: 1,
	}
}

describe("matchWordsIndices", () => {
	test("finds every occurrence in order", () => {
		const text = "hello word, hello world, word hello"
		const indices = matchWordsIndices(text, ["hello", "word"])
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

describe("findWordAtOffset", () => {
	const words = ["hello", "world"]

	test("an offset inside a word resolves to that word", () => {
		expect(findWordAtOffset("say hello now", 5, words)).toEqual({
			word: "hello",
			start: 4,
		})
	})

	test("the first and last offset of a word both count as hits", () => {
		// 4 is the word's first character, 8 its last
		expect(findWordAtOffset("say hello now", 4, words)?.word).toBe("hello")
		expect(findWordAtOffset("say hello now", 8, words)?.word).toBe("hello")
	})

	test("the offset just past a word still hits it", () => {
		// caretPositionFromPoint rounds to the nearest boundary, so a click on
		// the right half of the last glyph reports the offset after the word
		expect(findWordAtOffset("say hello now", 9, words)?.word).toBe("hello")
	})

	test("an offset in plain text is not a hit", () => {
		expect(findWordAtOffset("say hello now", 1, words)).toBeNull()
		// offset 0 has no preceding offset to probe
		expect(findWordAtOffset("nomatch here", 0, words)).toBeNull()
	})

	test("no words means no hits", () => {
		expect(findWordAtOffset("say hello now", 5, [])).toBeNull()
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
