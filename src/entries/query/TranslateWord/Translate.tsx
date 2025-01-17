import type { DictionaryQueryTranslate } from "@/api/types"

type TranslateProps = DictionaryQueryTranslate

export default function Translate(props: TranslateProps) {
	const { translation, partName } = props
	return (
		<div className="flex items-center gap-3 text-sm group">
			<span className="text-gray-500 dark:text-gray-400 font-medium min-w-[36px] transition-colors group-hover:text-gray-900 dark:group-hover:text-gray-200">
				{partName}
			</span>
			<span className="text-gray-700 dark:text-gray-300 transition-colors group-hover:text-gray-900 dark:group-hover:text-gray-100">
				{translation}
			</span>
		</div>
	)
}
