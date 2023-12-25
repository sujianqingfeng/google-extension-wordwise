export type MaskClickEventDetail = {
  word: string
  rect: DOMRect
}

export type WrapperElementOptions = {
  word: string
  onClick: (e: MouseEvent) => void
}

export type BackgroundFunctions = {
  getToken(): string
}

export type ContentFunctions = {}
