import { useState } from 'react'
import {
  fetchCreateWordApi,
  fetchDeleteWordApi,
  fetchQueryWordApi
} from '../../api'
import Search from './Search'
import Collect from './Collect'
import type { DictQueryResultDto } from '../../api/types'

export default function Query() {
  const [word, setWord] = useState('')
  const [queryResult, setQueryResult] = useState<DictQueryResultDto>()
  const onQuery = async (text: string) => {
    const [isOk, data] = await fetchQueryWordApi(text)
    if (!isOk) {
      return
    }
    setWord(text)
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

  return (
    <div className="w-full h-full flex justify-center items-start pt-20 text-black">
      <div className="w-[400px] bg-white p-2 rounded-md shadow">
        <Search onQuery={onQuery} />

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
