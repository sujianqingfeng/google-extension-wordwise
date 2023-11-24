import { ENABLE_TAG_ELEMENTS, EXCLUDE_TAG_ELEMENTS } from '../constants'

export function rangeWords(words: string[]) {
  console.log('🚀 ~ file: range.ts:4 ~ rangeWords ~ rangeWords:', words)
  const textContent = document.body.textContent
  if (textContent === null) {
    return
  }
  const filterWords = filterWordsFromText(words, textContent)
  idleRange(filterWords)
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

export function matchWordsIndex(text: string, words: string[]) {
  const re = generateWordsPattern(words)
  let match

  while ((match = re.exec(text)) !== null) {
    const word = match[0]
    const index = match.index
    return {
      word,
      start: index
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
  options: TraverseElementsOptions
) {
  const { thresholdHeight, traverse } = options

  for (const element of elements) {
    const exclude = isExcludeElement(element.tagName)
    if (exclude) {
      continue
    }
    const children = Array.from(element.children)
    const clientHeigh = element.clientHeight
    if (thresholdHeight >= clientHeigh) {
      traverse(element)
    } else if (children.length) {
      traverseElements(children, options)
    }
  }
}

function isExcludeElement(tagName: string) {
  return EXCLUDE_TAG_ELEMENTS.includes(tagName.toLowerCase())
}

export function maskWordsInElement(ele: Element, words: string[]) {
  console.log('🚀 ~ file: range.ts:85 ~ maskWordsInElement ~ words:', words)
  const treeWalker = document.createTreeWalker(
    ele,
    NodeFilter.SHOW_TEXT,
    (node) => {
      // no text content
      if (!node.textContent) {
        return NodeFilter.FILTER_REJECT
      }

      const parentElement = node.parentElement
      // exclude some elements
      if (parentElement && isExcludeElement(parentElement.tagName)) {
        return NodeFilter.FILTER_REJECT
      }

      // not mask word wise element
      const hasWordWise = parentElement?.dataset.wordWise
      if (hasWordWise) {
        return NodeFilter.FILTER_REJECT
      }

      const matchedWords = filterWordsFromText(words, node.textContent)
      if (!matchedWords.length) {
        return NodeFilter.FILTER_REJECT
      }

      return NodeFilter.FILTER_ACCEPT
    }
  )

  const currentNode = treeWalker.nextNode()
  console.log(
    '🚀 ~ file: range.ts:137 ~ maskWordsInElement ~ currentNode:',
    currentNode
  )
  if (!currentNode) {
    return
  }

  const t = currentNode.textContent!

  const matchedWords = filterWordsFromText(words, t)
  if (!matchedWords.length) {
    return
  }

  const index = matchWordsIndex(t, matchedWords)
  if (!index) {
    return
  }

  const { word, start } = index
  const range = new Range()
  range.setStart(currentNode, start)
  range.setEnd(currentNode, start + word.length)

  const strong = document.createElement('span')
  strong.className = 'word-wise-mask'
  strong.dataset.word = word
  strong.dataset.wordWise = 'true'
  range.surroundContents(strong)

  maskWordsInElement(ele, words)
}

function idleRange(filterWords: string[]) {
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
        const words = filterWordsFromText(filterWords, text)
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
