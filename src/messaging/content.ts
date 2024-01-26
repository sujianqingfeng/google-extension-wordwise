import { defineExtensionMessaging } from '@webext-core/messaging'

interface SendContentMessage {
  toggleSidebar: () => void
}

export const { sendMessage: sendContentMessage, onMessage } =
  defineExtensionMessaging<SendContentMessage>()
