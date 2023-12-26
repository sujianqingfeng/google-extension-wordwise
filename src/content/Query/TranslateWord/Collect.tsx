import { MdFavorite, MdFavoriteBorder } from 'react-icons/md'

type CollectProps = {
  onCollect: (next: boolean) => void
  isCollected: boolean
}

export default function Collect(props: CollectProps) {
  const { onCollect, isCollected } = props
  const onClick = () => {
    onCollect(!isCollected)
  }

  return (
    <button onClick={onClick}>
      {isCollected ? <MdFavorite size={20} /> : <MdFavoriteBorder size={20} />}
    </button>
  )
}
