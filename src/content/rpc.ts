import type { BackgroundFunctions } from '../types'
import { createBirpc } from 'birpc'

export function createContentRpc<LocalFunctions = Record<string, never>>(
  localFunctions: LocalFunctions = {} as LocalFunctions
) {
  return createBirpc<BackgroundFunctions, LocalFunctions>(localFunctions, {
    on: (data) => chrome.runtime.onMessage.addListener(data),
    post: (data) => chrome.runtime.sendMessage(data)
  })
}
