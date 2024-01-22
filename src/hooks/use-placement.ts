interface IUsePlacementProps {
  triggerRect: DOMRect | null
  contentRect: DOMRect | null
}

export function usePlacement({ triggerRect, contentRect }: IUsePlacementProps) {
  const position = {
    left: 0,
    top: 0
  }

  if (triggerRect && contentRect) {
    position.left =
      triggerRect.left + triggerRect.width / 2 - contentRect.width / 2

    position.left = Math.max(position.left, 0)

    position.left = Math.min(
      position.left,
      window.innerWidth - contentRect.width - 15
    )

    position.top = triggerRect.top + triggerRect.height + 1
  }

  return position
}
