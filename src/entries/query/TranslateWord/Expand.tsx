import type { DictionaryQueryForm } from "@/api/types"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import WordForm from "./WordForm"

type ExpandProps = {
	forms?: DictionaryQueryForm[]
}
export default function Expand({ forms = [] }: ExpandProps) {
	const [isExpand, setIsExpand] = useState(false)

	const toggle = () => {
		setIsExpand(!isExpand)
	}
	return (
		<div>
			{isExpand && (
				<div className="p-2 flex gap-2 flex-wrap text-black">
					{forms.map((f, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<WordForm key={i} {...f} />
					))}
				</div>
			)}

			<div className="p-1 flex justify-end bg-gray-100 dark:bg-slate-400/10">
				<ChevronDown
					size={14}
					className={`cursor-pointer dark:text-gray-400 text-black  transition-transform " 
						${isExpand ? "rotate-180" : ""}`}
					onClick={toggle}
				/>
			</div>
		</div>
	)
}
