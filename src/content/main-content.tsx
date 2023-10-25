import React from 'react'
import ReactDOM from 'react-dom/client'
import { createContentRoot } from './root'
import '../index.css'
import App from './App'
import { CONTENT_MESSAGE_TYPE } from '../constants'

const showSidebar = () => {
  const root = createContentRoot()
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case CONTENT_MESSAGE_TYPE.SHOW_SIDEBAR:
      showSidebar()
      break
  }
})
