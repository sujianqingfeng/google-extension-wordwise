import { useState } from "react"
import { TbVolume } from "react-icons/tb"

type PhoneticProps = {
	type: "uk" | "us"
	ukPhonetic?: string
	ukSpeech?: string
	usPhonetic?: string
	usSpeech?: string
}
export default function Phonetic({
	type,
	ukPhonetic,
	ukSpeech,
	usPhonetic,
	usSpeech,
}: PhoneticProps) {
	const [currentType, setCurrentType] = useState(type)

	const speech = currentType === "uk" ? ukSpeech : usSpeech
	const phonetic = currentType === "uk" ? ukPhonetic : usPhonetic

	const onPlay = () => {
		if (!speech) {
			return
		}
		const audio = new Audio(speech)
		audio.play()
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
				{speech && <TbVolume size={12} />}
			</div>

			<p onClick={onToggle} className="dark:text-gray-400 cursor-pointer">
				{currentType}
			</p>
		</div>
	)
}
