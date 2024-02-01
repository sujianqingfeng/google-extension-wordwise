import type { QueryContentContext, QueryUI } from '@/types'
import type {
  ContentScriptContext,
  ShadowRootContentScriptUi
} from 'wxt/client'
import ReactDOM from 'react-dom/client'
import Query from './query/Query'
import { createBackgroundMessage } from '@/messaging/background'
import '~/assets/main.css'

import { storage } from 'wxt/storage'
import { TOKEN } from '@/constants'

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

const onSelectionChange = async (context: QueryContentContext) => {
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

  if (
    context.queryUI.container &&
    context.queryUI.container.contains(parentElement)
  ) {
    return
  }
  context.currentQueryTriggerEl = parentElement

  const rect = range.getBoundingClientRect()

  const token = await storage.getItem<string>(TOKEN)

  if (!token) {
    return
  }
  context.queryUI.mount({
    text: selectionText,
    triggerRect: rect,
    token
  })
}

function createQueryUI(ctx: ContentScriptContext): QueryUI {
  let isMounted = false
  let ui: ShadowRootContentScriptUi<ReactDOM.Root> | null = null

  const mount = async (options: { text?: string; triggerRect?: DOMRect }) => {
    if (!ui) {
      ui = await createShadowRootUi(ctx, {
        name: 'word-wise-query',
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

    ui.mount()
  }

  const remove = () => {
    ui?.remove()
  }

  return {
    mount,
    remove,
    get isMounted() {
      return isMounted
    },
    get container() {
      return ui?.uiContainer
    }
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

    const queryUI = createQueryUI(ctx)

    const context: QueryContentContext = {
      isSelecting: false,
      queryUI,
      currentQueryTriggerEl: null
    }

    createWindowSelection(context).onSelectionChange(
      onSelectionChange.bind(null, context)
    )
  }
})
