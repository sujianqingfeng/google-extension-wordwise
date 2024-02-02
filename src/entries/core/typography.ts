// text typography

import { CUSTOM_EVENT_TYPE } from '../../constants'
import { debounce } from '../../utils'

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

export function typography() {
  document.addEventListener('mousemove', debounce(onTypographyMousemove, 500))
}

function onTypographyMousemove(e: MouseEvent) {
  const el = document.elementFromPoint(e.clientX, e.clientY)
  if (!el) {
    return
  }

  if (!TEXT_TAGS.includes(el.tagName.toLowerCase())) {
    return
  }

  const text = el.textContent?.trim()
  if (!text) {
    return
  }

  if (!/\s/.test(text)) {
    return
  }

  const target = el as HTMLElement
  if (target.dataset.wordWise) {
    return
  }

  const isTranslated = target.querySelector('.word-wise-typography-translation')
  if (isTranslated) {
    return
  }

  if (target.classList.contains('word-wise-typography-translation')) {
    return
  }

  document.dispatchEvent(
    new CustomEvent(CUSTOM_EVENT_TYPE.TYPOGRAPHY_HOVER, {
      detail: {
        target: target
      }
    })
  )
}
