import React from 'react'
import ReactDOM from 'react-dom/client'

export function appendChildToBody(child: HTMLElement) {
  document.body.appendChild(child)
}

export function removeChildFromBody(child: HTMLElement, isExamine = true) {
  if (isExamine) {
    if (document.body.contains(child)) {
      document.body.removeChild(child)
    }
  } else {
    document.body.removeChild(child)
  }
}

export function createCrxRoot(id: string) {
  const div = document.createElement('div')
  div.id = id
  div.className = 'word-wise'
  return div
}

export const createRootRender = (el: HTMLElement) => {
  let root: null | ReactDOM.Root = null

  const rootRender = (node: React.ReactNode) => {
    root = ReactDOM.createRoot(el)
    root.render(<React.StrictMode>{node}</React.StrictMode>)
  }

  const appendToBody = () => {
    appendChildToBody(el)
  }

  const removeFromBody = (isExamine = true) => {
    root?.unmount()
    removeChildFromBody(el, isExamine)
  }

  return {
    el,
    rootRender,
    appendToBody,
    removeFromBody
  }
}
