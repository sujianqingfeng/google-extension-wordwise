import { createBackgroundMessage } from "@/messaging/background"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState, useCallback } from "react"
import { Volume2, RotateCcw } from "lucide-react"
import { playAudioByUrl } from "@/utils/audio"

const bgs = createBackgroundMessage()

type PhoneticProps = {
	type: "uk" | "us"
	ukPhonetic?: string
	ukSpeech?: string
	usPhonetic?: string
	usSpeech?: string
	word: string
}

export default function Phonetic({
	type,
	ukPhonetic,
	usPhonetic,
	word,
}: PhoneticProps) {
	const [currentType, setCurrentType] = useState(type)

	const phonetic = currentType === "uk" ? ukPhonetic : usPhonetic

	const { refetch: fetchAudioBase64FromDictionUrl } = useQuery({
		queryKey: ["pronounce", word, currentType],
		queryFn: () =>
			bgs.fetchAudioBase64FromDictionUrl(
				word,
				currentType === "uk" ? "1" : "2",
			),
		enabled: false,
	})

	const { refetch: fetchAudioBase64FromEdgeTTS } = useQuery({
		queryKey: ["edge-tts", word],
		queryFn: () => bgs.fetchAudioBase64FromEdgeTTS(word),
		enabled: false,
	})

	const onPlay = useCallback(async () => {
		const { error, data } = await fetchAudioBase64FromDictionUrl()
		if (error || !data) {
			return
		}
		playAudioByUrl(data)
	}, [fetchAudioBase64FromDictionUrl])

	const onEdgeTTSPlay = useCallback(async () => {
		const { error, data } = await fetchAudioBase64FromEdgeTTS()
		if (error || !data) {
			return
		}
		playAudioByUrl(data)
	}, [fetchAudioBase64FromEdgeTTS])

	const onToggle = () => {
		setCurrentType((prev) => (prev === "uk" ? "us" : "uk"))
	}

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.ctrlKey && event.key === "s") {
				event.preventDefault()
				onPlay()
			}
		}
		window.addEventListener("keydown", onKeyDown)
		return () => {
			window.removeEventListener("keydown", onKeyDown)
		}
	}, [onPlay])

	return (
		<div className="flex items-center gap-1">
			{/* 音标和切换按钮组合 */}
			{phonetic && (
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={onToggle}
						className="px-1.5 py-0.5 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded border border-amber-200/50 dark:border-amber-700/50 hover:bg-amber-100 dark:hover:bg-amber-800/30 transition-colors flex items-center gap-1"
					>
						<span className="text-xs text-amber-800 dark:text-amber-300 font-mono">
							/{phonetic}/
						</span>
						<RotateCcw
							size={10}
							className="text-amber-600 dark:text-amber-400"
						/>
					</button>
				</div>
			)}

			{/* 播放按钮 */}
			<button
				type="button"
				onClick={onPlay}
				className="w-5 h-5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 rounded transition-colors flex items-center justify-center"
				aria-label="播放发音"
			>
				<Volume2 size={10} className="text-blue-600 dark:text-blue-400" />
			</button>
		</div>
	)
}
