import { fetchTranslateApi } from '../../api'
import { useFetch } from '../../hooks/use-fetch'

type TranslateTextProps = {
  text: string
}
export default function TranslateText(props: TranslateTextProps) {
  const { text } = props

  const { result } = useFetch({
    apiFn: fetchTranslateApi,
    defaultQuery: {
      text
    },
    defaultValue: null
  })

  return <div>fff,{result}</div>
}
