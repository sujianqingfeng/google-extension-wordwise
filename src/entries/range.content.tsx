import { rangeWords } from './core/range'
import { createBackgroundMessage } from '@/messaging/background'
import './core/range.css'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  cssInjectionMode: 'manifest',
  async main(ctx) {
    console.log('🚀 ~ ctx: range')

    const bgs = createBackgroundMessage()
    const user = await bgs.getUser()

    if (!user) {
      return
    }

    const words = await bgs.getWords()
    console.log('🚀 ~ main ~ words:', words)
    const pureWords = words.map((word) => word.word)
    rangeWords(pureWords)
  }
})
