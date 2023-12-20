import { CSSProperties, useRef, useState } from 'react'
import Search from './Search'
import TranslateText from './TranslateText'
import TranslateWord from './TranslateWord'
import { useOutsideClick } from '../../hooks/use-element'
import { isText } from '../../utils/text'

export type QueryProps = {
  top?: number
  left?: number
  removeQueryPanel: () => void
  text?: string
  autoFocus?: boolean
  showSearch?: boolean
}

export default function Query(props: QueryProps) {
  const {
    top,
    left,
    removeQueryPanel,
    text: defaultText = '',
    autoFocus = false,
    showSearch = false
  } = props

  const [text, setText] = useState(defaultText)
  const [isTextFlag, setIsTextFlag] = useState(isText(defaultText))
  const queryRef = useRef<HTMLDivElement>(null)

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

  const queryStyle: CSSProperties = {}
  if (top) {
    queryStyle.top = top
  }
  if (left) {
    queryStyle.left = left
  }

  return (
    <div
      ref={queryRef}
      style={queryStyle}
      className="fixed flex justify-center items-start text-black"
    >
      <div className="w-[400px] bg-base p-2 rounded-md shadow">
        {showSearch && (
          <Search
            onQuery={onQuery}
            text={text}
            onTextChange={setText}
            autoFocus={autoFocus}
          />
        )}

        {isTextFlag ? (
          <TranslateText text={text} />
        ) : (
          <TranslateWord word={text} />
        )}
      </div>
    </div>
  )
}
