import React from 'react'
import ReactDOM from 'react-dom/client'
import Query from './Query'
import { rangeWords } from './range'
import {
  appendChildToBody,
  createQueryRoot,
  createSideRoot,
  removeChildFromBody
} from './root'
import Side from './Side'
// import '../index.css'
import { CONTENT_MESSAGE_TYPE } from '../constants'

const sideRoot = createSideRoot()
const queryRoot = createQueryRoot()

const render = (root: HTMLElement, node: React.ReactNode) => {
  ReactDOM.createRoot(root).render(<React.StrictMode>{node}</React.StrictMode>)
}

const showSidebar = () => {
  render(sideRoot, <Side />)
  appendChildToBody(sideRoot)
}

const showQueryPanel = () => {
  render(queryRoot, <Query />)
  appendChildToBody(queryRoot)
}

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case CONTENT_MESSAGE_TYPE.SHOW_SIDEBAR:
      showSidebar()
      break
  }
})

// document.addEventListener('select', (e) => {
//   // e.target.selectionStart
//   const target = e.target as HTMLInputElement
//   console.log('fff', target.selectionStart)
//   const selectedText = document.getSelection()!.toString()
//   console.log(
//     '🚀 ~ file: main-content.tsx:30 ~ document.addEventListener ~ selectedText:',
//     selectedText
//   )
// })

// document.addEventListener('selectionchange', (e) => {
//   const selection = window.getSelection()
//   const el = selection?.getRangeAt(0)
//   console.log(
//     '🚀 ~ file: main-content.tsx:39 ~ document.addEventListener ~ el:',
//     el
//   )
//   console.log(
//     '🚀 ~ file: main-content.tsx:38 ~ document.addEventListener ~ selection:',
//     selection
//   )
//   const selectedText = document.getSelection()!.toString()
//   console.log(
//     '🚀 ~ file: main-content.tsx:38 ~ document.addEventListener ~ selectedText:',
//     selectedText
//   )
// })

const keyPressed: Record<string, boolean> = {}
const checkCombineKeys = () => {
  if (keyPressed['Alt'] && keyPressed['t']) {
    if (document.body.contains(queryRoot)) {
      removeChildFromBody(queryRoot, false)
    } else {
      showQueryPanel()
    }
  }
}
const handleSingleKey = (key: string) => {
  if (key === 'Escape') {
    removeChildFromBody(queryRoot)
  }
}

document.addEventListener('keydown', (e) => {
  keyPressed[e.key] = true
  handleSingleKey(e.key)
  checkCombineKeys()
})

document.addEventListener('keyup', (e) => {
  delete keyPressed[e.key]
})

rangeWords(['you'])

console.log('----end----')
