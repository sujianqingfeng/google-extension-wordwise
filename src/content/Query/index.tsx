import { useRef, useState } from 'react'
import Search from './Search'
import TranslateText from './TranslateText'
import TranslateWord from './TranslateWord'
import { useClientRect } from '../../hooks/use-client-rect'
import { useOutsideClick } from '../../hooks/use-element'
import { usePlacement } from '../../hooks/use-placement'
import { isText } from '../../utils/text'

export type QueryProps = {
  top?: number
  left?: number
  removeQueryPanel: () => void
  text?: string
  autoFocus?: boolean
  showSearch?: boolean
  triggerRect?: DOMRect
}

export default function Query(props: QueryProps) {
  const {
    top,
    left,
    removeQueryPanel,
    text: defaultText = '',
    autoFocus = false,
    showSearch = false,
    triggerRect = null
  } = props

  const [text, setText] = useState(defaultText)
  const [isTextFlag, setIsTextFlag] = useState(isText(defaultText))
  const queryRef = useRef<HTMLDivElement>(null)
  const [queryRect] = useClientRect(queryRef)

  const onQuery = (text: string) => {
    setIsTextFlag(isText(text))
    setText(text)
  }

  useOutsideClick({
    ref: queryRef,
    onOutsideClick() {
      removeQueryPanel()
    }
  })

  const position = usePlacement({ triggerRect, contentRect: queryRect })

  return (
    <div
      ref={queryRef}
      style={{ top: top ?? position.top, left: left ?? position.left }}
      className="fixed flex justify-center items-start text-black"
    >
      <div className="w-[350px] bg-base p-2 rounded-md shadow">
        {showSearch && (
          <Search
            onQuery={onQuery}
            text={text}
            onTextChange={setText}
            autoFocus={autoFocus}
          />
        )}

        {text && isTextFlag && <TranslateText text={text} />}
        {text && !isTextFlag && (
          <TranslateWord autoFetch={!showSearch} word={text} />
        )}
      </div>
    </div>
  )
}
