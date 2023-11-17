import { RefObject, useEffect } from 'react'

type UseOutsideClickOptions = {
  ref: RefObject<Element>
  onOutsideClick: () => void
}
export function useOutsideClick(options: UseOutsideClickOptions) {
  const { ref, onOutsideClick } = options

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick && onOutsideClick()
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [ref])
}
