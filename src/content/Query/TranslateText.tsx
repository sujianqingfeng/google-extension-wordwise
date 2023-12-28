import { fetchTranslateApi } from '../../api'
import Loading from '../../components/Loading'
import { useFetch } from '../../hooks/use-fetch'

type TranslateTextProps = {
  text: string
}
export default function TranslateText(props: TranslateTextProps) {
  const { text } = props

  const { result: translate, loading } = useFetch({
    apiFn: fetchTranslateApi,
    defaultQuery: {
      text
    },
    defaultValue: {
      result: ''
    }
  })
  if (loading) {
    return (
      <div className="flex justify-center items-center h-10">
        <Loading />
      </div>
    )
  }

  return (
    <div className="text-sm font-normal dark:text-gray-300">
      <div className="mt-2">{text}</div>
      <div className="mt-2">{translate.result}</div>
    </div>
  )
}
