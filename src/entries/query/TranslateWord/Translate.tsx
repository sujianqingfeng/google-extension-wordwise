import type { DictionaryQueryTranslate } from "@/api/types"

type TranslateProps = DictionaryQueryTranslate

export default function Translate(props: TranslateProps) {
	const { translation, partName } = props

	return (
		<div className="group flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-all duration-200">
			{/* 词性标签 */}
			<span className="text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded border border-purple-200/50 dark:border-purple-700/50 flex-shrink-0">
				{partName}
			</span>

			{/* 翻译内容 */}
			<span className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-200">
				{translation}
			</span>
		</div>
	)
}
