import type { DictionaryQueryForm } from "@/api/types"

type WordFormProps = DictionaryQueryForm
export default function WordForm(props: WordFormProps) {
	const { name, value } = props

	return (
		<div className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700 rounded-full text-xs ring-1 ring-gray-200/50 dark:ring-gray-600/50 transition-all hover:shadow-sm hover:scale-105 whitespace-nowrap max-w-full">
			<span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-1.5 shrink-0">
				{name}
			</span>
			<span className="text-gray-700 dark:text-gray-300 font-medium break-keep">
				{value}
			</span>
		</div>
	)
}
