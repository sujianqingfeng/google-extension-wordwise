import type {
  ContentScriptContext,
  ShadowRootContentScriptUi
} from 'wxt/client'
import ReactDOM from 'react-dom/client'
import Sidebar from './sider/Sidebar'
import { onMessage } from '../messaging/content'
import '~/assets/main.css'

function createSidebar(ctx: ContentScriptContext) {
  let isMounted = false
  let ui: ShadowRootContentScriptUi<ReactDOM.Root> | null = null

  return async function toggle() {
    if (!ui) {
      ui = await createShadowRootUi(ctx, {
        name: 'word-wise-sidebar',
        position: 'inline',
        anchor: 'body',
        onMount: (container) => {
          const root = ReactDOM.createRoot(container)
          root.render(<Sidebar removeSidebar={ui!.remove} />)
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
  cssInjectionMode: 'ui',
  runAt: 'document_idle',
  async main(ctx) {
    console.log('🚀 ~ ctx: sider')

    const toggle = createSidebar(ctx)
    onMessage('toggleSidebar', toggle)
  }
})
