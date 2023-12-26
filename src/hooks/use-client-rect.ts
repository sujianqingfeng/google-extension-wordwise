import { useLayoutEffect, useMemo, useState } from 'react'

export function useClientRect(elRef: React.RefObject<HTMLElement | null>) {
  const [clientRect, setClientRect] = useState<DOMRect | null>(null)

  const updateClientRect = useMemo(() => {
    return () => {
      const rect = elRef.current?.getBoundingClientRect() || null
      console.log('🚀 ~ file: use-client-rect.ts:9 ~ return ~ rect:', rect)
      setClientRect(rect)
    }
  }, [])

  useLayoutEffect(() => {
    if (elRef.current) {
      updateClientRect()
    }
  }, [])

  return [clientRect, updateClientRect] as [
    typeof clientRect,
    typeof updateClientRect
  ]
}
