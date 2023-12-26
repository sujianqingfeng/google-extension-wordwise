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
    return <Loading />
  }

  return (
    <div className="text-sm font-normal">
      <div className="mt-2">{text}</div>
      <div className="mt-2">{translate.result}</div>
    </div>
  )
}
