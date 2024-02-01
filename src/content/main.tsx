import { createWindowSelection } from './events'
import Query, { QueryProps } from '../entries/query/Query'
import { maskWordsInElement, rangeWords } from './range'
import {
  appendChildToBody,
  createRootRender,
  createTypographyHoverElement,
  removeChildFromBody
} from './root'
import { createContentRpc } from './rpc'
import Side from './Side'
import '../index.css'
import { typography } from './typography'
import { fetchTranslateApi } from '../api'
import {
  CONTENT_MESSAGE_TYPE,
  QUERY_ROOT_ID,
  QUERY_PANEL_WIDTH,
  SIDE_ROOT_ID,
  CUSTOM_EVENT_TYPE
} from '../constants'
import { Context, MaskClickEventDetail } from '../types'
import { debounce } from '../utils'
import { breakChar, isEnglishText } from '../utils/text'

let currenQueryWordEl: HTMLElement | null = null

const sideRender = createRootRender(SIDE_ROOT_ID)
const queryRender = createRootRender(QUERY_ROOT_ID)

const showSidebar = () => {
  if (sideRender.isShowing) {
    sideRender.removeFromBody()
  } else {
    sideRender.rootRender(
      <Side removeSide={() => sideRender.removeFromBody()} />
    )
    sideRender.appendToBody()
  }
}

const showQueryPanel = (queryProps?: Omit<QueryProps, 'removeQueryPanel'>) => {
  queryRender.rootRender(
    <Query {...queryProps} removeQueryPanel={queryRender.removeFromBody} />
  )
  queryRender.appendToBody()
}

// window selection change
const onSelectionChange = (context: Context) => {
  if (!context.isPressedAlt) {
    return
  }

  const selection = window.getSelection()
  if (!selection) {
    return
  }

  const selectionText = selection.toString().trim()
  if (!selectionText) {
    return
  }

  if (!isEnglishText(selectionText)) {
    return
  }

  const range = selection.getRangeAt(0)

  // no operation when the selection is in the query panel
  const parentElement = range.commonAncestorContainer.parentElement

  if (queryRender.el.contains(parentElement)) {
    return
  }
  currenQueryWordEl = parentElement

  const rect = range.getBoundingClientRect()

  queryRender.removeFromBody()
  showQueryPanel({
    text: selectionText,
    triggerRect: rect
  })
}

const appendCss = async () => {
  const { default: defaultCss } = await import('./main.css?inline')
  const style = document.createElement('style')

  style.textContent = defaultCss
  document.body.appendChild(style)
}

function pickupWordMousemove(context: Context, event: MouseEvent) {
  {
    if (context.isSelecting || !context.isPressedAlt) {
      return
    }

    // 获取鼠标位置
    const mouseX = event.clientX
    const mouseY = event.clientY

    const range = document.caretRangeFromPoint(mouseX, mouseY)
    if (!range) {
      return
    }
    // console.log('🚀 ~ range:', range, range?.startOffset)
    const textNode = range.startContainer

    if (queryRender.el.contains(textNode)) {
      return
    }

    if (textNode.nodeType !== Node.TEXT_NODE) {
      return
    }

    const text = textNode.textContent || ''

    if (!isEnglishText(text)) {
      return
    }

    const offset = range.startOffset

    const currentChar = text[offset]
    // console.log('🚀 ~ debounceMouseout ~ currentChar:', currentChar)
    if (currentChar === ' ' || currentChar === undefined) {
      return
    }

    let l = offset,
      r = offset

    for (let i = 0; i < offset; i++) {
      l -= 1
      const char = text[l]
      if (breakChar(char)) {
        l += 1
        break
      }
    }

    for (let i = 0; i < text.length - offset; i++) {
      r += 1
      const char = text[r]
      if (breakChar(char)) {
        break
      }
    }

    const currentWord = text.slice(l, r)
    // console.log('🚀 ~ currentWord:', currentWord)

    const textRange = document.createRange()
    textRange.setStart(textNode, l)
    textRange.setEnd(textNode, r)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(textRange)

    const rect = textRange.getBoundingClientRect()

    queryRender.removeFromBody()
    showQueryPanel({
      text: currentWord,
      triggerRect: rect
    })
  }
}

let currentPressedKeyEvent: KeyboardEvent | null = null
async function start() {
  document.addEventListener('keydown', (e) => {
    currentPressedKeyEvent = e
    if (e.key === 'Escape') {
      queryRender.removeFromBody()
    } else if (e.key === 't' && e.altKey) {
      if (document.body.contains(queryRender.el)) {
        queryRender.removeFromBody(false)
      } else {
        showQueryPanel({
          top: 100,
          left: document.body.clientWidth / 2 - QUERY_PANEL_WIDTH / 2,
          autoFocus: true,
          showSearch: true,
          text: ''
        })
      }
    }
  })

  document.addEventListener('keyup', (e) => {
    if (currentPressedKeyEvent === null) {
      return
    }
    if (e.key === currentPressedKeyEvent.key) {
      currentPressedKeyEvent = null
    }
  })

  appendCss()

  requestIdleCallback(() => {
    typography()
  })

  const context: Context = {
    get isSelecting() {
      return windowSelectionInstance.isSelecting
    },
    get isPressedAlt() {
      return currentPressedKeyEvent?.altKey || false
    }
  }

  const windowSelectionInstance = createWindowSelection()
  windowSelectionInstance.onSelectionChange(
    onSelectionChange.bind(null, context)
  )

  const debouncePickupWordMousemove = debounce(
    pickupWordMousemove.bind(null, context),
    500
  )
  document.addEventListener('mousemove', debouncePickupWordMousemove)

  const words = await rpc.getWords()

  if (words.length) {
    const stringWords = words.map((item) => item.word)
    requestIdleCallback(() => {
      rangeWords(stringWords)
    })
  }
}

document.addEventListener(CUSTOM_EVENT_TYPE.RANGE_WORDS, (e: any) => {
  const words = e.detail as string[]
  if (currenQueryWordEl) {
    maskWordsInElement(currenQueryWordEl, words)
  }
})

// listen mask click event
document.addEventListener(CUSTOM_EVENT_TYPE.MASK_CLICK_EVENT, (e: any) => {
  const { word, rect } = e.detail as MaskClickEventDetail
  queryRender.removeFromBody()
  showQueryPanel({
    text: word,
    triggerRect: rect
  })
})

// typography hover
let typographyHoverEl: HTMLDivElement | null = null
let typographyTarget: HTMLElement | null = null
async function typographyElClick() {
  if (!typographyTarget) {
    return
  }

  const [isOk, data] = await fetchTranslateApi({
    text: typographyTarget.innerText
  })

  if (!isOk) {
    return
  }
  const { result } = data
  const translationEl = document.createElement('div')
  translationEl.innerHTML = `<div class='word-wise-typography-translation'>${result}</div>`
  typographyTarget.appendChild(translationEl)
}

document.addEventListener(CUSTOM_EVENT_TYPE.TYPOGRAPHY_HOVER, (e: any) => {
  const { target } = e.detail as { target: HTMLElement }
  if (typographyHoverEl === null) {
    typographyHoverEl = createTypographyHoverElement()
  }
  const scrollDistance =
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop

  const rect = target.getBoundingClientRect()
  const top = rect.y + target.clientHeight + scrollDistance - 26
  const left = target.offsetLeft + target.clientWidth

  typographyHoverEl.style.top = `${top}px`
  typographyHoverEl.style.left = `${left}px`

  typographyTarget = target
  typographyHoverEl.removeEventListener('click', typographyElClick)
  typographyHoverEl.addEventListener('click', typographyElClick)

  appendChildToBody(typographyHoverEl)
  const mouseoutCallback = () => {
    if (typographyHoverEl) {
      removeChildFromBody(typographyHoverEl)
    }
  }
  const debounceMouseout = debounce(mouseoutCallback, 500)
  target.addEventListener('mouseout', debounceMouseout)
  typographyHoverEl.addEventListener('mouseout', debounceMouseout)
  typographyHoverEl.addEventListener('mouseover', debounceMouseout.cancel)
  target.addEventListener('mouseover', debounceMouseout.cancel)
})

// listen background message
chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case CONTENT_MESSAGE_TYPE.SHOW_SIDEBAR:
      showSidebar()
      break
  }
})

const rpc = createContentRpc()

async function main() {
  const isLogin = await rpc.getIsLogin()
  if (isLogin) {
    start()
  }
}

main()
