import { createBackgroundMessage } from "@/messaging/background"
import { useState } from "react"
import { TbVolume } from "react-icons/tb"

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
	ukSpeech,
	usPhonetic,
	usSpeech,
	word,
}: PhoneticProps) {
	const [currentType, setCurrentType] = useState(type)

	const speech = currentType === "uk" ? ukSpeech : usSpeech
	const phonetic = currentType === "uk" ? ukPhonetic : usPhonetic

	const onPlay = async () => {
		const base64 = await bgs.fetchAudioBase64FromUrl(
			word,
			currentType === "uk" ? "1" : "2",
		)
		const buffer = await fetch(base64).then((res) => res.arrayBuffer())
		const audioContext = new AudioContext()
		const audioBuffer = await audioContext.decodeAudioData(buffer)
		const source = audioContext.createBufferSource()
		source.buffer = audioBuffer
		source.connect(audioContext.destination)
		source.start()
	}

	const onToggle = () => {
		setCurrentType((prev) => (prev === "uk" ? "us" : "uk"))
	}

	return (
		<div className="flex items-center text-sm gap-1 text-black font-normal">
			<div
				onClick={onPlay}
				className={`bg-gray-100 dark:bg-slate-400/10 dark:text-gray-400 rounded-full px-1 flex items-center gap-1 ${
					speech ? "cursor-pointer" : ""
				}`}
			>
				{phonetic}
				<TbVolume size={12} />
			</div>

			{phonetic && (
				<p onClick={onToggle} className="dark:text-gray-400 cursor-pointer">
					{currentType}
				</p>
			)}
		</div>
	)
}
