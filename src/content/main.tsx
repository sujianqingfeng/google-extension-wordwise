import { keyboard, windowSelectionChange } from './events'
import Query, { QueryProps } from './Query'
import { maskWordsInElement, rangeWords } from './range'
import { createRootRender } from './root'
import { createContentRpc } from './rpc'
import Side from './Side'
import '../index.css'
import {
  CONTENT_MESSAGE_TYPE,
  QUERY_ROOT_ID,
  QUERY_PANEL_WIDTH,
  SIDE_ROOT_ID,
  CUSTOM_EVENT_TYPE
} from '../constants'
import { MaskClickEventDetail } from '../types'
import { isEnglishText } from '../utils/text'

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

// keyboard singe
const singe = (key: string) => {
  if (key === 'Escape') {
    queryRender.removeFromBody()
  }
}
// keyboard combine
const combine = (keys: Record<string, boolean>) => {
  if (keys['Alt'] && keys['t']) {
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
}
// window selection change
const onSelectionChange = () => {
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
  console.log(
    '🚀 ~ file: main.tsx:78 ~ onSelectionChange ~ parentElement:',
    parentElement
  )
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

async function start() {
  windowSelectionChange({
    onSelectionChange
  })

  keyboard({
    singe,
    combine
  })

  const words = await rpc.getWords()

  if (words.length) {
    appendCss()
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
