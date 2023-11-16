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
  SIDE_ROOT_ID
} from '../constants'

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

keyboard({
  singe(key) {
    if (key === 'Escape') {
      queryRender.removeFromBody()
    }
  },
  combine(keys) {
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
})

const onSelectionChange = () => {
  const selection = window.getSelection()
  if (!selection) {
    return
  }

  const selectionText = selection.toString()
  if (!selectionText) {
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

windowSelectionChange({
  onSelectionChange
})

// rangeWords(['you'])

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case CONTENT_MESSAGE_TYPE.SHOW_SIDEBAR:
      showSidebar()
      break
  }
})

console.log('----end----')
