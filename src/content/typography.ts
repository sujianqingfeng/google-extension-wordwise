// text typography

import { CUSTOM_EVENT_TYPE } from '../constants'

const TEXT_TAGS = [
  'p',
  'div',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'main',
  'article',
  'section',
  'figure'
]
const REJECT_TAGS = ['a', 'button', 'pre']

export function typography() {
  console.log('🚀 ~ file: typography.ts:4 ~ typography ~ typography:')
  const body = document.body

  const treeWalker = document.createTreeWalker(
    body,
    NodeFilter.SHOW_ELEMENT,
    (node) => {
      const el = node as HTMLElement
      // console.log('🚀 ~ file: typography.ts:27 ~ typography ~ el:', el)

      if (TEXT_TAGS.includes(el.tagName.toLowerCase())) {
        // el.children
        if (el.children.length > 0) {
          const reject = Array.from(el.children).every((el) => {
            return REJECT_TAGS.includes(el.tagName.toLowerCase())
          })
          if (reject) {
            return NodeFilter.FILTER_REJECT
          }

          const skip = Array.from(el.children).some((el) => {
            return TEXT_TAGS.includes(el.tagName.toLowerCase())
          })
          if (skip) {
            return NodeFilter.FILTER_SKIP
          }
        }

        const text = el.textContent?.trim()
        // no text content
        if (!text) {
          return NodeFilter.FILTER_REJECT
        }

        // no space
        if (!/\s/.test(text)) {
          return NodeFilter.FILTER_REJECT
        }

        return NodeFilter.FILTER_ACCEPT
      }
      return NodeFilter.FILTER_REJECT
    }
  )

  while (treeWalker.nextNode()) {
    // console.log(
    //   '🚀 ~ file: typography.ts:26 ~ typography ~ currentNode:',
    //   treeWalker.currentNode
    // )
    treeWalker.currentNode.addEventListener('mouseover', (e) => {
      document.dispatchEvent(
        new CustomEvent(CUSTOM_EVENT_TYPE.TYPOGRAPHY_HOVER, {
          detail: {
            target: e.target
          }
        })
      )
    })
  }
}
