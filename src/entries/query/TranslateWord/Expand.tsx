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
		<div>
			{isExpand && (
				<div className="p-2 flex gap-2 flex-wrap text-black">
					{forms.map((f, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						<WordForm key={i} {...f} />
					))}
				</div>
			)}

			<div className="px-2 pb-2 text-[12px]">
				<Analyze result={analyzeResult} />
			</div>

			<div className="p-1 flex justify-end items-center gap-[10px] bg-gray-100 dark:bg-slate-400/10">
				{analyzeLoading ? (
					<Loading size={14} />
				) : (
					<WandSparkles
						size={13}
						className="cursor-pointer dark:text-gray-400 text-black"
						onClick={onAnalyze}
					/>
				)}

				{forms.length > 0 && (
					<ChevronDown
						size={14}
						className={`cursor-pointer dark:text-gray-400 text-black  transition-transform " 
						${isExpand ? "rotate-180" : ""}`}
						onClick={toggle}
					/>
				)}
			</div>
		</div>
	)
}
