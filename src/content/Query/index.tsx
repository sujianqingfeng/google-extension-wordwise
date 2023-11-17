import type { DictQueryResultDto } from '../../api/types'
import { CSSProperties, useRef, useState } from 'react'
import Collect from './Collect'
import Search from './Search'
import TranslateText from './TranslateText'
import {
  fetchCreateWordApi,
  fetchDeleteWordApi,
  fetchQueryWordApi
} from '../../api'
import { useOutsideClick } from '../../hooks/use-element'
import { isText } from '../../utils/text'

export type QueryProps = {
  top?: number
  left?: number
  removeQueryPanel: () => void
  text?: string
  autoFocus?: boolean
}

export default function Query(props: QueryProps) {
  const { top, left, removeQueryPanel, text = '', autoFocus = false } = props

  const queryRef = useRef<HTMLDivElement>(null)

  const [isTextFlag, setIsTextFlag] = useState(isText(text))

  const [word, setWord] = useState(text)
  const [queryResult, setQueryResult] = useState<DictQueryResultDto>()
  const onQuery = async (text: string) => {
    const [isOk, data] = await fetchQueryWordApi(text)
    if (!isOk) {
      return
    }
    setQueryResult(data)
  }

  const onCollect = async (next: boolean) => {
    // no query result
    if (!queryResult) {
      return
    }
    const fetchApi = next ? fetchCreateWordApi : fetchDeleteWordApi
    const [isOk] = await fetchApi({ word })
    if (!isOk) {
      return
    }

    setQueryResult((pre) => {
      return { ...pre!, isCollected: next }
    })
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

  onQuery(text)

  return (
    <div
      ref={queryRef}
      style={queryStyle}
      className="fixed flex justify-center items-start text-black"
    >
      <div className="w-[400px] bg-white p-2 rounded-md shadow">
        <Search
          onQuery={onQuery}
          text={word}
          onTextChange={setWord}
          autoFocus={autoFocus}
        />

        {isTextFlag && <TranslateText text={text} />}

        {queryResult && (
          <div>
            <div className="flex justify-between items-center">
              <div className="text-[20px] font-bold">{queryResult.word}</div>
              <Collect
                onCollect={onCollect}
                isCollected={queryResult.isCollected}
              />
            </div>
            <div>{queryResult.translation}</div>
          </div>
        )}
      </div>
    </div>
  )
}
