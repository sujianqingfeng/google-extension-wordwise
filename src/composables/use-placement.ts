interface IUsePlacementProps {
	triggerRect: DOMRect | null
	contentRect: DOMRect | null
	/** used before the first measurement lands so the panel never paints at (0,0) */
	fallbackWidth?: number
}

export function usePlacement({
	triggerRect,
	contentRect,
	fallbackWidth = 0,
}: IUsePlacementProps) {
	const position = {
		left: 0,
		top: 0,
	}

	const width = contentRect?.width ?? fallbackWidth
	if (!triggerRect || !width) {
		return position
	}

	position.left = triggerRect.left + triggerRect.width / 2 - width / 2

	position.left = Math.max(position.left, 0)

	position.left = Math.min(position.left, window.innerWidth - width - 15)

	position.top = triggerRect.top + triggerRect.height + 1

	return position
}
