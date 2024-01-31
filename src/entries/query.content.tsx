import type { QueryContentContext } from '@/types'
import ReactDOM from 'react-dom/client'
import Query from './query'
import { createBackgroundMessage } from '@/messaging/background'
import '~/assets/main.css'
import { ContentScriptContext, ShadowRootContentScriptUi } from 'wxt/client'

function createWindowSelection(context: QueryContentContext) {
  const onSelectionChange = (callback: () => void) => {
    document.addEventListener('selectstart', () => {
      context.isSelecting = true
    })

    document.addEventListener('mouseup', () => {
      if (context.isSelecting) {
        callback()
        context.isSelecting = false
      }
    })
  }

  return {
    onSelectionChange
  }
}

const onSelectionChange = (context: QueryContentContext) => {
  // if (!context.isPressedAlt) {
  //   return
  // }

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

  // if (queryRender.el.contains(parentElement)) {
  //   return
  // }
  // currenQueryWordEl = parentElement

  // const rect = range.getBoundingClientRect()

  // queryRender.removeFromBody()
  // showQueryPanel({
  //   text: selectionText,
  //   triggerRect: rect
  // })
}

function createQuery(ctx: ContentScriptContext) {
  let isMounted = false
  let ui: ShadowRootContentScriptUi<ReactDOM.Root> | null = null

  return async function toggle(options: {
    text?: string
    triggerRect?: DOMRect
  }) {
    if (!ui) {
      ui = await createShadowRootUi(ctx, {
        name: 'word-wise-sidebar',
        position: 'inline',
        anchor: 'body',
        onMount: (container) => {
          const root = ReactDOM.createRoot(container)
          root.render(<Query removeQueryPanel={ui!.remove} {...options} />)
          isMounted = true
          return root
        },
        onRemove: (root) => {
          root?.unmount()
          isMounted = false
        }
      })
    }

    isMounted ? ui.remove() : ui.mount()
  }
}

export default defineContentScript({
  matches: ['<all_urls>'],
  // matches: ['https://wxt.dev'],
  cssInjectionMode: 'ui',
  runAt: 'document_idle',
  async main(ctx) {
    console.log('🚀 ~ ctx: query')

    const bgs = createBackgroundMessage()
    const user = await bgs.getUser()

    if (!user) {
      return
    }

    const context: QueryContentContext = {
      isSelecting: false
    }

    const toggle = createQuery(ctx)

    createWindowSelection(context).onSelectionChange(
      onSelectionChange.bind(null, context)
    )
  }
})
