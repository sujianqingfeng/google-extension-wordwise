import type { IDictionaryQueryTranslate } from '@/api/types'

type TranslateProps = IDictionaryQueryTranslate

export default function Translate(props: TranslateProps) {
  const { translation, partName } = props
  return (
    <div className="flex gap-1 text-sm">
      <div>{partName}</div>
      <div>{translation}</div>
    </div>
  )
}
