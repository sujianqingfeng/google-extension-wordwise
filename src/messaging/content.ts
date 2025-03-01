import { defineExtensionMessaging } from "@webext-core/messaging"

export interface SendContentMessage {
	toggleSidebar: () => void
	analyzeGrammarResult: (options: { result: string; done: boolean }) => void
	analyzeWordResult: (options: { result: string; done: boolean }) => void
}

export const {
	sendMessage: sendContentMessage,
	onMessage: onBackgroundMessage,
} = defineExtensionMessaging<SendContentMessage>()

interface SendBackgroundMessage {
	analyzeGrammar: (text: string) => void
	analyzeWord: (text: string) => void
}

export const {
	sendMessage: sendBackgroundMessage,
	onMessage: onContentMessage,
} = defineExtensionMessaging<SendBackgroundMessage>()
