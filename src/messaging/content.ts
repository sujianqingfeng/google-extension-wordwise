import { defineExtensionMessaging } from "@webext-core/messaging"

export interface SendContentMessage {
	toggleSidebar: () => void
	analyzeGrammarResult: (options: { result: string; done: boolean }) => void
	analyzeWordResult: (options: { result: string; done: boolean }) => void
	// login happened on another surface (sidebar); content scripts that bailed
	// out early for being logged-out use this to initialize without a reload
	userChanged: () => void
	// a word was collected/un-collected in some tab; every tab re-syncs its
	// masks instead of waiting for a reload
	rangeWords: (words: string[]) => void
	unrangeWords: (words: string[]) => void
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
