import type { TranslateResp } from '@/api/types'
import useSWR from 'swr'
import Loading from '@/components/Loading'

type TranslateTextProps = {
  text: string
}
export default function TranslateText(props: TranslateTextProps) {
  const { text } = props

  const { token } = useToken()

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

  return (
    <div className="p-2 text-sm font-normal dark:text-gray-300">
      <div className="mt-2">{text}</div>
      <div className="mt-2">{translate?.result}</div>
    </div>
  )
}
