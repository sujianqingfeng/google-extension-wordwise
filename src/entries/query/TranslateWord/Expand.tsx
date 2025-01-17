import type { DictionaryQueryForm } from "@/api/types"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, WandSparkles } from "lucide-react"
import WordForm from "./WordForm"
import Loading from "@/components/Loading"
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
		<div className="border-t border-gray-100 dark:border-gray-700/50">
			{isExpand && (
				<div className="p-4 flex flex-wrap gap-2">
					{forms.map((f, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<WordForm key={i} {...f} />
					))}
				</div>
			)}

			<div className="px-4 pb-2">
				<Analyze result={analyzeResult} />
			</div>

			<div className="px-4 py-2 flex justify-end items-center gap-3 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-800/30">
				{analyzeLoading ? (
					<Loading size={16} />
				) : (
					<button
						type="button"
						onClick={onAnalyze}
						className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
					>
						<WandSparkles
							size={14}
							className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors transform group-hover:scale-110"
						/>
					</button>
				)}

				{forms.length > 0 && (
					<button
						type="button"
						onClick={toggle}
						className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
					>
						<ChevronDown
							size={14}
							className={`text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-all transform group-hover:scale-110 ${
								isExpand ? "rotate-180" : ""
							}`}
						/>
					</button>
				)}
			</div>
		</div>
	)
}
