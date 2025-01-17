import { createBackgroundMessage } from "@/messaging/background"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState, useCallback } from "react"
import { Volume2 } from "lucide-react"
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
		<div className="flex items-center gap-2 text-sm">
			{phonetic && (
				<button
					type="button"
					onClick={onToggle}
					className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
				>
					{currentType}
				</button>
			)}

			{phonetic && (
				<span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
					{phonetic}
				</span>
			)}

			<button
				type="button"
				onClick={onPlay}
				className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors"
			>
				<Volume2 size={14} />
			</button>

			<button
				type="button"
				onClick={onEdgeTTSPlay}
				className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors"
			>
				<Volume2 size={14} />
			</button>
		</div>
	)
}
