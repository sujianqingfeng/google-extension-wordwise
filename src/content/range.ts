import { ENABLE_TAG_ELEMENTS } from '../constants'
let globalWords: string[] = []

export function rangeWords(words: string[]) {
  console.log('🚀 ~ file: range.ts:4 ~ rangeWords ~ rangeWords:', words)
  globalWords = words
  requestIdleCallback(idleRange)
}

function getEnableElement(elements: Element[], { tags }: { tags: string[] }) {
  // TODO: walk
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

function maskWordInElement(ele: Element, word: string) {
  console.log('🚀 ~ file: range.ts:38 ~ maskWordInElement ~ ele:', ele)
  const text = ele.textContent
  console.log('🚀 ~ file: range.ts:39 ~ maskWordInElement ~ text:', text)

  const treeWalker = document.createTreeWalker(ele, NodeFilter.SHOW_TEXT)
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
    .filter((item) => item.text)
    .forEach(({ el, text }) => {
      const t = text!
      const indices = []
      let startPos = 0
      while (startPos < t.length) {
        const index = t.indexOf(word, startPos)
        if (index === -1) {
          break
        }
        indices.push(index)
        startPos = index + word.length
      }

      indices.forEach((index) => {
        const range = new Range()
        range.setStart(el, index)
        range.setEnd(el, index + word.length)
        const strong = document.createElement('strong')
        range.surroundContents(strong)
      })
    })
}

function idleRange() {
  const body = document.querySelector('body')
  if (!body) {
    return
  }
  // const enableElements = getEnableElement(Array.from(body.children), {
  //   tags: ENABLE_TAG_ELEMENTS
  // })

  const nodeIterator = document.createNodeIterator(
    body,
    NodeFilter.SHOW_TEXT,
    (node) => {
      if (node.textContent && node.textContent.trim()) {
        return NodeFilter.FILTER_ACCEPT
      }
      return NodeFilter.FILTER_REJECT
    }
  )

  let currentNode = nodeIterator.nextNode()
  while (currentNode) {
    console.log(
      '🚀 ~ file: range.ts:90 ~ idleRange ~ currentNode:',
      currentNode?.textContent
    )
    currentNode = nodeIterator.nextNode()
  }

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
        globalWords.forEach((word) => {
          if (text.includes(word)) {
            maskWordInElement(target, word)
          }
        })
      }
    })
  }

  const intersectionObserver = new IntersectionObserver(
    intersectionObserverCallback,
    {
      threshold: 0.5
    }
  )

  // const viewPortHeight = document.documentElement.clientHeight
  // traverseElements(enableElements, {
  //   thresholdHeight: viewPortHeight,
  //   traverse(ele) {
  //     intersectionObserver.observe(ele)
  //   }
  // })
}
