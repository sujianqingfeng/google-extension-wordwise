import type { IDictionaryQueryForm } from '../../../api/types'

type WordFormProps = IDictionaryQueryForm

export default function WordForm(props: WordFormProps) {
  const { name, value } = props

  return (
    <div className="flex items-center px-1 text-sm bg-gray-100 dark:bg-slate-400 rounded-full">
      <span className="text-[8px]">{name}</span> /{value}
    </div>
  )
}
