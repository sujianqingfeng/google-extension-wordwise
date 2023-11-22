import type { IDictionaryQueryTranslate } from '../../../api/types'

type TranslateProps = IDictionaryQueryTranslate

export default function Translate(props: TranslateProps) {
  const { translate, position } = props
  return (
    <div className="flex gap-1 text-sm">
      <div>{position}</div>
      <div>{translate}</div>
    </div>
  )
}
