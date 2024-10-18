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

	const { refetch: fetchAudioBase64FromUrl } = useQuery({
		queryKey: ["pronounce", word, currentType],
		queryFn: () =>
			bgs.fetchAudioBase64FromUrl(word, currentType === "uk" ? "1" : "2"),
		enabled: false,
	})

	const onPlay = useCallback(async () => {
		const { error, data } = await fetchAudioBase64FromUrl()
		if (error || !data) {
			return
		}
		playAudioByUrl(data)
	}, [fetchAudioBase64FromUrl])

	const onToggle = () => {
		setCurrentType((prev) => (prev === "uk" ? "us" : "uk"))
	}

	const onSystemTTS = () => {
		const msg = new SpeechSynthesisUtterance(word)
		msg.lang = currentType === "uk" ? "en-GB" : "en-US"
		msg.rate = 0.6
		msg.volume = 1
		window.speechSynthesis.speak(msg)
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
		<div className="flex items-center text-[10px] gap-[5px] text-black font-normal">
			{phonetic && (
				<p onClick={onToggle} className="dark:text-gray-400 cursor-pointer">
					{currentType}
				</p>
			)}

			<div className="bg-gray-100 dark:bg-slate-400/10 dark:text-gray-400 px-2 rounded-full">
				{phonetic}
			</div>

			<div
				onClick={onPlay}
				className="bg-gray-100 dark:bg-slate-400/10 dark:text-gray-400 rounded-full h-5 w-5 flex justify-center items-center cursor-pointer"
			>
				<Volume2 size={12} />
			</div>

			<div
				onClick={onSystemTTS}
				className="bg-gray-100 dark:bg-slate-400/10 dark:text-gray-400 rounded-full h-5 w-5 flex justify-center items-center cursor-pointer"
			>
				<Volume2 size={12} />
			</div>
		</div>
	)
}
