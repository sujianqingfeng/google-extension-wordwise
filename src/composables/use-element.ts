import { type RefObject, useEffect } from "react"
import {
	MASK_HOVER_ATTR,
	QUERY_SHADOW_TAG_NAME,
	SIDEBAR_SHADOW_TAG_NAME,
} from "@/constants"

type UseOutsideClickOptions = {
	ref: RefObject<Element>
	onOutsideClick: () => void
}
export function useOutsideClick(options: UseOutsideClickOptions) {
	const { ref, onOutsideClick } = options

	useEffect(() => {
		function handleOutsideClick(event: MouseEvent) {
			const tagName = (event.target as HTMLElement).tagName.toLowerCase()
			if (
				tagName === QUERY_SHADOW_TAG_NAME ||
				tagName === SIDEBAR_SHADOW_TAG_NAME ||
				// word clicks swap the panel through the mount path; closing first
				// on mousedown would flicker while the async remount lands. the
				// attribute is set by the pointer tracking in core/range
				(event.target as HTMLElement).closest(`[${MASK_HOVER_ATTR}]`)
			) {
				return
			}
			onOutsideClick?.()
		}
		document.addEventListener("mousedown", handleOutsideClick)
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick)
		}
	}, [ref])
}
