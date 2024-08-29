import type { DictionaryQueryTranslate } from "@/api/types"

type TranslateProps = DictionaryQueryTranslate

export default function Translate(props: TranslateProps) {
  const { translation, partName } = props
  return (
    <div className="flex gap-1 text-[10px]">
      <div>{partName}</div>
      <div>{translation}</div>
    </div>
  )
}
