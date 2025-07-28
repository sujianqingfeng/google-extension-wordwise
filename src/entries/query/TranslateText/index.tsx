import { ErrorBoundary, type FallbackProps } from "react-error-boundary"
import {
	WandSparkles,
	Volume2,
	Copy,
	Languages,
	MessageSquare,
	AlertCircle,
} from "lucide-react"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createBackgroundMessage } from "@/messaging/background"
import { onBackgroundMessage, sendBackgroundMessage } from "@/messaging/content"
import { useCallback, useEffect, useRef, useState } from "react"
import Analyze from "@/components/Analyze"
import Button from "@/components/Button"
import { playAudioByUrl } from "@/utils/audio"

const bgs = createBackgroundMessage()

type TranslateTextProps = {
	text: string
}

function TranslateText({ text }: TranslateTextProps) {
	const { data: translateResult } = useSuspenseQuery({
		queryKey: ["translate", text],
		queryFn: () => bgs.fetchAiTranslate({ text, provider: "openai" }),
	})
	const [analyzeResult, setAnalyzeResult] = useState("")
	const [analyzeLoading, setAnalyzeLoading] = useState(false)
	const [copySuccess, setCopySuccess] = useState(false)
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

	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(text)
			setCopySuccess(true)
			setTimeout(() => setCopySuccess(false), 2000)
		} catch (error) {
			console.error("复制失败:", error)
		}
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
		<div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-soft ring-1 ring-gray-200/50 dark:ring-gray-700/50 overflow-hidden hover-glow animate-slide-in-up">
			{/* 头部区域 */}
			<div className="p-4 bg-gradient-to-r from-blue-50/30 via-white to-blue-50/30 dark:from-blue-900/10 dark:via-slate-800 dark:to-blue-900/10 border-b border-gray-200/30 dark:border-gray-700/30">
				<div className="flex items-center gap-3">
					{/* 翻译图标 */}
					<div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-soft">
						<Languages size={20} className="text-white" />
					</div>

					<div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							文本翻译
						</h3>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							AI 智能翻译
						</p>
					</div>
				</div>
			</div>

			{/* 原文区域 */}
			<div className="p-4 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/30 dark:border-gray-700/30">
				<div className="flex items-start gap-3">
					<div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
						<MessageSquare
							size={16}
							className="text-blue-600 dark:text-blue-400"
						/>
					</div>
					<div className="flex-1">
						<p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
							原文
						</p>
						<p className="text-gray-800 dark:text-gray-200 leading-relaxed">
							{text}
						</p>
					</div>
				</div>
			</div>

			{/* 译文区域 */}
			<div className="p-4 border-b border-gray-200/30 dark:border-gray-700/30">
				<div className="flex items-start gap-3">
					<div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
						<Languages
							size={16}
							className="text-green-600 dark:text-green-400"
						/>
					</div>
					<div className="flex-1">
						<p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
							译文
						</p>
						<p className="text-gray-800 dark:text-gray-200 leading-relaxed">
							{translateResult}
						</p>
					</div>
				</div>
			</div>

			{/* 分析结果 */}
			<Analyze result={analyzeResult} />

			{/* 操作按钮区域 */}
			<div className="p-4 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-700/80">
				<div className="flex justify-end items-center gap-2">
					{/* 复制按钮 */}
					<Button
						variant="ghost"
						size="sm"
						onClick={onCopy}
						className={`transition-colors duration-200 ${
							copySuccess ? "text-green-600 dark:text-green-400" : ""
						}`}
						leftIcon={<Copy size={14} />}
					>
						{copySuccess ? "已复制" : "复制"}
					</Button>

					{/* 语音播放按钮 */}
					<Button
						variant="ghost"
						size="sm"
						onClick={onEdgeTTSPlay}
						leftIcon={<Volume2 size={14} />}
					>
						播放
					</Button>

					{/* 语法分析按钮 */}
					<Button
						variant="ghost"
						size="sm"
						loading={analyzeLoading}
						onClick={onAnalyze}
						leftIcon={!analyzeLoading && <WandSparkles size={14} />}
					>
						{analyzeLoading ? "分析中..." : "语法分析"}
					</Button>
				</div>
			</div>
		</div>
	)
}

function fallbackRender({ error }: FallbackProps) {
	return (
		<div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-soft ring-1 ring-red-200/50 dark:ring-red-700/50 overflow-hidden animate-slide-in-up">
			<div className="p-4">
				<div className="flex items-center gap-3 text-red-600 dark:text-red-400">
					<AlertCircle size={20} />
					<div>
						<p className="font-medium">翻译出错了</p>
						<p className="text-sm text-red-500 dark:text-red-400 mt-1">
							{error.message}
						</p>
					</div>
				</div>
			</div>
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
