import { type RefObject, useEffect } from "react"
import { QUERY_SHADOW_TAG_NAME, SIDEBAR_SHADOW_TAG_NAME } from "@/constants"

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
				tagName !== QUERY_SHADOW_TAG_NAME &&
				tagName !== SIDEBAR_SHADOW_TAG_NAME
			) {
				onOutsideClick?.()
			}
		}
		document.addEventListener("mousedown", handleOutsideClick)
		return () => {
			document.removeEventListener("mousedown", handleOutsideClick)
		}
	}, [ref])
}
