type SelectionChangeOptions = {
  onSelectionChange: () => void
}
export function windowSelectionChange(options: SelectionChangeOptions) {
  const { onSelectionChange } = options

  let isSelecting = false
  document.addEventListener('selectstart', () => {
    isSelecting = true
  })

  document.addEventListener('mouseup', () => {
    if (isSelecting) {
      isSelecting = false
      onSelectionChange()
    }
  })
}

type KeyBoardOptions = {
  singe: (key: string) => void
  combine: (keyPressed: Record<string, boolean>) => void
}
export function keyboard(options: KeyBoardOptions) {
  const { singe, combine } = options
  const keyPressed: Record<string, boolean> = {}

  document.addEventListener('keydown', (e) => {
    keyPressed[e.key] = true
    combine(keyPressed)
    singe(e.key)
  })

  document.addEventListener('keyup', (e) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete keyPressed[e.key]
  })
}
