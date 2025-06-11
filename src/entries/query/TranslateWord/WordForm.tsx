import type { DictionaryQueryForm } from "@/api/types"
import { ArrowRight } from "lucide-react"

type WordFormProps = DictionaryQueryForm

export default function WordForm(props: WordFormProps) {
	const { name, value } = props

	return (
		<div className="group inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded border border-emerald-200/50 dark:border-emerald-700/50 transition-all duration-200 hover:shadow-soft hover:-translate-y-0.5 hover:from-emerald-100 hover:to-emerald-200 dark:hover:from-emerald-800/30 dark:hover:to-emerald-700/30">
			{/* 词性标签 */}
			<span className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 shrink-0">
				{name}
			</span>

			{/* 箭头图标 */}
			<ArrowRight
				size={10}
				className="text-emerald-500 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform duration-200"
			/>

			{/* 变形值 */}
			<span className="text-xs font-medium text-emerald-800 dark:text-emerald-200 break-keep">
				{value}
			</span>
		</div>
	)
}
