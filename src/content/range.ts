import { ENABLE_TAG_ELEMENTS } from '../constants'

export function rangeWords(words: string[]) {
  console.log('🚀 ~ file: range.ts:4 ~ rangeWords ~ rangeWords:', words)
  requestIdleCallback(idleRange)
}

function getEnableElement(elements: Element[], { tags }: { tags: string[] }) {
  return elements.filter((element) => {
    const tagName = element.tagName.toLowerCase()
    return tags.includes(tagName)
  })
}

type TraverseElementsOptions = {
  thresholdHeight: number
}
function traverseElements(
  elements: Element[],
  options: TraverseElementsOptions
) {
  const { thresholdHeight } = options
  elements.forEach((element) => {
    const children = Array.from(element.children)
    console.log(
      '🚀 ~ file: range.ts:18 ~ elements.forEach ~ children:',
      children,
      element.className
    )
    const clientHeigh = element.clientHeight
    console.log(
      '🚀 ~ file: range.ts:24 ~ elements.forEach ~ clientHeigh:',
      clientHeigh
    )

    if (children.length) {
      traverseElements(children, options)
    } else {
      const text = element.textContent
      if (text) {
        console.log('🚀 ~ file: range.ts:30 ~ traverseElements ~ text:', text)
      }
    }
  })
}

function idleRange() {
  const body = document.querySelector('body')
  console.log('🚀 ~ file: range.ts:8 ~ idleRange ~ body:', body)
  if (!body) {
    return
  }
  const enableElements = getEnableElement(Array.from(body.children), {
    tags: ENABLE_TAG_ELEMENTS
  })
  console.log(
    '🚀 ~ file: range.ts:19 ~ idleRange ~ enableElements:',
    enableElements
  )
  const viewPortHeight = document.documentElement.clientHeight
  traverseElements(enableElements, {
    thresholdHeight: viewPortHeight
  })
}
