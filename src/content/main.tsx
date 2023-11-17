import { keyboard, windowSelectionChange } from './events'
import Query, { QueryProps } from './Query'
import { rangeWords } from './range'
import { createCrxRoot, createRootRender } from './root'
import Side from './Side'
import '../index.css'
import {
  CONTENT_MESSAGE_TYPE,
  QUERY_ROOT_ID,
  QUERY_PANEL_WIDTH,
  SIDE_ROOT_ID,
  BACKGROUND_MESSAGE_TYPE
} from '../constants'
import { isEnglishText } from '../utils/text'

const sideRender = createRootRender(createCrxRoot(SIDE_ROOT_ID))
const queryRender = createRootRender(createCrxRoot(QUERY_ROOT_ID))

const showSidebar = () => {
  sideRender.rootRender(<Side />)
  sideRender.appendToBody()
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
        autoFocus: true
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

  const selectionText = selection.toString()
  if (!selectionText) {
    return
  }

  if (!isEnglishText(selectionText)) {
    return
  }

  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()

  const { x, y, width, height } = rect

  queryRender.removeFromBody()
  showQueryPanel({
    top: y + height,
    left: x + width / 2 - QUERY_PANEL_WIDTH / 2,
    text: selectionText
  })
}

const start = () => {
  windowSelectionChange({
    onSelectionChange
  })

  keyboard({
    singe,
    combine
  })

  // rangeWords(['you'])
}

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case CONTENT_MESSAGE_TYPE.SHOW_SIDEBAR:
      showSidebar()
      break
  }
})

chrome.runtime
  .sendMessage({ type: BACKGROUND_MESSAGE_TYPE.GET_IS_LOGIN })
  .then((isLogin) => {
    if (isLogin) {
      start()
    }
  })

console.log('----end----')
