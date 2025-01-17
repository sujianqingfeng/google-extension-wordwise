import Loading from "@/components/Loading"
import { ErrorBoundary, type FallbackProps } from "react-error-boundary"
import { WandSparkles, Volume2, Copy } from "lucide-react"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createBackgroundMessage } from "@/messaging/background"
import { onBackgroundMessage, sendBackgroundMessage } from "@/messaging/content"
import { useCallback, useEffect, useRef, useState } from "react"
import Analyze from "@/components/Analyze"

const bgs = createBackgroundMessage()

type TranslateTextProps = {
	text: string
}
function TranslateText({ text }: TranslateTextProps) {
	const { data: translateResult } = useSuspenseQuery({
		queryKey: ["translate", text],
		queryFn: () => bgs.fetchAiTranslate({ text, provider: "deepSeek" }),
	})
	const [analyzeResult, setAnalyzeResult] = useState("")
	const [analyzeLoading, setAnalyzeLoading] = useState(false)
	const removeCallback = useRef<() => void>()

	const onAnalyze = async () => {
		setAnalyzeLoading(true)
		sendBackgroundMessage("analyzeGrammar", text)
	}

	const { refetch: fetchAudioBase64FromEdgeTTS } = useQuery({
		queryKey: ["edge-tts", text],
		queryFn: () => bgs.fetchAudioBase64FromEdgeTTS(text),
		enabled: false,
	})

	const onEdgeTTSPlay = useCallback(async () => {
		const { error, data } = await fetchAudioBase64FromEdgeTTS()
		if (error || !data) {
			return
		}
		playAudioByUrl(data)
	}, [fetchAudioBase64FromEdgeTTS])

	const onSystemTTS = () => {
		const msg = new SpeechSynthesisUtterance(text)
		msg.lang = "en-GB"
		msg.rate = 0.6
		msg.volume = 1
		window.speechSynthesis.speak(msg)
	}

	const onCopy = () => {
		navigator.clipboard.writeText(text)
	}

	useEffect(() => {
		if (analyzeLoading) {
			removeCallback.current = onBackgroundMessage(
				"analyzeGrammarResult",
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
		<div className="text-[13px] font-normal dark:text-gray-300 text-gray-700">
			<div className="px-4 py-3 space-y-3">
				<div className="leading-relaxed">{text}</div>
				<div className="leading-relaxed text-gray-600 dark:text-gray-400">
					{translateResult}
				</div>
			</div>
			<Analyze result={analyzeResult} />
			<div className="px-4 py-2.5 flex justify-end bg-gray-50 dark:bg-slate-800/40 gap-3 border-t border-gray-100 dark:border-gray-700/50">
				<Copy
					onClick={onCopy}
					size={15}
					className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
				/>
				<Volume2
					onClick={onEdgeTTSPlay}
					size={15}
					className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
				/>
				{analyzeLoading ? (
					<Loading size={15} />
				) : (
					<WandSparkles
						size={15}
						className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
						onClick={onAnalyze}
					/>
				)}
			</div>
		</div>
	)
}

function fallbackRender({ error }: FallbackProps) {
	return (
		<div className="p-2">
			<p>Something went wrong:</p>
			<pre className="text-red">{error.message}</pre>
		</div>
	)
}

function TranslateTextErrorWrapper({ text }: TranslateTextProps) {
	return (
		<ErrorBoundary fallbackRender={fallbackRender}>
			<TranslateText text={text} />
		</ErrorBoundary>
	)
}

export default TranslateTextErrorWrapper
