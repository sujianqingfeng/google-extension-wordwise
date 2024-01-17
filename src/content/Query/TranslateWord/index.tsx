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
import Loading from '../../../components/Loading'
import { CUSTOM_EVENT_TYPE } from '../../../constants'
import { useFetch } from '../../../hooks/use-fetch'
import { createContentRpc } from '../../rpc'

const rpc = createContentRpc()

type TranslateWordProps = {
  autoFetch?: boolean
  word: string
}
export default function TranslateWord(props: TranslateWordProps) {
  const { word: _word, autoFetch = true } = props
  const word = _word.toLowerCase()

  const { result, loading } = useFetch<IDictQueryResultResp, IQueryWordParams>({
    autoFetch,
    apiFn: fetchQueryWordApi,
    defaultQuery: { word },
    defaultValue: {}
  })

  const { result: collectedResult, fetchApi: fetchWordIsCollected } =
    useFetch<IQueryWordCollectedResp>({
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
    // TODO: remove range words
    if (next) {
      document.dispatchEvent(
        new CustomEvent(CUSTOM_EVENT_TYPE.RANGE_WORDS, { detail: [word] })
      )
    }
    next ? rpc.addWord(word) : rpc.removeWord(word)
    fetchWordIsCollected()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-10">
        <Loading />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center dark:text-gray-300">
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
      <div className="flex gap-2 mt-2 flex-wrap">
        {result.forms?.map((f, i) => <WordForm key={i} {...f} />)}
      </div>
      <div className="flex flex-col gap-1 mt-2 dark:text-gray-400">
        {result.translations?.map((trs, i) => <Translate key={i} {...trs} />)}
      </div>
    </div>
  )
}
