import type { DictionaryQueryForm } from "@/api/types"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, WandSparkles, BookOpenCheck } from "lucide-react"
import WordForm from "./WordForm"
import { createBackgroundMessage } from "@/messaging/background"
import { onBackgroundMessage, sendBackgroundMessage } from "@/messaging/content"
import Analyze from "@/components/Analyze"

const bgs = createBackgroundMessage()

type ExpandProps = {
	forms?: DictionaryQueryForm[]
	word: string
}

export default function Expand({ forms = [], word }: ExpandProps) {
	const [isExpand, setIsExpand] = useState(false)
	const [analyzeLoading, setAnalyzeLoading] = useState(false)
	const removeCallback = useRef<() => void>()
	const [analyzeResult, setAnalyzeResult] = useState("")

	const toggle = () => {
		setIsExpand(!isExpand)
	}

	const onAnalyze = async () => {
		setAnalyzeLoading(true)
		sendBackgroundMessage("analyzeWord", word)
	}

	useEffect(() => {
		if (analyzeLoading) {
			removeCallback.current = onBackgroundMessage(
				"analyzeWordResult",
				({ data: { result, done } }) => {
					console.log("🚀 ~ useEffect ~ result:", result)
					setAnalyzeResult(result)
					setAnalyzeLoading(!done)
				},
			)
		}

		return () => {
			removeCallback.current?.()
		}
	}, [analyzeLoading])

	return (
		<div>
			{/* 单词变形展开区域 */}
			{isExpand && forms.length > 0 && (
				<div className="px-3 py-2 bg-gradient-to-r from-indigo-50/30 via-white to-indigo-50/30 dark:from-indigo-900/10 dark:via-slate-800 dark:to-indigo-900/10 border-t border-gray-200/30 dark:border-gray-700/30">
					<div className="flex items-center gap-2 mb-2">
						<div className="w-4 h-4 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded flex items-center justify-center">
							<BookOpenCheck size={10} className="text-white" />
						</div>
						<h4 className="text-xs font-medium text-gray-900 dark:text-gray-100">
							词形变化
						</h4>
					</div>
					<div className="flex gap-1.5 flex-wrap">
						{forms.map((form) => (
							<WordForm key={form.name} {...form} />
						))}
					</div>
				</div>
			)}

			{/* 分析结果 */}
			<Analyze result={analyzeResult} />

			{/* 底部操作区域 */}
			<div className="px-3 py-2 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-700/80 border-t border-gray-200/30 dark:border-gray-700/30">
				<div className="flex justify-end items-center gap-1.5">
					{/* 语法分析按钮 */}
					<button
						type="button"
						disabled={analyzeLoading}
						onClick={onAnalyze}
						className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors disabled:opacity-50"
					>
						{analyzeLoading ? (
							<div className="w-3 h-3 border border-purple-600 border-t-transparent rounded-full animate-spin" />
						) : (
							<WandSparkles size={12} />
						)}
						{analyzeLoading ? "分析中" : "词汇分析"}
					</button>

					{/* 展开/收起按钮 */}
					{forms.length > 0 && (
						<button
							type="button"
							onClick={toggle}
							className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
						>
							<ChevronDown
								size={12}
								className={`transition-transform duration-200 ${
									isExpand ? "rotate-180" : ""
								}`}
							/>
							{isExpand ? "收起" : `变形 (${forms.length})`}
						</button>
					)}
				</div>
			</div>
		</div>
	)
}
