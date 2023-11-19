import { fetchTranslateApi } from '../../api'
import { useFetch } from '../../hooks/use-fetch'

type TranslateTextProps = {
  text: string
}
export default function TranslateText(props: TranslateTextProps) {
  const { text } = props

  const { result: translate } = useFetch({
    apiFn: fetchTranslateApi,
    defaultQuery: {
      text
    },
    defaultValue: {
      result: ''
    }
  })

  return <div>result: {translate.result}</div>
}
