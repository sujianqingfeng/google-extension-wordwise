import type { IDictionaryQueryForm } from '@/api/types'
import { useState } from 'react'
import { MdExpandMore } from 'react-icons/md'
import WordForm from './WordForm'

type ExpandProps = {
  forms?: IDictionaryQueryForm[]
}
export default function Expand(props: ExpandProps) {
  const { forms = [] } = props
  const [isExpand, setIsExpand] = useState(false)

  const toggle = () => {
    setIsExpand(!isExpand)
  }
  return (
    <div>
      {isExpand && (
        <div className="px-2 flex gap-2 mt-2 flex-wrap text-black">
          {forms.map((f, i) => (
            <WordForm key={i} {...f} />
          ))}
        </div>
      )}

      <div className="p-1 flex justify-end bg-gray-100 dark:bg-slate-400/10">
        <MdExpandMore className="cursor-pointer dark:text-gray-400 text-black" onClick={toggle} />
      </div>
    </div>
  )
}
