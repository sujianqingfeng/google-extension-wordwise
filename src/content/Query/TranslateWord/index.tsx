import type {
  IDictQueryResultResp,
  IQueryWordCollectedResp,
  IQueryWordParams
} from '../../../api/types'
import Collect from './Collect'
import Phonetic from './Phonetic'
import Translate from './Translate'
import WordForm from './WordForm'
import {
  fetchCreateWordApi,
  fetchDeleteWordApi,
  fetchQueryWordApi,
  fetchWordIsCollectedApi
} from '../../../api'
import { useFetch } from '../../../hooks/use-fetch'
import Loading from '../Loading'

type TranslateWordProps = {
  word: string
}
export default function TranslateWord(props: TranslateWordProps) {
  const { word } = props

  const { result, loading } = useFetch<IDictQueryResultResp, IQueryWordParams>({
    apiFn: fetchQueryWordApi,
    defaultQuery: { word },
    defaultValue: {}
  })

  const { result: collectedResult } = useFetch<IQueryWordCollectedResp>({
    apiFn: fetchWordIsCollectedApi,
    defaultQuery: { word },
    defaultValue: {}
  })

  const onCollect = async (next: boolean) => {
    // no query result
    if (!result) {
      return
    }
    const fetchApi = next ? fetchCreateWordApi : fetchDeleteWordApi
    const [isOk] = await fetchApi({ word })
    if (!isOk) {
      return
    }

    // setQueryResult((pre) => {
    //   return { ...pre!, isCollected: next }
    // })
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="text-[20px] font-bold">{result?.word}</div>
        <Collect
          onCollect={onCollect}
          isCollected={!!collectedResult?.isCollected}
        />
      </div>
      <div className="flex justify-start items-center gap-2 mt-1">
        <Phonetic
          label="uk"
          phonetic={result?.ukPhonetic}
          speech={result?.ukSpeech}
        />
        <Phonetic
          label="us"
          phonetic={result?.usPhonetic}
          speech={result?.usSpeech}
        />
      </div>
      <div className="flex gap-2 mt-2">
        {result.forms?.map((f, i) => <WordForm key={i} {...f} />)}
      </div>
      <div className="flex flex-col gap-1 mt-2">
        {result.translates?.map((trs, i) => <Translate key={i} {...trs} />)}
      </div>
    </div>
  )
}
