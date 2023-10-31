import Favorite from '../../assets/favorite.svg?react'
import FavoriteFilled from '../../assets/favorite-filled.svg?react'

type CollectProps = {
  onCollect: (next: boolean) => void
  isCollected: boolean
}

export default function Collect(props: CollectProps) {
  const { onCollect, isCollected } = props
  const onClick = () => {
    onCollect(!isCollected)
  }

  const style = {
    width: '20px',
    height: '20px'
  }
  return (
    <button onClick={onClick}>
      {isCollected ? (
        <FavoriteFilled style={style} />
      ) : (
        <Favorite style={style} />
      )}
    </button>
  )
}
