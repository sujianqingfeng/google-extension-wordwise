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
  div.className = 'word-wise box-border'
  return div
}

export const createRootRender = (id: string) => {
  const el = createCrxRoot(id)
  let root: null | ReactDOM.Root = null
  let _isShowing = false

  const rootRender = (node: React.ReactNode) => {
    root = ReactDOM.createRoot(el)
    root.render(<React.StrictMode>{node}</React.StrictMode>)
  }

  const appendToBody = () => {
    appendChildToBody(el)
    _isShowing = true
  }

  const removeFromBody = (isExamine = true) => {
    root?.unmount()
    removeChildFromBody(el, isExamine)
    _isShowing = false
  }

  return {
    el,
    get isShowing() {
      return _isShowing
    },
    rootRender,
    appendToBody,
    removeFromBody
  }
}

export function createTypographyHoverElement() {
  const el = document.createElement('span')
  el.className = 'word-wise-typography-hover'
  el.appendChild(document.createTextNode('W'))
  return el
}
