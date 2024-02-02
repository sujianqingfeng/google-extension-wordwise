import { TbVolume } from 'react-icons/tb'

type PhoneticProps = {
  label: string
  phonetic?: string
  speech?: string
}
export default function Phonetic(props: PhoneticProps) {
  const { phonetic, label, speech } = props

  if (!phonetic) {
    return null
  }

  const onPlay = () => {
    if (!speech) {
      return
    }
    const newSpeech = speech.replace(
      'https://dict.youdao.com',
      `${BASE_URL}/yd`
    )
    const audio = new Audio(newSpeech)
    audio.play()
  }

  return (
    <div className="flex items-center text-sm gap-1">
      <span className="dark:text-gray-400">{label}</span>
      <div
        onClick={onPlay}
        className={`bg-gray-100 dark:bg-slate-400/10 rounded-full px-1 flex items-center gap-1 ${
          speech ? 'cursor-pointer' : ''
        }`}
      >
        {phonetic}
        {speech && <TbVolume size={12} />}
      </div>
    </div>
  )
}
