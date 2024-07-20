import type { DictionaryQueryForm } from "@/api/types"

type WordFormProps = DictionaryQueryForm
export default function WordForm(props: WordFormProps) {
	const { name, value } = props

	return (
		<div className="flex items-center px-1 text-sm bg-gray-100 text-black dark:bg-slate-400/10 rounded-full">
			<span className="text-[8px]">{name}</span> /{value}
		</div>
	)
}
