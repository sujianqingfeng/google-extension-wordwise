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
			{isExpand && forms.length > 0 && (
				<div className="px-3 py-2 border-t border-gray-100 dark:border-gray-700/50">
					<div className="flex gap-1.5 flex-wrap">
						{forms.map((form) => (
							<WordForm key={form.name} {...form} />
						))}
					</div>
				</div>
			)}

			<Analyze result={analyzeResult} />

			<div className="px-3 py-1.5 flex justify-end items-center gap-2 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-800/30">
				{analyzeLoading ? (
					<Loading size={14} />
				) : (
					<button
						type="button"
						onClick={onAnalyze}
						className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
					>
						<WandSparkles
							size={12}
							className="text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors transform group-hover:scale-110"
						/>
					</button>
				)}

				{forms.length > 0 && (
					<button
						type="button"
						onClick={toggle}
						className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
					>
						<ChevronDown
							size={12}
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
