import type { DictQueryResultDto } from '../../api/types'
import { useEffect, useState } from 'react'
import Collect from './Collect'
import {
  fetchCreateWordApi,
  fetchDeleteWordApi,
  fetchQueryWordApi
} from '../../api'

type TranslateWordProps = {
  word: string
}
export default function TranslateWord(props: TranslateWordProps) {
  const { word } = props
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

  useEffect(() => {
    if (word) {
      onQuery(word)
    }
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="text-[20px] font-bold">{queryResult?.word}</div>
        <Collect
          onCollect={onCollect}
          isCollected={!!queryResult?.isCollected}
        />
      </div>
      <div>{queryResult?.translation}</div>
    </div>
  )
}
