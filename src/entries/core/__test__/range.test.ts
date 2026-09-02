import { describe, expect, test } from "vitest"
import {
	collectCandidateElements,
	isOwnNode,
	matchWordsIndices,
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
