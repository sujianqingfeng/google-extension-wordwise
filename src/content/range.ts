import { ENABLE_TAG_ELEMENTS } from '../constants'
let globalWords: string[] = []

export function rangeWords(words: string[]) {
  console.log('🚀 ~ file: range.ts:4 ~ rangeWords ~ rangeWords:', words)
  const textContent = document.body.textContent
  if (textContent === null) {
    return
  }
  globalWords = filterWordsFromText(words, textContent)
  requestIdleCallback(idleRange)
}

function generateWordsPattern(words: string[]) {
  const wordsPattern = words.join('|')
  return new RegExp(`\\b(${wordsPattern})\\b`, 'gi')
}

function filterWordsFromText(words: string[], text: string) {
  const re = generateWordsPattern(words)
  let match: RegExpExecArray | null
  const matches: string[] = []
  while ((match = re.exec(text)) !== null) {
    const word = match[0]
    if (word && !matches.find((item) => item === word)) {
      matches.push(word)
    }
  }
  return matches
}

type MatchWord = {
  word: string
  start: number
}
export function matchWordsIndices(text: string, words: string[]) {
  const re = generateWordsPattern(words)
  let match
  const indices: MatchWord[] = []

  while ((match = re.exec(text)) !== null) {
    const word = match[0]
    const index = match.index
    indices.push({
      word,
      start: index
    })
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
  options: TraverseElementsOptions
) {
  const { thresholdHeight, traverse } = options
  elements.forEach((element) => {
    const children = Array.from(element.children)
    const clientHeigh = element.clientHeight
    if (thresholdHeight >= clientHeigh) {
      traverse(element)
    } else if (children.length) {
      traverseElements(children, options)
    }
  })
}

function maskWordsInElement(ele: Element, words: string[]) {
  console.log('🚀 ~ file: range.ts:85 ~ maskWordsInElement ~ words:', words)
  const treeWalker = document.createTreeWalker(
    ele,
    NodeFilter.SHOW_TEXT,
    (node) => {
      const parentElement = node.parentElement
      if (
        parentElement &&
        ['script', 'svg'].some(
          (tag) => parentElement.tagName.toLowerCase() === tag
        )
      ) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    }
  )
  const allTextNode: Node[] = []
  let currentNode = treeWalker.nextNode()
  while (currentNode) {
    allTextNode.push(currentNode)
    currentNode = treeWalker.nextNode()
  }

  allTextNode
    .map((el) => {
      return { el, text: el.textContent }
    })
    .filter(({ text, el }) => {
      const hasWordWise = el.parentElement?.dataset.wordWise
      return text && !hasWordWise
    })
    .forEach(({ el, text }) => {
      const t = text!
      const matchedWords = filterWordsFromText(words, t)
      if (!matchedWords.length) {
        return
      }

      console.log(
        '🚀 ~ file: range.ts:122 ~ .forEach ~ matchedWords:',
        matchedWords
      )
      const indices = matchWordsIndices(t, matchedWords)

      indices.forEach(({ word, start }) => {
        const range = new Range()
        range.setStart(el, start)
        range.setEnd(el, start + word.length)

        const strong = document.createElement('strong')
        strong.dataset.word = word
        strong.dataset.wordWise = 'true'
        range.surroundContents(strong)
      })
    })
}

function idleRange() {
  const body = document.querySelector('body')
  if (!body) {
    return
  }
  const enableElements = getEnableElement(Array.from(body.children), {
    tags: ENABLE_TAG_ELEMENTS
  })

  const intersectionObserverCallback = (
    entries: IntersectionObserverEntry[]
  ) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = entry.target
        const text = target.textContent
        if (!text) {
          return
        }
        const words = filterWordsFromText(globalWords, text)
        if (!words.length) {
          return
        }
        maskWordsInElement(target, words)
      }
    })
  }

  const intersectionObserver = new IntersectionObserver(
    intersectionObserverCallback,
    {
      threshold: 0.5
    }
  )

  const viewPortHeight = document.documentElement.clientHeight
  traverseElements(enableElements, {
    thresholdHeight: viewPortHeight,
    traverse(ele) {
      intersectionObserver.observe(ele)
    }
  })
}