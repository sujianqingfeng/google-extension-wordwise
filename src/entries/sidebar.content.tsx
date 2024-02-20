import type {
  ContentScriptContext,
  ShadowRootContentScriptUi
} from 'wxt/client'
import ReactDOM from 'react-dom/client'
import Sidebar from './sidebar/Sidebar'
import { onMessage } from '../messaging/content'
import { SIDEBAR_SHADOW_TAG_NAME, TOKEN } from '@/constants'

import '~/assets/main.css'

function createSidebar(ctx: ContentScriptContext) {
  let isMounted = false
  let ui: ShadowRootContentScriptUi<ReactDOM.Root> | null = null

  return async function toggle() {
    if (!ui) {
      const token = await storage.getItem<string>(TOKEN)

      ui = await createShadowRootUi(ctx, {
        name: SIDEBAR_SHADOW_TAG_NAME,
        position: 'inline',
        anchor: 'body',
        onMount: (container) => {
          const root = ReactDOM.createRoot(container)
          root.render(<Sidebar removeSidebar={ui!.remove} token={token} />)
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
    console.log('🚀 ~ ctx: sider')

    const toggle = createSidebar(ctx)
    onMessage('toggleSidebar', toggle)
  }
})
