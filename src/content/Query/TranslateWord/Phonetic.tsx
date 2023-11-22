import Volume from '../../../assets/volume.svg?react'
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
    const audio = new Audio(speech)
    audio.play()
  }

  return (
    <div className="flex items-center text-sm gap-1">
      <span className="">{label}</span>
      <div
        onClick={onPlay}
        className={`bg-gray-100 rounded-full px-1 flex items-center gap-1 ${
          speech ? 'cursor-pointer' : ''
        }`}
      >
        {phonetic}
        {speech && <Volume height={12} width={12} />}
      </div>
    </div>
  )
}
