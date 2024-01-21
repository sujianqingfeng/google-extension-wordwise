export function createWindowSelection() {
  let isSelecting = false

  const onSelectionChange = (callback: () => void) => {
    document.addEventListener('selectstart', () => {
      isSelecting = true
    })

    document.addEventListener('mouseup', () => {
      if (isSelecting) {
        callback()
        isSelecting = false
      }
    })
  }

  return {
    onSelectionChange,
    get isSelecting() {
      return isSelecting
    }
  }
}

type KeyBoardOptions = {
  singe: (key: string) => void
  combine: (keyPressed: Record<string, boolean>) => void
}
export function keyboard(options: KeyBoardOptions) {
  const { singe, combine } = options
  const keyPressed: Record<string, boolean> = {}

  document.addEventListener('keydown', (e) => {
    console.log('🚀 ~ document.addEventListener ~ e:', e)
    keyPressed[e.key] = true
    combine(keyPressed)
    setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete keyPressed[e.key]
    }, 400)
    singe(e.key)
  })

  document.addEventListener('keyup', (e) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete keyPressed[e.key]
  })

  return keyPressed
}
