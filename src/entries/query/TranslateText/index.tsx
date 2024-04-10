import type { IAnalysisGrammarResp, TranslateResp } from '@/api/types'
import useSWR from 'swr'
import Loading from '@/components/Loading'
import { RxMagicWand } from "react-icons/rx"
import useSWRMutation from 'swr/mutation'
import { useState } from 'react'

type TranslateTextProps = {
  text: string
}
export default function TranslateText(props: TranslateTextProps) {
  const { text } = props
  const { token } = useToken()
  const [analyseResult, setAnalyseResult] = useState('')

  const { data: translate, isLoading: loading } = useSWR(
    { url: `/translator/translate`, token, body: { text } },
    postWithTokenFetcher<TranslateResp>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-10">
        <Loading />
      </div>
    )
  }

  const { trigger: analyse } = useSWRMutation(
    { url: '/ai/analysis-grammar', token },
    postWithTokenFetcher<IAnalysisGrammarResp>
  )

  const onAnalyse = async () => {
    const { result } = await analyse({ text })
    setAnalyseResult(result)
  }

  return (
    <div className="text-sm font-normal dark:text-gray-400 text-black">

      <div className='p-2'>
        <div className="mt-2">{text}</div>
        <div className="mt-2">{translate?.result}</div>
      </div>

      {
        analyseResult && <div className='dark:text-gray-400 text-black'>
          {analyseResult}
        </div>
      }

      <div className="px-2 py-1 flex justify-end bg-gray-100 dark:bg-slate-400/10">
        <RxMagicWand className="cursor-pointer dark:text-gray-400 text-black" onClick={onAnalyse} />
      </div>
    </div>
  )
}
